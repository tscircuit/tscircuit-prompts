import OpenAI from "openai"
import { tscircuitSyntaxPrompt } from "../prompts/tscircuit-syntax"
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
  if (match?.[1]) return match[1].trim()
  return text.trim()
}

interface RunPromptOptions {
  model?: string
  reasoning_effort?: "minimal" | "low" | "medium" | "high"
}

export async function runPromptToGenerateTscircuit(
  prompt: string,
  opts: RunPromptOptions = {},
): Promise<RunPromptToGenerateTscircuitResult> {
  const { model = "gpt-5-nano" } = opts
  const start = performance.now()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  try {
    const completion = await openai.chat.completions.create({
      model,
      reasoning_effort: opts.reasoning_effort,
      messages: [
        {
          role: "system",
          content: `
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
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    const rawResult = completion.choices[0]?.message?.content || ""
    const generatedCode = parseCodefence(rawResult)
    const end = performance.now()

    // Report successful trace
    reportTrace({
      start,
      end,
      input: [{ role: "user", content: prompt }],
      output: rawResult,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
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
