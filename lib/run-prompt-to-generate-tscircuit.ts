import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { tscircuitSyntaxPrompt } from "./prompts/tscircuit-syntax";

interface RunPromptOptions {
  model?: string;
}

export async function runPromptToGenerateTscircuit(
  prompt: string,
  opts: RunPromptOptions = {}
): Promise<string> {
  const { model = "gpt-5-nano" } = opts;
  
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
  });

  return await result.text;
}