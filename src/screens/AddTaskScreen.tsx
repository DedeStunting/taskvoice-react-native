import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';
import { useTasks } from '../hooks/useTasks';
import { RootStackParamList } from '../navigation/navigationTypes';
import { validateTaskTitle } from '../utils/taskValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
export function AddTaskScreen({ navigation }: Props) {
  const { addTask } = useTasks();
  const [title, setTitle] = useState(''); const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const validation = validateTaskTitle(title);
    if (validation) { setError(validation); return; }
    addTask(title, description); navigation.goBack();
  };
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>CAPTURE THE NEXT STEP</Text>
        <Text style={styles.heading}>What needs doing?</Text>
        <Text style={styles.help}>Keep the title actionable. Add context below only if it helps.</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Task title</Text>
          <TextInput autoFocus value={title} onChangeText={value => { setTitle(value); if (error) setError(null); }}
            placeholder="e.g. Submit project report" placeholderTextColor="#9AA19C" maxLength={140}
            returnKeyType="next" style={[styles.input, error && styles.inputError]} />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
        <View style={styles.field}>
          <View style={styles.labelRow}><Text style={styles.label}>Description</Text><Text style={styles.optional}>OPTIONAL</Text></View>
          <TextInput value={description} onChangeText={setDescription} multiline
            placeholder="Add notes, a location, or useful details…" placeholderTextColor="#9AA19C"
            maxLength={500} style={[styles.input, styles.textarea]} />
        </View>
        <Pressable accessibilityRole="button" onPress={submit}
          style={({ pressed }) => [styles.button, pressed && { opacity: .86 }]}>
          <Text style={styles.buttonText}>Add task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  flex: { flex: 1 }, root: { padding: 22, paddingBottom: 44 },
  eyebrow: { color: theme.colors.primary, fontWeight: '900', fontSize: 11, letterSpacing: 1.6, marginTop: 14 },
  heading: { color: theme.colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -.7, marginTop: 8 },
  help: { color: theme.colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 30 },
  field: { marginBottom: 22 }, labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: theme.colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 9 },
  optional: { color: theme.colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  input: { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1,
    borderRadius: theme.radius.md, paddingHorizontal: 16, paddingVertical: 15, fontSize: 16, color: theme.colors.ink },
  inputError: { borderColor: theme.colors.danger }, textarea: { minHeight: 130, textAlignVertical: 'top' },
  error: { color: theme.colors.danger, fontSize: 13, fontWeight: '600', marginTop: 7 },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: theme.colors.white, fontWeight: '900', fontSize: 16 }
});
