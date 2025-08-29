import { evalite } from "evalite"
import { ExecutionScorer } from "../lib/scorers/execution-scorer"
import {
  runPromptToGenerateTscircuit,
  type RunPromptToGenerateTscircuitResult,
} from "../lib/run-prompt-to-generate-tscircuit"
import { createSnippetUrl } from "@tscircuit/create-snippet-url"

evalite<string, RunPromptToGenerateTscircuitResult>("555 timer", {
  data: async () => [
    {
      input: "Create a simple 555 timer circuit that creates a square wave",
    },
  ],
  task: async (input) => {
    return await runPromptToGenerateTscircuit(input)
  },
  columns: async ({ output }) => [
    {
      label: "Snippet",
      value: `[Snippet](${output.snippetUrl})`,
    },
  ],
  scorers: [ExecutionScorer],
})
