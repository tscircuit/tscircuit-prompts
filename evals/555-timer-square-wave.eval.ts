import { evalite } from "evalite"
import { ExecutionScorer } from "../lib/scorers/execution-scorer"
import { runPromptToGenerateTscircuit } from "../lib/run-prompt-to-generate-tscircuit"

evalite("555 timer", {
  data: async () => [
    {
      input: "Create a simple 555 timer circuit that creates a square wave",
    },
  ],
  task: async (input) => {
    return await runPromptToGenerateTscircuit(input)
  },
  scorers: [ExecutionScorer],
})
