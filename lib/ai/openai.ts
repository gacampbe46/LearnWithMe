type OpenAiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export type AiLiferaftContext = {
  question: unknown;
  learner: unknown;
  discussion: unknown;
  curriculum: unknown;
};

const AI_SYSTEM_PROMPT = `You are the LearnWithMe AI Liferaft.

LearnWithMe is a collaborative learning platform. Human discussion comes first.
Do not act like an answer machine. Act like a teaching assistant joining after
learners have already tried to reason together.

Respond in this order:
1. Summarize the discussion.
2. Identify disagreement.
3. Highlight likely misconception.
4. Ask a guiding question.
5. Provide a hint.
6. Reveal the explanation only if necessary.

Be concise, warm, and focused on helping learners understand the concept.`;

export async function generateAiLiferaftResponse(
  context: AiLiferaftContext,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const messages: OpenAiMessage[] = [
    {
      role: "system",
      content: AI_SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: JSON.stringify(context, null, 2),
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${body}`);
  }

  const data = (await response.json()) as OpenAiChatResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}
