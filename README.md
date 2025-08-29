# TSCircuit Prompt Evaluation

This project provides comprehensive evaluation tools for TSCircuit code generation using Evalite.

## Features

- **AI Circuit Validator**: Uses LLM to validate TSCircuit code with detailed boolean flags
- **Execution Scorer**: Actually runs the TSCircuit code and checks for errors/warnings
- **Comprehensive Testing**: Evaluates syntax, semantics, and runtime behavior

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create a `.env` file with your OpenAI API key:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the evaluation:
```bash
bun run dev
```

This will start the Evalite server and run the TSCircuit validation suite.

## Scorers

### AI Circuit Validator

Validates TSCircuit code using GPT-4 with the following boolean flags:
- `has_invalid_element`: Invalid/unsupported TSCircuit elements
- `uses_xy_coordinates`: Raw x/y coordinates instead of proper layout
- `missing_connection`: Missing connections between components
- `has_syntax_errors`: TypeScript/TSX syntax errors
- `improper_component_usage`: Incorrect component usage
- `missing_required_props`: Missing essential props
- `invalid_footprint`: Invalid footprint names
- `improper_trace_connections`: Invalid trace selectors
- `uses_deprecated_syntax`: Deprecated TSCircuit patterns
- `has_logical_errors`: Logical circuit issues

### Execution Scorer  

Executes the TSCircuit code using `@tscircuit/eval` and:
- Checks for runtime errors
- Analyzes circuit JSON for warnings/errors
- Looks for elements with `warning_type` or `error_type` fields
- Calculates score based on execution success and issue count

## Usage

The scorers can be imported and used in your own evaluations:

```typescript
import { AICircuitValidator, ExecutionScorer } from "./lib/scorers"

evalite("My TSCircuit Eval", {
  data: async () => [
    {
      input: "Create a simple LED circuit",
      output: "// Your TSCircuit code here"
    }
  ],
  task: async (input) => {
    // Your LLM call here
    return generateTSCircuitCode(input)
  },
  scorers: [AICircuitValidator, ExecutionScorer]
})
```

## File Structure

- `lib/scorers/ai-circuit-validator.ts` - AI-based validation scorer
- `lib/scorers/execution-scorer.ts` - Runtime execution scorer
- `tscircuit-validation.eval.ts` - Example evaluation with test cases
- `lib/prompts/tscircuit-syntax.ts` - TSCircuit syntax reference
