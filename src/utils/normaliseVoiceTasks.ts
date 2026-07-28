import { VoiceTaskCandidate } from '../types/voice';

export function normaliseVoiceTasks(input: unknown): VoiceTaskCandidate[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  return input.flatMap(candidate => {
    if (!candidate || typeof candidate !== 'object') return [];
    const raw = candidate as Record<string, unknown>;
    if (typeof raw.title !== 'string') return [];
    const title = raw.title.trim().replace(/[.!]+$/, '');
    const key = title.toLocaleLowerCase();
    if (!title || seen.has(key)) return [];
    seen.add(key);
    const description = typeof raw.description === 'string' ? raw.description.trim() : '';
    return [{ title, ...(description ? { description } : {}) }];
  });
}
