import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { tscircuitSyntaxPrompt } from "./prompts/tscircuit-syntax"
import { reportTrace } from "evalite/traces"

interface RunPromptOptions {
  model?: string
}

export async function runPromptToGenerateTscircuit(
  prompt: string,
  opts: RunPromptOptions = {},
): Promise<string> {
  const { model = "gpt-5-nano" } = opts
  const start = performance.now()

  try {
    const result = streamText({
      model: openai(model),
      system: `
You are an expert at generating tscircuit code. Generate valid tscircuit code based on the user's prompt.

${tscircuitSyntaxPrompt}

Always return the code wrapped in a proper export default function like this:

export default () => (
  <board width="20mm" height="20mm">
    // Your circuit components here
  </board>
)

Make sure to:
- Use proper component names and properties
- Include appropriate footprints
- Add traces to connect components
- Use valid resistance, capacitance, and other values
- Follow tscircuit syntax exactly as shown in the documentation above
      `,
      prompt: prompt,
    })

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("AI model call timed out after 25 seconds")),
        180_000,
      )
    })

    const generatedCode = (await Promise.race([
      result.text,
      timeoutPromise,
    ])) as string
    const end = performance.now()

    // Report successful trace
    reportTrace({
      start,
      end,
      input: [{ role: "user", content: prompt }],
      output: generatedCode,
      usage: {
        promptTokens: 0, // streamText doesn't provide usage info directly
        completionTokens: 0,
      },
    })

    return generatedCode
  } catch (error) {
    const end = performance.now()

    // Report error trace
    reportTrace({
      start,
      end,
      input: [{ role: "user", content: prompt }],
      output: `Error generating tscircuit code: ${error instanceof Error ? error.message : String(error)}`,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
      },
    })

    throw error
  }
}
