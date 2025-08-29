export interface CircuitJsonError {
  path: string
  type: string
  message: string
  element_type: string
}

export interface CircuitJsonWarning {
  path: string
  type: string
  message: string
  element_type: string
}

export interface CircuitJsonAnalysis {
  errors: CircuitJsonError[]
  warnings: CircuitJsonWarning[]
  issuesAsString: string
  hasErrorsOrWarnings: boolean
}

export function getCircuitJsonErrorsAndWarnings(
  circuitJson: any,
): CircuitJsonAnalysis {
  const warnings: CircuitJsonWarning[] = []
  const errors: CircuitJsonError[] = []

  const analyzeElement = (element: any, path = "root") => {
    if (Array.isArray(element)) {
      for (let index = 0; index < element.length; index++) {
        analyzeElement(element[index], `${path}[${index}]`)
      }
    } else if (element && typeof element === "object") {
      // Check for warning_type or error_type fields
      if (element.warning_type) {
        warnings.push({
          path,
          type: element.warning_type,
          message:
            element.warning_message || element.message || "Unknown warning",
          element_type: element.type || "unknown",
        })
      }

      if (element.error_type) {
        errors.push({
          path,
          type: element.error_type,
          message: element.error_message || element.message || "Unknown error",
          element_type: element.type || "unknown",
        })
      }

      // Recursively analyze nested objects
      for (const key of Object.keys(element)) {
        if (typeof element[key] === "object" && element[key] !== null) {
          analyzeElement(element[key], `${path}.${key}`)
        }
      }
    }
  }

  analyzeElement(circuitJson)

  const hasErrorsOrWarnings = errors.length > 0 || warnings.length > 0

  const issuesAsString = [
    ...errors.map((e) => `${e.type}: ${e.message}`),
    ...warnings.map((w) => `${w.type}: ${w.message}`),
  ].join("\n")

  return {
    errors,
    warnings,
    issuesAsString,
    hasErrorsOrWarnings,
  }
}
