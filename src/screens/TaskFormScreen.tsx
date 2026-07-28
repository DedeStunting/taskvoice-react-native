import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { RootStackParamList } from '../navigation/navigationTypes';
import { addDays, formatDueDate, fromDateOnly, toDateOnly } from '../utils/taskDates';
import { validateTaskTitle } from '../utils/taskValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask' | 'EditTask'>;

export function TaskFormScreen({ navigation, route }: Props) {
  const { tasks, addTask, updateTask } = useTasks();
  const taskId = route.name === 'EditTask' ? route.params?.taskId : undefined;
  const existingTask = taskId ? tasks.find(task => task.id === taskId) : undefined;
  const editing = !!existingTask;
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [dueDate, setDueDate] = useState<string | undefined>(existingTask?.dueDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const validation = validateTaskTitle(title);
    if (validation) {
      setError(validation);
      return;
    }
    if (existingTask) updateTask(existingTask.id, title, description, dueDate);
    else addTask(title, description, dueDate);
    navigation.goBack();
  };

  const selectDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && date) setDueDate(toDateOnly(date));
  };

  const quickDates = [
    { label: 'Today', date: new Date() },
    { label: 'Tomorrow', date: addDays(new Date(), 1) },
    { label: 'Next week', date: addDays(new Date(), 7) }
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>
          {editing ? 'REFINE THE DETAILS' : 'CAPTURE THE NEXT STEP'}
        </Text>
        <Text style={styles.heading}>{editing ? 'Edit your task' : 'What needs doing?'}</Text>
        <Text style={styles.help}>
          {editing
            ? 'Update the title, add useful context, or adjust the deadline.'
            : 'Keep the title actionable. Add context and a due date when they help.'}
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Task title</Text>
          <TextInput
            autoFocus
            value={title}
            onChangeText={value => {
              setTitle(value);
              if (error) setError(null);
            }}
            placeholder="e.g. Submit project report"
            placeholderTextColor={theme.colors.muted}
            maxLength={140}
            returnKeyType="next"
            style={[styles.input, error && styles.inputError]}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.optional}>OPTIONAL</Text>
          </View>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Add notes, a location, or useful details…"
            placeholderTextColor={theme.colors.muted}
            maxLength={500}
            style={[styles.input, styles.textarea]}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Due date</Text>
            <Text style={styles.optional}>OPTIONAL</Text>
          </View>
          <View style={styles.quickDates}>
            {quickDates.map(item => {
              const value = toDateOnly(item.date);
              const selected = dueDate === value;
              return (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setDueDate(value)}
                  style={[styles.dateChip, selected && styles.dateChipSelected]}
                >
                  <Text style={[styles.dateChipText, selected && styles.dateChipTextSelected]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dueDate ? `Change ${formatDueDate(dueDate)}` : 'Choose a due date'}
            onPress={() => setShowDatePicker(value => !value)}
            style={styles.dateField}
          >
            <View>
              <Text style={styles.dateValue}>
                {dueDate ? formatDueDate(dueDate) : 'Choose a date'}
              </Text>
              <Text style={styles.dateHint}>
                {dueDate ? 'Tap to choose another date' : 'No deadline selected'}
              </Text>
            </View>
            <Text style={styles.calendar}>▣</Text>
          </Pressable>
          {showDatePicker && (
            <View style={styles.pickerWrap}>
              <DateTimePicker
                value={dueDate ? fromDateOnly(dueDate) : new Date()}
                minimumDate={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                accentColor={theme.colors.primary}
                onChange={selectDate}
              />
            </View>
          )}
          {!!dueDate && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setDueDate(undefined)}
              style={styles.clearDate}
            >
              <Text style={styles.clearDateText}>Clear due date</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? 'Save task changes' : 'Add task'}
          onPress={submit}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>{editing ? 'Save changes' : 'Add task'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: theme.colors.background },
    root: { padding: 22, paddingBottom: 44 },
    eyebrow: {
      color: theme.colors.primary,
      fontWeight: '900',
      fontSize: 11,
      letterSpacing: 1.6,
      marginTop: 14
    },
    heading: {
      color: theme.colors.ink,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.7,
      marginTop: 8
    },
    help: {
      color: theme.colors.muted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 8,
      marginBottom: 30
    },
    field: { marginBottom: 22 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { color: theme.colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 9 },
    optional: { color: theme.colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    input: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingHorizontal: 16,
      paddingVertical: 15,
      fontSize: 16,
      color: theme.colors.ink
    },
    inputError: { borderColor: theme.colors.danger },
    textarea: { minHeight: 112, textAlignVertical: 'top' },
    error: { color: theme.colors.danger, fontSize: 13, fontWeight: '600', marginTop: 7 },
    quickDates: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    dateChip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface
    },
    dateChipSelected: {
      backgroundColor: theme.colors.primarySoft,
      borderColor: theme.colors.primary
    },
    dateChipText: { color: theme.colors.muted, fontSize: 13, fontWeight: '700' },
    dateChipTextSelected: { color: theme.colors.primary },
    dateField: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      paddingHorizontal: 16,
      paddingVertical: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    dateValue: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
    dateHint: { color: theme.colors.muted, fontSize: 12, marginTop: 3 },
    calendar: { color: theme.colors.primary, fontSize: 23 },
    pickerWrap: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      marginTop: 10,
      overflow: 'hidden'
    },
    clearDate: { alignSelf: 'flex-start', paddingVertical: 10 },
    clearDateText: { color: theme.colors.danger, fontWeight: '700', fontSize: 13 },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 4
    },
    pressed: { opacity: 0.86 },
    buttonText: {
      color: theme.dark ? theme.colors.background : theme.colors.white,
      fontWeight: '900',
      fontSize: 16
    }
  });
