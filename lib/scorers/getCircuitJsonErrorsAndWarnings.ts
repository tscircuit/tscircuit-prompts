import type { AnyCircuitElement } from "circuit-json"

export interface CircuitJsonAnalysis {
  errors: AnyCircuitElement[]
  warnings: AnyCircuitElement[]
  issuesAsString: string
  hasErrorsOrWarnings: boolean
}

export function getCircuitJsonErrorsAndWarnings(
  circuitJson: any,
): CircuitJsonAnalysis {
  console.log({ circuitJson })
  const warnings: AnyCircuitElement[] = []
  const errors: AnyCircuitElement[] = []

  const analyzeElement = (element: AnyCircuitElement): any => {
    if ("warning_type" in element && element.warning_type) {
      warnings.push(element)
    }

    if ("error_type" in element && element.error_type) {
      errors.push(element)
    }
  }

  for (const elm of circuitJson) {
    analyzeElement(elm)
  }

  const hasErrorsOrWarnings = errors.length > 0 || warnings.length > 0

  const issuesAsString = [
    ...errors.map((e) => `${e.type}: ${(e as any).message}`),
    ...warnings.map((w) => `${w.type}: ${(w as any).message}`),
  ].join("\n\n")

  return {
    errors,
    warnings,
    issuesAsString,
    hasErrorsOrWarnings,
  }
}
