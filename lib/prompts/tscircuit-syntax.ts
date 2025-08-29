export const tscircuitSyntaxPrompt = `

Here's a quick primer on how to use tscircuit:

## Core \`<chip />\` props (most-used)

* \`name\`: reference designator (e.g., \`"U1"\`).
* \`footprint\`: **string** (e.g., \`"soic8"\`/\`"0402"\`) **or** a \`<footprint />\` element.
* \`pinLabels\`: map pad → pin label (e.g., \`{ pin1: "VCC", pin5: "GND" }\`).
* \`schPinArrangement\`: control schematic sides/order of pins (alias **\`schPortArrangement\`** is deprecated).
  Optional styling/box props: \`schPinStyle\`, \`schPinSpacing\`, \`schWidth\`, \`schHeight\`. ([GitHub][3])
* Connectivity helpers:
  \`internallyConnectedPins\`, \`externallyConnectedPins\`, and **\`connections\`** (auto‑traces by pin label)
* Extras: \`pcbPinLabels\`, \`cadModel\`, \`noSchematicRepresentation\`

---

## Minimal chip

<chip
  name="U1"
  footprint="soic8"
  pinLabels={{ pin1: "VCC", pin2: "DISCH", pin3: "THRES", pin4: "CTRL",
               pin5: "GND", pin6: "TRIG", pin7: "OUT", pin8: "RESET" }}
/>

## Arrange pins on schematic (+ style/size)

<chip
  name="U1" footprint="soic8" pinLabels={{ pin1:"VCC", pin5:"GND", pin7:"OUT", pin8:"RESET" }}
  schPinArrangement={{
    leftSide:  { direction: "top-to-bottom",    pins: ["VCC"] },
    rightSide: { direction: "bottom-to-top",    pins: ["GND","OUT","RESET"] },
    topSide:   { direction: "left-to-right",    pins: [] },
    bottomSide:{ direction: "left-to-right",    pins: [] },
  }}
  schPinStyle={{ GND: { topMargin: "0.5mm" } }}
  schPinSpacing={0.75} schWidth="12mm"
/>

## Custom PCB footprint (inline)

<chip
  name="U1"
  footprint={
    <footprint>
      <smtpad portHints={["1"]} pcbX="-1mm" pcbY="0" width="1mm" height="0.7mm" />
      <smtpad portHints={["2"]} pcbX="1mm"  pcbY="0" width="1mm" height="0.7mm" />
    </footprint>
  }
/>

## Internally / externally shorted pins

<chip
  name="SW1" footprint="pushbutton"
  internallyConnectedPins={[["pin1","pin4"],["pin2","pin3"]]}
/>

<chip
  name="U1" footprint="soic8" pinLabels={{ pin1:"VCC", pin5:"GND", pin6:"TRIG", pin2:"DISCH" }}
  externallyConnectedPins={[["GND","DISCH"],["TRIG","VCC"]]}
/>

## Auto‑connect with \`connections\`

A more condensed alternative to \`<trace />\`, available on basically all elements

<chip
  name="U1" footprint="soic8" pinLabels={{ pin1:"VCC", pin5:"GND", pin7:"OUT" }}
  connections={{ VCC: "net.V5", GND: "net.GND", OUT: "net.SIGNAL" }}
/>

Use with \`sel\` for type‑safe selectors (e.g., \`OUT: sel.U2(MyReg).VOUT\`). ([GitHub][3], [docs.tscircuit.com][4])

## Part selection & PCB labels

<chip
  name="U1" footprint="soic8"
  supplierPartNumbers={{ jlcpcb: ["C57759"] }}
  manufacturerPartNumber="SN74HC14DR"
  pcbPinLabels={{ "1":"TX", "2":"RX" }}
/>

## All normal elements and important props

Most elements have a \`name\` and \`footprint\` prop. Most properties
are optional.

- \`<board />\` - root element
- \`<group />\` - group of elements
- \`<chip />\` - any generic chip
- \`<resistor />\` - \`resistance\`
- \`<capacitor />\` - \`capacitance\`
- \`<inductor />\` - \`inductance\`
- \`<led />\` - \`color\`
- \`<diode />\` - \`variant\` (standard/schottky/zener/avalanche/photo/tvs)
- \`<trace />\` - \`from\`, \`to\`
- \`<transistor />\` - \`type\` (npn/pnp/nmos/pmos)
- \`<mosfet />\` - \`channelType\` (n/p), \`mosfetMode\` (enhancement/depletion)
- \`<connector />\` - similar to \`<chip />\`
- \`<hole />\` - \`diameter\`
- \`<testpoint />\` - \`padShape\` (circle/rect), \`padDiameter\`, \`footprintVariant\` (smd/through_hole), \`width\`, \`height\`
- \`<via />\` - \`holeDiameter\`, \`outerDiameter\`
- \`<switch />\` - \`spdt\` (bool), \`dpdt\` (bool), \`spst\` (bool), \`spdt\` (bool), \`isNormallyClosed\`
- \`<pinheader />\` - \`pinCount\`, \`schFacingDirection\`, \`schPinArrangement\`, \`gender\` (male/female/unpopulated), \`showSilkscreenPinLabels\`, \`holeDiameter\`, \`connections\`, \`pinLabels\`, \`rightAngle\`, \`doubleRow\`
- \`<jumper />\` - similar to pinheader but pin count must be 2 or 3
- \`<fuse />\` 
- \`<pushbutton />\`
- \`<cutout />\` - \`shape\` (rect), \`width\`, \`height\`
- \`<crystal />\` - \`frequency\`, \`loadCapacitance\`, \`loadResistance\`
- \`<battery />\`


### Footprint Only Elements

- \`<smtpad />\` - \`portHints\`, \`pcbX\`, \`pcbY\`, \`shape\`, \`width\`, \`height\`
- \`<platedhole />\` - \`pcbX\`, \`pcbY\`, \`shape\`, \`width\`, \`height\`

`.trim()
