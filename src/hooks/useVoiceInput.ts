import { useState } from 'react';
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder } from 'expo-audio';
import { processVoiceRecording } from '../services/voiceTaskApi';
import { VoiceTaskResponse } from '../types/voice';

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'success' | 'error';
export function useVoiceInput(onSuccess: (result: VoiceTaskResponse) => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [error, setError] = useState('');
  const start = async () => {
    setError('');
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError('Microphone access is required to add tasks by voice. Enable it in your device settings and try again.');
      setStatus('error'); return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync(); recorder.record(); setStatus('listening');
    } catch { setError('Recording could not start. Please try again.'); setStatus('error'); }
  };
  const stop = async () => {
    try {
      await recorder.stop(); setStatus('processing');
      if (!recorder.uri) throw new Error('NO_SPEECH');
      const result = await processVoiceRecording(recorder.uri);
      onSuccess(result); setStatus('success');
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : 'PROCESSING';
      const messages: Record<string, string> = {
        CONFIGURATION: 'Voice service is not configured. Add EXPO_PUBLIC_VOICE_API_URL and restart Expo.',
        NETWORK: 'We could not connect to the voice service. Check your connection and try again.',
        NO_SPEECH: 'No speech was detected. Please try again.'
      };
      setError(messages[code] ?? 'We could not process this recording. Please try again or add the task manually.');
      setStatus('error');
    }
  };
  const dismiss = async () => {
    if (status === 'listening') await recorder.stop().catch(() => undefined);
    setStatus('idle'); setError('');
  };
  return { status, error, start, stop, dismiss };
}
