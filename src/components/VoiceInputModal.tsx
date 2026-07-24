import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { VoiceStatus } from '../hooks/useVoiceInput';

export function VoiceInputModal({ status, error, onStop, onDismiss }: {
  status: VoiceStatus; error: string; onStop: () => void; onDismiss: () => void;
}) {
  if (status === 'idle') return null;
  const listening = status === 'listening'; const processing = status === 'processing';
  return (
    <Modal transparent animationType="slide" visible onRequestClose={processing ? undefined : onDismiss}>
      <View style={styles.overlay}><View style={styles.sheet}>
        <View style={styles.handle} />
        {(listening || processing) && <View style={[styles.orb, processing && styles.orbProcessing]}>
          {processing ? <ActivityIndicator color={theme.colors.white} size="large" /> : <Text style={styles.wave}>•••</Text>}
        </View>}
        <Text style={styles.title}>{listening ? 'Listening…' : processing ? 'Creating your tasks…' : status === 'success' ? 'Tasks added' : 'Voice input stopped'}</Text>
        <Text style={styles.copy}>{error || (listening ? 'Speak naturally. You can mention several tasks at once.' :
          processing ? 'Transcribing and separating each action.' : status === 'success' ? 'Your spoken tasks are now in the list.' : '')}</Text>
        {listening && <Pressable style={styles.primary} onPress={onStop}><Text style={styles.primaryText}>Stop recording</Text></Pressable>}
        {!processing && !listening && <Pressable style={styles.primary} onPress={onDismiss}><Text style={styles.primaryText}>Done</Text></Pressable>}
        {listening && <Pressable style={styles.cancel} onPress={onDismiss}><Text style={styles.cancelText}>Cancel</Text></Pressable>}
      </View></View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(18,31,25,.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 42, alignItems: 'center' },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#D4D0C8', marginBottom: 28 },
  orb: { width: 94, height: 94, borderRadius: 47, backgroundColor: theme.colors.accent,
    alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
  orbProcessing: { backgroundColor: theme.colors.primary },
  wave: { color: theme.colors.white, fontSize: 35, fontWeight: '900', letterSpacing: 4, marginTop: -13 },
  title: { fontSize: 23, fontWeight: '800', color: theme.colors.ink, textAlign: 'center' },
  copy: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 9, marginBottom: 25 },
  primary: { backgroundColor: theme.colors.primary, paddingVertical: 15, borderRadius: theme.radius.pill, width: '100%', alignItems: 'center' },
  primaryText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
  cancel: { padding: 15 }, cancelText: { color: theme.colors.muted, fontWeight: '700' }
});
