import OpenAI from 'openai';

interface ExtractedTask { title: string; description?: string }
const schema = {
  name: 'task_list',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      tasks: {
        type: 'array', maxItems: 20,
        items: {
          type: 'object',
          properties: { title: { type: 'string' }, description: { type: ['string', 'null'] } },
          required: ['title', 'description'], additionalProperties: false
        }
      }
    },
    required: ['tasks'], additionalProperties: false
  }
} as const;

export async function extractTasks(client: OpenAI, transcript: string): Promise<ExtractedTask[]> {
  const response = await client.chat.completions.create({
    model: 'gpt-5.6-luna',
    messages: [
      { role: 'system', content: `Extract only actionable tasks explicitly spoken by the user.
Split separate actions, but keep objects in one action together: "buy bread and butter" is one task;
"buy bread and call John" is two. Use concise imperative titles, preserve meaning and names, invent nothing.
Return no tasks for text without an action.` },
      { role: 'user', content: transcript }
    ],
    response_format: { type: 'json_schema', json_schema: schema }
  });
  const content = response.choices[0]?.message.content;
  if (!content) return [];
  const parsed = JSON.parse(content) as { tasks?: Array<{ title?: unknown; description?: unknown }> };
  const seen = new Set<string>();
  return (parsed.tasks ?? []).flatMap(item => {
    if (typeof item.title !== 'string') return [];
    const title = item.title.trim().replace(/[.!]+$/, ''); const key = title.toLocaleLowerCase();
    if (!title || seen.has(key)) return [];
    seen.add(key);
    return [{ title, ...(typeof item.description === 'string' && item.description.trim()
      ? { description: item.description.trim() } : {}) }];
  });
}
