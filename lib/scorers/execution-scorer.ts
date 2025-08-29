import { CircuitRunner } from "@tscircuit/eval"
import { createScorer } from "evalite"

export const ExecutionScorer = createScorer<string, string>({
  name: "TSCircuit Execution Scorer",
  description: "Executes TSCircuit code and checks for runtime errors and warnings",
  scorer: async ({ input, output }) => {
    try {
      const runner = new CircuitRunner()
      
      // Execute the TSCircuit code
      const result = await runner.executeWithFsMap({
        fsMap: {
          "index.tsx": output
        }
      })

      // Check for execution errors
      if (result.error) {
        return {
          score: 0,
          metadata: {
            execution_successful: false,
            error: result.error.message || result.error.toString(),
            error_type: "execution_error",
            circuit_json: null,
            warnings: [],
            errors: []
          }
        }
      }

      // Get the circuit JSON
      const circuitJson = result.circuitJson || result.circuit

      if (!circuitJson) {
        return {
          score: 0.1,
          metadata: {
            execution_successful: true,
            error: "No circuit JSON generated",
            error_type: "no_output",
            circuit_json: null,
            warnings: [],
            errors: []
          }
        }
      }

      // Analyze circuit JSON for warnings and errors
      const warnings: any[] = []
      const errors: any[] = []
      
      const analyzeElement = (element: any, path = "root") => {
        if (Array.isArray(element)) {
          element.forEach((item, index) => analyzeElement(item, `${path}[${index}]`))
        } else if (element && typeof element === "object") {
          // Check for warning_type or error_type fields
          if (element.warning_type) {
            warnings.push({
              path,
              type: element.warning_type,
              message: element.warning_message || element.message || "Unknown warning",
              element_type: element.type || "unknown"
            })
          }
          
          if (element.error_type) {
            errors.push({
              path,
              type: element.error_type,
              message: element.error_message || element.message || "Unknown error",
              element_type: element.type || "unknown"
            })
          }

          // Recursively check nested objects
          Object.values(element).forEach((value, key) => {
            if (typeof value === "object" && value !== null) {
              analyzeElement(value, `${path}.${key}`)
            }
          })
        }
      }

      analyzeElement(circuitJson)

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
          circuit_json: circuitJson,
          warnings,
          errors,
          warning_count: warnings.length,
          error_count: errors.length,
          total_elements: Array.isArray(circuitJson) ? circuitJson.length : 1
        }
      }

    } catch (error) {
      return {
        score: 0,
        metadata: {
          execution_successful: false,
          error: error instanceof Error ? error.message : String(error),
          error_type: "runtime_error",
          circuit_json: null,
          warnings: [],
          errors: []
        }
      }
    }
  },
})