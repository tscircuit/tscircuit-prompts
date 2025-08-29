import { evalite } from "evalite"
import { MockExecutionScorer } from "./lib/scorers/mock-execution-scorer"
// Uncomment the line below if you have an OpenAI API key configured
// import { AICircuitValidator } from "./lib/scorers/ai-circuit-validator"

evalite("TSCircuit Final Demo", {
  data: async () => [
    {
      input: "Create a simple LED blinker circuit with a 555 timer",
    },
    {
      input: "Create an invalid circuit with made-up components",
    },
    {
      input: "Create a microcontroller circuit with power supply",
    }
  ],
  task: async (input) => {
    // Simulate different quality LLM outputs
    if (input.includes("LED blinker")) {
      return `export default () => (
  <board width="30mm" height="25mm">
    <chip
      name="U1"
      footprint="dip8"
      pinLabels={{
        pin1: "GND",
        pin2: "TRIG", 
        pin3: "OUT",
        pin4: "RESET",
        pin5: "CTRL",
        pin6: "THRES",
        pin7: "DISCH",
        pin8: "VCC"
      }}
    />
    <resistor name="R1" resistance="10k" footprint="0402" />
    <resistor name="R2" resistance="220ohm" footprint="0402" />
    <capacitor name="C1" capacitance="10uF" footprint="0603" />
    <led name="LED1" color="red" footprint="0603" />
    <trace from=".U1 .OUT" to=".R2 .pin1" />
    <trace from=".R2 .pin2" to=".LED1 .anode" />
    <trace from=".LED1 .cathode" to=".U1 .GND" />
  </board>
)`
    } else if (input.includes("invalid")) {
      return `export default () => (
  <board>
    <fakecomponent name="X1" invalidprop="bad" />
    <resistor resistance="invalid_value" />
    <capacitor capacitance="not_a_number" />
    <trace from="nonexistent" to="nowhere" />
  </board>
)`
    } else if (input.includes("microcontroller")) {
      return `export default () => (
  <board width="50mm" height="35mm">
    <chip
      name="U1"
      footprint="tqfp32"
      manufacturerPartNumber="STM32F030C8T6"
      pinLabels={{
        pin1: "VDD",
        pin8: "VSS",
        pin7: "NRST"
      }}
      connections={{
        VDD: "net.VCC",
        VSS: "net.GND"
      }}
    />
    <resistor name="R1" resistance="10k" footprint="0402" connections={{pin1: "net.VCC", pin2: ".U1 .NRST"}} />
    <capacitor name="C1" capacitance="100nF" footprint="0402" connections={{pin1: "net.VCC", pin2: "net.GND"}} />
    <capacitor name="C2" capacitance="10uF" footprint="0603" connections={{pin1: "net.VCC", pin2: "net.GND"}} />
  </board>
)`
    }
    
    return "// Error: Could not generate circuit"
  },
  scorers: [
    MockExecutionScorer,
    // AICircuitValidator, // Uncomment if you have OpenAI API key
  ],
})