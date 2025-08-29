import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { createScorer } from "evalite"
import { z } from "zod"

const circuitValidationSchema = z.object({
  has_invalid_element: z.boolean().describe("True if the circuit contains invalid or unsupported TSCircuit elements"),
  uses_xy_coordinates: z.boolean().describe("True if the circuit uses raw x/y coordinates instead of proper TSCircuit layout"),
  missing_connection: z.boolean().describe("True if there are components that should be connected but aren't"),
  has_syntax_errors: z.boolean().describe("True if there are TSX/TypeScript syntax errors in the code"),
  improper_component_usage: z.boolean().describe("True if components are used incorrectly (wrong props, missing required props)"),
  missing_required_props: z.boolean().describe("True if components are missing essential props like name, footprint, etc."),
  invalid_footprint: z.boolean().describe("True if footprint names are invalid or non-existent"),
  improper_trace_connections: z.boolean().describe("True if trace connections use invalid selectors or references"),
  uses_deprecated_syntax: z.boolean().describe("True if the code uses deprecated TSCircuit syntax or patterns"),
  has_logical_errors: z.boolean().describe("True if the circuit has logical issues (shorts, missing power, etc.)"),
  rationale: z.string().describe("Detailed explanation of the validation findings and any issues identified"),
})

export const AICircuitValidator = createScorer<string, string>({
  name: "AI Circuit Validator",
  description: "Validates TSCircuit code using AI with comprehensive boolean flags",
  scorer: async ({ input, output }) => {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      prompt: `
        You are an expert TSCircuit validator. Analyze the following TSCircuit code and determine if it's valid.

        TSCircuit code to validate:
        \`\`\`tsx
        ${output}
        \`\`\`

        Context/prompt that generated this code:
        \`\`\`
        ${input}
        \`\`\`

        Check for the following issues:
        1. Invalid elements - components that don't exist in TSCircuit
        2. Raw x/y coordinates - TSCircuit prefers layout helpers over manual positioning
        3. Missing connections - components that should be connected but aren't
        4. Syntax errors - TypeScript/TSX compilation issues
        5. Improper component usage - wrong props or usage patterns
        6. Missing required props - essential props like name, footprint missing
        7. Invalid footprints - footprint names that don't exist
        8. Improper trace connections - invalid from/to selectors
        9. Deprecated syntax - old patterns that should be updated
        10. Logical errors - electrical issues like shorts, missing power

        For each boolean flag, return true if the issue exists, false if it doesn't.
        Provide a detailed rationale explaining your findings.
      `,
      schema: circuitValidationSchema,
    })

    // Calculate score based on validation flags
    // Each false flag (no issue) contributes positively to the score
    const flags = [
      !object.has_invalid_element,
      !object.uses_xy_coordinates,
      !object.missing_connection,
      !object.has_syntax_errors,
      !object.improper_component_usage,
      !object.missing_required_props,
      !object.invalid_footprint,
      !object.improper_trace_connections,
      !object.uses_deprecated_syntax,
      !object.has_logical_errors,
    ]

    const score = flags.filter(Boolean).length / flags.length

    return {
      score,
      metadata: {
        validation_flags: {
          has_invalid_element: object.has_invalid_element,
          uses_xy_coordinates: object.uses_xy_coordinates,
          missing_connection: object.missing_connection,
          has_syntax_errors: object.has_syntax_errors,
          improper_component_usage: object.improper_component_usage,
          missing_required_props: object.missing_required_props,
          invalid_footprint: object.invalid_footprint,
          improper_trace_connections: object.improper_trace_connections,
          uses_deprecated_syntax: object.uses_deprecated_syntax,
          has_logical_errors: object.has_logical_errors,
        },
        rationale: object.rationale,
        issues_found: flags.filter(f => !f).length,
        total_checks: flags.length,
      },
    }
  },
})