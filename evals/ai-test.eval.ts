import { evalite } from "evalite"
import { AICircuitValidator } from "../lib/scorers/ai-circuit-validator"

evalite("tscircuit AI Validation Test", {
  data: async () => [
    {
      input: "Create a simple LED circuit",
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
      input: "Create invalid circuit",
      expected: `export default () => (
  <board>
    <invalidcomponent name="X1" />
    <resistor resistance="invalid" />
  </board>
)`,
    },
  ],
  task: async (input) => {
    return input.expected
  },
  scorers: [AICircuitValidator],
})
