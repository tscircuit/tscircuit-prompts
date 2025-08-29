import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { tscircuitSyntaxPrompt } from "./prompts/tscircuit-syntax"
import { reportTrace } from "evalite/traces"

// Set evalite global testTimeout
import { createSnippetUrl } from "@tscircuit/create-snippet-url"

export interface RunPromptToGenerateTscircuitResult {
  code: string
  rawResponse: string
  snippetUrl: string
}

function parseCodefence(text: string): string {
  const codeblockRegex =
    /```(?:typescript|ts|tsx|javascript|js|jsx)?\n([\s\S]*?)```/g
  const match = codeblockRegex.exec(text)
  if (match && match[1]) {
    return match[1].trim()
  }
  return text.trim()
}

interface RunPromptOptions {
  model?: string
}

export async function runPromptToGenerateTscircuit(
  prompt: string,
  opts: RunPromptOptions = {},
): Promise<RunPromptToGenerateTscircuitResult> {
  const { model = "gpt-5-nano" } = opts
  const start = performance.now()

  try {
    const result = streamText({
      model: openai(model),
      system: `
You are an expert at generating tscircuit code. Generate valid tscircuit code based on the user's prompt.

${tscircuitSyntaxPrompt}

Always return the code wrapped in a proper export default function like this:

\`\`\`tsx
export default () => (
  <board width="20mm" height="20mm">
    // Your circuit components here
  </board>
)
\`\`\`

Make sure to:
- Use proper component names and properties
- Include appropriate footprints
- Add traces to connect components
- Use valid resistance, capacitance, and other values
- Follow tscircuit syntax exactly as shown in the documentation above
      `,
      prompt: prompt,
    })

    const rawResult = await result.text
    const generatedCode = parseCodefence(rawResult)
    const end = performance.now()

    // Report successful trace
    reportTrace({
      start,
      end,
      input: [{ role: "user", content: prompt }],
      output: rawResult,
      usage: {
        promptTokens: 0, // streamText doesn't provide usage info directly
        completionTokens: 0,
      },
    })

    return {
      code: generatedCode,
      rawResponse: rawResult,
      snippetUrl: createSnippetUrl(generatedCode),
    }
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
