import OpenAI, { toFile } from 'openai';

export async function transcribeAudio(client: OpenAI, buffer: Buffer, filename: string, mimeType: string) {
  const file = await toFile(buffer, filename, { type: mimeType });
  const transcription = await client.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3',
    prompt: 'The recording contains personal to-do tasks. Preserve names and action wording accurately.'
  });
  return transcription.text.trim();
}
