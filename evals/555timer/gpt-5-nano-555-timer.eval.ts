import { evalite } from "evalite"
import { ExecutionScorer } from "../../lib/scorers/execution-scorer"
import {
  runPromptToGenerateTscircuit,
  type RunPromptToGenerateTscircuitResult,
} from "../../lib/run-prompt-to-generate-tscircuit"
import { inputs } from "./inputs-555timer"

evalite<string, RunPromptToGenerateTscircuitResult>("gpt-5-nano 555 timer", {
  data: async () => inputs,
  task: async (input) => {
    return await runPromptToGenerateTscircuit(input, {
      model: "gpt-5-nano",
    })
  },
  columns: async ({ input, output }) => [
    {
      label: "Prompt",
      value: input,
    },
    {
      label: "Snippet",
      value: `[Snippet](${output.snippetUrl})`,
    },
  ],
  scorers: [ExecutionScorer],
})
