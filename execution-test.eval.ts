import { evalite } from "evalite"
import { ExecutionScorer } from "./lib/scorers/execution-scorer"

evalite("TSCircuit Execution Test", {
  data: async () => [
    {
      input: "Simple LED circuit",
      expected: `export default () => (
  <board width="20mm" height="20mm">
    <resistor name="R1" resistance="220ohm" footprint="0402" />
    <led name="LED1" color="red" footprint="0603" />
    <trace from=".R1 .pin1" to=".LED1 .anode" />
    <trace from=".LED1 .cathode" to=".R1 .pin2" />
  </board>
)`,
    },
    {
      input: "Invalid syntax test",
      expected: `export default () => (
  <board>
    <invalidcomponent name="X1" />
  </board>
)`,
    }
  ],
  task: async (input) => {
    return input.expected
  },
  scorers: [ExecutionScorer],
})