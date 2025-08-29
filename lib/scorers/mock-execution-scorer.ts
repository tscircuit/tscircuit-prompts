import { createScorer } from "evalite"

export const MockExecutionScorer = createScorer<string, string>({
  name: "Mock TSCircuit Execution Scorer", 
  description: "Simulates TSCircuit code execution without actually running it",
  scorer: async ({ input, output }) => {
    if (!output || typeof output !== 'string') {
      return {
        score: 0,
        metadata: {
          execution_successful: false,
          mock_execution: true,
          error: "No output provided",
          errors: ["No output provided"],
          warnings: []
        }
      }
    }
    try {
      // Simulate basic validation checks without actually executing
      let score = 1.0
      const errors: string[] = []
      const warnings: string[] = []
      
      // Check for obvious syntax issues
      if (output.includes("invalidcomponent")) {
        errors.push("Invalid component detected: invalidcomponent")
        score -= 0.5
      }
      
      if (output.includes('resistance="invalid"')) {
        errors.push("Invalid resistance value: invalid")
        score -= 0.3
      }
      
      if (!output.includes("export default")) {
        errors.push("Missing export default")
        score -= 0.2
      }
      
      if (!output.includes("<board")) {
        errors.push("Missing board element")
        score -= 0.4
      }
      
      // Check for deprecated patterns
      if (output.includes("pcbX") || output.includes("pcbY")) {
        warnings.push("Using deprecated pcbX/pcbY coordinates")
        score -= 0.1
      }
      
      // Ensure score doesn't go below 0
      score = Math.max(0, score)

      return {
        score,
        metadata: {
          execution_successful: true,
          mock_execution: true,
          errors,
          warnings,
          error_count: errors.length,
          warning_count: warnings.length,
          rationale: `Mock execution completed. Found ${errors.length} errors and ${warnings.length} warnings.`
        }
      }

    } catch (error) {
      return {
        score: 0,
        metadata: {
          execution_successful: false,
          mock_execution: true,
          error: error instanceof Error ? error.message : String(error),
          errors: [],
          warnings: []
        }
      }
    }
  },
})