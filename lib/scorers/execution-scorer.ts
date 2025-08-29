import { createScorer } from "evalite"
import { reportTrace } from "evalite/traces"
import { getCircuitJsonErrorsAndWarnings } from "./getCircuitJsonErrorsAndWarnings"
import type { RunPromptToGenerateTscircuitResult } from "../run-prompt-to-generate-tscircuit"

// Flag to switch between old and new compilation methods
const USE_LOCAL_EVAL = process.env.USE_LOCAL_EVAL === "true"

async function compileWithRemoteApi(code: string) {
  const response = await fetch("https://compile.tscircuit.com/compile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fs_map: {
        "main.circuit.tsx": code,
      },
    }),
  })

  if (!response.ok) {
    const responseBody = await response.json().catch((e) => ({
      error_code: "unknown",
      error_message: "Unknown error",
    }))
    return {
      circuitJson: [],
      error: (responseBody as any).error,
    }
  }

  const result = await response.json()
  return result
}

async function compileWithLocalEval(code: string) {
  // Import CircuitRunner dynamically to avoid startup issues
  const { CircuitRunner } = await import("@tscircuit/eval")
  const runner = new CircuitRunner()

  // Execute the tscircuit code
  let error: any
  await runner
    .executeWithFsMap({
      fsMap: {
        "main.circuit.tsx": code,
      },
    })
    .catch((err) => {
      error = err
      console.error(err)
    })

  return {
    circuitJson: await runner.getCircuitJson(),
    error,
  }
}

export const ExecutionScorer = createScorer<
  string,
  RunPromptToGenerateTscircuitResult
>({
  name: "tscircuit Execution Scorer",
  description:
    "Executes tscircuit code and captures traces with error information",
  scorer: async ({ input, output }) => {
    const start = performance.now()

    try {
      let result: any

      if (USE_LOCAL_EVAL) {
        result = await compileWithLocalEval(output.code)
      } else {
        try {
          const compileResult = (await compileWithRemoteApi(output.code)) as any
          result = {
            circuitJson:
              compileResult.circuit_json || compileResult.circuitJson,
            error: compileResult.error || null,
          }
        } catch (apiError) {
          result = {
            circuitJson: null,
            error: apiError,
          }
        }
      }

      const end = performance.now()

      // Report trace with execution details
      reportTrace({
        start,
        end,
        input: [{ role: "user", content: input }],
        output: result?.error
          ? `Error: ${result.error.message}`
          : "Circuit executed successfully",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
        },
      })

      // Check for execution errors
      if (result?.error) {
        return {
          score: 0,
          metadata: {
            execution_successful: false,
            error: result.error.message || result.error.toString(),
            error_type: "execution_error",
            warnings: [],
            errors: [{ type: "execution", message: result.error.message }],
            execution_time: end - start,
          },
        }
      }

      // Get the circuit JSON and ensure it's serializable
      const circuitJson = JSON.parse(JSON.stringify(result.circuitJson))

      // Analyze circuit JSON for warnings and errors
      const { errors, warnings, issuesAsString } =
        getCircuitJsonErrorsAndWarnings(circuitJson)

      reportTrace({
        start,
        end,
        input: [{ role: "user", content: input }],
        output:
          issuesAsString || "Circuit executed successfully with no issues",
        usage: {
          promptTokens: 0,
          completionTokens: 0,
        },
      })

      // Calculate score based on execution success and issues found
      let score = 1.0 // Start with perfect score

      // Deduct points for errors and warnings
      score -= errors.length * 0.3 // 30% penalty per error
      score -= warnings.length * 0.1 // 10% penalty per warning

      // Ensure score doesn't go below 0
      score = Math.max(0, score)

      return {
        score,
        metadata: {
          execution_successful: true,
          error: null,
          error_type: null,
          warnings,
          errors,
          warning_count: warnings.length,
          error_count: errors.length,
          total_elements: Array.isArray(circuitJson) ? circuitJson.length : 1,
          execution_time: end - start,
        },
      }
    } catch (error) {
      const end = performance.now()

      // Report trace for failed execution
      reportTrace({
        start,
        end,
        input: [{ role: "user", content: input }],
        output: `Runtime error: ${error instanceof Error ? error.message : String(error)}`,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
        },
      })

      return {
        score: 0,
        metadata: {
          execution_successful: false,
          error: error instanceof Error ? error.message : String(error),
          error_type: "runtime_error",
          warnings: [],
          errors: [
            {
              type: "runtime",
              message: error instanceof Error ? error.message : String(error),
            },
          ],
          execution_time: end - start,
        },
      }
    }
  },
})
