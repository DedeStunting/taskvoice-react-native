import { Platform } from 'react-native';
import { normaliseVoiceTasks } from '../utils/normaliseVoiceTasks';
import { VoiceTaskResponse } from '../types/voice';

const API_URL = process.env.EXPO_PUBLIC_VOICE_API_URL?.replace(/\/$/, '');
export async function processVoiceRecording(uri: string): Promise<VoiceTaskResponse> {
  if (!API_URL) throw new Error('CONFIGURATION');
  const body = new FormData();
  if (Platform.OS === 'web') {
    const audioBlob = await fetch(uri).then(response => response.blob());
    body.append('audio', audioBlob, 'taskvoice-recording.webm');
  } else {
    body.append('audio', {
      uri,
      name: 'taskvoice-recording.m4a',
      type: 'audio/m4a'
    } as unknown as Blob);
  }
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/voice-tasks`, { method: 'POST', body });
  } catch { throw new Error('NETWORK'); }
  const data = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'PROCESSING');
  const transcript = typeof data.transcript === 'string' ? data.transcript.trim() : '';
  if (!transcript) throw new Error('NO_SPEECH');
  const tasks = normaliseVoiceTasks(data.tasks);
  return tasks.length ? { transcript, tasks } : { transcript, tasks: [{ title: transcript }], fallback: true };
}
