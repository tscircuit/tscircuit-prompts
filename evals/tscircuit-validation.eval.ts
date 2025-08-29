import { evalite } from "evalite"
import { AICircuitValidator } from "../lib/scorers/ai-circuit-validator"
import { ExecutionScorer } from "../lib/scorers/execution-scorer"

evalite("TSCircuit Validation", {
  data: async () => [
    {
      input: "Create a simple LED circuit with a resistor",
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
      input: "Create a 555 timer circuit",
      expected: `export default () => (
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
    <capacitor name="C1" capacitance="10uF" footprint="0603" />
  </board>
)`,
    },
    {
      input: "Create a circuit with invalid syntax",
      expected: `export default () => (
  <board>
    <invalidcomponent name="X1" />
    <resistor resistance="invalid" />
    <trace from="nowhere" to="somewhere" />
  </board>
)`,
    },
    {
      input: "Create a circuit using raw coordinates (deprecated pattern)",
      expected: `export default () => (
  <board>
    <resistor name="R1" pcbX="5mm" pcbY="10mm" resistance="1k" />
    <capacitor name="C1" pcbX="15mm" pcbY="10mm" capacitance="100nF" />
  </board>
)`,
    },
    {
      input: "Create a proper microcontroller circuit",
      expected: `export default () => (
  <board width="40mm" height="30mm">
    <chip
      name="U1"
      footprint="tqfp48"
      manufacturerPartNumber="STM32F103C8T6"
      pinLabels={{
        pin1: "VBAT",
        pin2: "PC13",
        pin3: "PC14",
        pin4: "PC15",
        pin7: "NRST",
        pin8: "VSSA",
        pin9: "VDDA",
        pin23: "VSS1",
        pin24: "VDD1",
        pin35: "VSS2",
        pin36: "VDD2",
        pin47: "VSS3",
        pin48: "VDD3"
      }}
      connections={{
        VBAT: "net.VCC",
        VSS1: "net.GND",
        VSS2: "net.GND", 
        VSS3: "net.GND",
        VDD1: "net.VCC",
        VDD2: "net.VCC",
        VDD3: "net.VCC",
        VDDA: "net.VCC",
        VSSA: "net.GND"
      }}
    />
    <capacitor name="C1" capacitance="100nF" footprint="0402" connections={{pin1: "net.VCC", pin2: "net.GND"}} />
    <capacitor name="C2" capacitance="10uF" footprint="0603" connections={{pin1: "net.VCC", pin2: "net.GND"}} />
    <resistor name="R1" resistance="10k" footprint="0402" connections={{pin1: "net.VCC", pin2: ".U1 .NRST"}} />
  </board>
)`,
    }
  ],
  task: async (input) => {
    // In a real scenario, this would be the output from an LLM
    // For this demo, we're using the expected output directly to simulate LLM output
    return input.expected
  },
  scorers: [
    AICircuitValidator,
    ExecutionScorer
  ],
})