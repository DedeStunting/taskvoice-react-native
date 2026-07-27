import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { Task } from '../types/task';
import { formatDueDate, getDueDateState } from '../utils/taskDates';

export function TaskItem({ task, onToggle, onDelete }: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dueState = task.dueDate ? getDueDateState(task.dueDate) : null;
  const confirmDelete = () => Alert.alert('Delete task?', `"${task.title}" will be removed permanently.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onDelete }
  ]);

  return (
    <View style={[styles.card, task.completed && styles.cardDone]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={`Mark ${task.title} ${task.completed ? 'incomplete' : 'complete'}`}
        onPress={onToggle}
        style={[styles.checkbox, task.completed && styles.checked]}
      >
        {task.completed && <Text style={styles.check}>✓</Text>}
      </Pressable>
      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.done]}>{task.title}</Text>
        {!!task.description && <Text style={[styles.description, task.completed && styles.done]}>{task.description}</Text>}
        <View style={styles.metadata}>
          {task.source === 'voice' && <Text style={styles.source}>VOICE</Text>}
          {!!task.dueDate && (
            <View style={[
              styles.dueBadge,
              dueState === 'overdue' && !task.completed && styles.dueBadgeOverdue,
              dueState === 'today' && !task.completed && styles.dueBadgeToday
            ]}>
              <Text style={[
                styles.dueText,
                dueState === 'overdue' && !task.completed && styles.dueTextOverdue,
                dueState === 'today' && !task.completed && styles.dueTextToday
              ]}>
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Delete ${task.title}`}
        hitSlop={12}
        onPress={confirmDelete}
        style={styles.delete}
      >
        <Text style={styles.deleteText}>×</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardDone: { opacity: 0.58 },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    marginTop: 1
  },
  checked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  check: { color: theme.dark ? theme.colors.background : theme.colors.white, fontWeight: '900' },
  content: { flex: 1 },
  title: { color: theme.colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  description: { color: theme.colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  done: { textDecorationLine: 'line-through' },
  metadata: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  source: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  dueBadge: { borderRadius: theme.radius.pill, backgroundColor: theme.colors.primarySoft, paddingHorizontal: 9, paddingVertical: 4 },
  dueBadgeToday: { backgroundColor: theme.colors.accentSoft },
  dueBadgeOverdue: { backgroundColor: theme.colors.dangerSoft },
  dueText: { color: theme.colors.primary, fontSize: 11, fontWeight: '800' },
  dueTextToday: { color: theme.colors.accent },
  dueTextOverdue: { color: theme.colors.danger },
  delete: { marginLeft: 10, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: theme.colors.danger, fontSize: 27, lineHeight: 27, fontWeight: '400' }
});
