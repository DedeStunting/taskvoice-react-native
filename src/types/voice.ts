export interface VoiceTaskCandidate { title: string; description?: string }
export interface VoiceTaskResponse {
  transcript: string;
  tasks: VoiceTaskCandidate[];
  fallback?: boolean;
}
