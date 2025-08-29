import { evalite } from "evalite"
import { ExecutionScorer } from "../lib/scorers/execution-scorer"

evalite("TSCircuit Comprehensive Test", {
  data: async () => [
    {
      input: "Create a simple LED circuit",
    },
    {
      input: "Create invalid circuit with syntax errors",
    },
    {
      input: "Create circuit with deprecated coordinates",
    },
    {
      input: "Create proper microcontroller circuit",
    }
  ],
  task: async (input) => {
    // Simulate LLM outputs based on input
    if (input.includes("simple LED circuit")) {
      return `export default () => (
  <board width="20mm" height="20mm">
    <resistor name="R1" resistance="220ohm" footprint="0402" />
    <led name="LED1" color="red" footprint="0603" />
    <trace from=".R1 .pin1" to=".LED1 .anode" />
    <trace from=".LED1 .cathode" to=".R1 .pin2" />
  </board>
)`
    } else if (input.includes("invalid circuit")) {
      return `export default () => (
  <board>
    <invalidcomponent name="X1" />
    <resistor resistance="invalid" />
    <trace from="nowhere" to="somewhere" />
  </board>
)`
    } else if (input.includes("deprecated coordinates")) {
      return `export default () => (
  <board>
    <resistor name="R1" pcbX="5mm" pcbY="10mm" resistance="1k" />
    <capacitor name="C1" pcbX="15mm" pcbY="10mm" capacitance="100nF" />
  </board>
)`
    } else if (input.includes("microcontroller")) {
      return `export default () => (
  <board width="40mm" height="30mm">
    <chip
      name="U1"
      footprint="tqfp48"
      manufacturerPartNumber="STM32F103C8T6"
      pinLabels={{
        pin1: "VBAT",
        pin7: "NRST",
        pin23: "VSS1",
        pin24: "VDD1"
      }}
      connections={{
        VBAT: "net.VCC",
        VSS1: "net.GND",
        VDD1: "net.VCC"
      }}
    />
    <capacitor name="C1" capacitance="100nF" footprint="0402" />
    <resistor name="R1" resistance="10k" footprint="0402" />
  </board>
)`
    }
    
    return "// Default circuit"
  },
  scorers: [ExecutionScorer],
})