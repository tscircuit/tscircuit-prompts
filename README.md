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

3. Run the evaluations:
```bash
# Run all working evals
bun run evalite evals/comprehensive-test.eval.ts evals/final-demo.eval.ts

# Or run a specific eval
bun run evalite evals/comprehensive-test.eval.ts

# Or use the dev script (runs all evals in watch mode)
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
import { AICircuitValidator, MockExecutionScorer } from "../lib/scorers"

evalite("My TSCircuit Eval", {
  data: async () => [
    {
      input: "Create a simple LED circuit"
    }
  ],
  task: async (input) => {
    // Your LLM call here
    return generateTSCircuitCode(input)
  },
  scorers: [AICircuitValidator, MockExecutionScorer]
})
```

## File Structure

- `lib/scorers/ai-circuit-validator.ts` - AI-based validation scorer
- `lib/scorers/execution-scorer.ts` - Runtime execution scorer (has dependency issues)
- `lib/scorers/mock-execution-scorer.ts` - Mock execution scorer (working)
- `evals/` - All evaluation test files
  - `comprehensive-test.eval.ts` - Main working test suite
  - `final-demo.eval.ts` - Demo with realistic examples
  - `ai-test.eval.ts` - AI validator only (requires OpenAI API key)
- `lib/prompts/tscircuit-syntax.ts` - TSCircuit syntax reference
