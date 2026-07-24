import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { TaskItem } from '../components/TaskItem';
import { VoiceInputModal } from '../components/VoiceInputModal';
import { theme } from '../constants/theme';
import { useTasks } from '../hooks/useTasks';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { RootStackParamList } from '../navigation/navigationTypes';
import { TaskFilter } from '../types/task';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;
const filters: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'completed', label: 'Completed' }
];
export function TaskListScreen({ navigation }: Props) {
  const { tasks, isHydrated, storageError, toggleTask, deleteTask, addVoiceTasks } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all'); const [query, setQuery] = useState('');
  const voice = useVoiceInput(result => addVoiceTasks(result.tasks));
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return tasks.filter(task => (filter === 'all' || (filter === 'completed') === task.completed)
      && (!needle || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase().includes(needle)));
  }, [tasks, filter, query]);
  const completed = tasks.filter(task => task.completed).length;
  if (!isHydrated) return <SafeAreaView style={styles.loading}><ActivityIndicator color={theme.colors.primary} /><Text style={styles.loadingText}>Loading your tasks…</Text></SafeAreaView>;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View><Text style={styles.brand}>TASKVOICE</Text><Text style={styles.heading}>Make room for progress.</Text>
          <Text style={styles.summary}>{tasks.length ? `${tasks.length - completed} left · ${completed} completed` : 'Your day starts here'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add a task" onPress={() => navigation.navigate('AddTask')} style={styles.add}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      </View>
      {!!storageError && <Text style={styles.storageError}>{storageError}</Text>}
      <View style={styles.searchWrap}><Text style={styles.searchIcon}>⌕</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search your tasks" placeholderTextColor="#929B95" style={styles.search} />
      </View>
      <View style={styles.filters}>{filters.map(item =>
        <Pressable key={item.key} onPress={() => setFilter(item.key)}
          style={[styles.filter, filter === item.key && styles.filterActive]}>
          <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
        </Pressable>)}</View>
      <FlatList data={visible} keyExtractor={item => item.id} contentContainerStyle={visible.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => <TaskItem task={item} onToggle={() => toggleTask(item.id)} onDelete={() => deleteTask(item.id)} />}
        ListEmptyComponent={<EmptyState filtered={!!tasks.length} />} keyboardShouldPersistTaps="handled" />
      <FloatingActionButton listening={voice.status === 'listening'} onPress={voice.start} />
      <VoiceInputModal status={voice.status} error={voice.error} onStop={voice.stop} onDismiss={voice.dismiss} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  loading: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: theme.colors.muted, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 22, alignItems: 'center' },
  brand: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heading: { color: theme.colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -.6, marginTop: 5 },
  summary: { color: theme.colors.muted, fontSize: 13, marginTop: 5 },
  add: { backgroundColor: theme.colors.primary, width: 43, height: 43, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  addText: { color: theme.colors.white, fontSize: 28, fontWeight: '300', marginTop: -2 },
  storageError: { color: theme.colors.danger, backgroundColor: '#F9E6E3', margin: 20, marginBottom: 0, padding: 10, borderRadius: 10 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, marginHorizontal: 20,
    marginTop: 22, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingLeft: 14 },
  searchIcon: { color: theme.colors.muted, fontSize: 26, marginTop: -4 },
  search: { flex: 1, paddingHorizontal: 10, paddingVertical: 13, fontSize: 15, color: theme.colors.ink },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingVertical: 14 },
  filter: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.radius.pill },
  filterActive: { backgroundColor: theme.colors.primarySoft },
  filterText: { color: theme.colors.muted, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: theme.colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 105 }, emptyList: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 105 }
});
