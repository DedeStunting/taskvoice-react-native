import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { TaskItem } from '../components/TaskItem';
import { VoiceInputModal } from '../components/VoiceInputModal';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { useTasks } from '../hooks/useTasks';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { RootStackParamList } from '../navigation/navigationTypes';
import { TaskFilter, TaskSort } from '../types/task';
import { sortTasks } from '../utils/taskDates';

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>;

const filters: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' }
];

const sorts: { key: TaskSort; label: string; description: string }[] = [
  { key: 'created-desc', label: 'Newest first', description: 'Recently added tasks appear at the top' },
  { key: 'due-asc', label: 'Due soonest', description: 'The nearest deadlines appear first' },
  { key: 'due-desc', label: 'Due latest', description: 'Later deadlines appear first' }
];

export function TaskListScreen({ navigation }: Props) {
  const { tasks, isHydrated, storageError, toggleTask, deleteTask, addVoiceTasks } = useTasks();
  const { mode, theme, toggleTheme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('created-desc');
  const [showSort, setShowSort] = useState(false);
  const [query, setQuery] = useState('');
  const voice = useVoiceInput(result => addVoiceTasks(result.tasks));

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const filtered = tasks.filter(task =>
      (filter === 'all' || (filter === 'completed') === task.completed)
      && (!needle || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase().includes(needle))
    );
    return sortTasks(filtered, sort);
  }, [tasks, filter, query, sort]);

  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;
  const filterCounts: Record<TaskFilter, number> = { all: tasks.length, active, completed };
  const selectedSort = sorts.find(item => item.key === sort) ?? sorts[0];

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your tasks…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.brand}>TASKVOICE</Text>
          <Text style={styles.heading} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.86}>
            Make room for progress.
          </Text>
          <Text style={styles.summary}>
            {tasks.length ? `${tasks.length - completed} left · ${completed} completed` : 'Your day starts here'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${mode === 'light' ? 'dark' : 'light'} theme`}
            onPress={toggleTheme}
            style={styles.themeToggle}
          >
            <Text style={styles.themeIcon}>{mode === 'light' ? '☾' : '☀'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add a task"
            onPress={() => navigation.navigate('AddTask')}
            style={styles.add}
          >
            <Text style={styles.addText}>＋</Text>
          </Pressable>
        </View>
      </View>

      {!!storageError && <Text style={styles.storageError}>{storageError}</Text>}

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search your tasks"
          placeholderTextColor={theme.colors.muted}
          style={styles.search}
        />
        {!!query && (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.clearSearch}>
            <Text style={styles.clearSearchText}>×</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.taskControls}>
        <View style={styles.filters}>
          {filters.map(item => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${item.label}, ${filterCounts[item.key]} tasks`}
                onPress={() => setFilter(item.key)}
                style={[styles.filter, selected && styles.filterActive]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextActive]}>{item.label}</Text>
                <View style={[styles.filterCount, selected && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, selected && styles.filterCountTextActive]}>
                    {filterCounts[item.key]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        {!!tasks.length && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Sort tasks. Current selection: ${selectedSort.label}`}
            onPress={() => setShowSort(true)}
            style={styles.sortButton}
          >
            <Text style={styles.sortIcon}>↕</Text>
            <Text style={styles.sortButtonText} numberOfLines={1}>{selectedSort.label}</Text>
            <Text style={styles.sortChevron}>⌄</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        contentContainerStyle={visible.length ? styles.list : styles.emptyList}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={() => toggleTask(item.id)}
            onEdit={() => navigation.navigate('EditTask', { taskId: item.id })}
            onDelete={() => deleteTask(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState filtered={!!tasks.length} />}
        keyboardShouldPersistTaps="handled"
      />

      <FloatingActionButton listening={voice.status === 'listening'} onPress={voice.start} />
      <VoiceInputModal status={voice.status} error={voice.error} onStop={voice.stop} onDismiss={voice.dismiss} />
      <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSort(false)}>
          <Pressable accessibilityRole="none" style={styles.sortSheet} onPress={event => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetEyebrow}>ORGANIZE</Text>
            <Text style={styles.sheetTitle}>Sort tasks</Text>
            <Text style={styles.sheetHelp}>Choose how your task list is ordered.</Text>
            <View style={styles.sheetOptions}>
              {sorts.map(item => {
                const selected = sort === item.key;
                return (
                  <Pressable
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => { setSort(item.key); setShowSort(false); }}
                    style={[styles.sheetOption, selected && styles.sheetOptionActive]}
                  >
                    <View style={styles.sheetOptionCopy}>
                      <Text style={[styles.sheetOptionTitle, selected && styles.sheetOptionTitleActive]}>{item.label}</Text>
                      <Text style={styles.sheetOptionDescription}>{item.description}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioActive]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12
  },
  loadingText: { color: theme.colors.muted, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 22,
    alignItems: 'center',
    gap: 12
  },
  headerCopy: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brand: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  heading: { color: theme.colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -.6, marginTop: 5 },
  summary: { color: theme.colors.muted, fontSize: 13, marginTop: 5 },
  themeToggle: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 41,
    height: 41,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  themeIcon: { color: theme.colors.ink, fontSize: 21, lineHeight: 23, fontWeight: '700' },
  add: {
    backgroundColor: theme.colors.primary,
    width: 43,
    height: 43,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addText: {
    color: theme.dark ? theme.colors.background : theme.colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2
  },
  storageError: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft,
    margin: 20,
    marginBottom: 0,
    padding: 10,
    borderRadius: 10
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: 14
  },
  searchIcon: { color: theme.colors.muted, fontSize: 26, marginTop: -4 },
  search: { flex: 1, paddingHorizontal: 10, paddingVertical: 13, fontSize: 15, color: theme.colors.ink },
  clearSearch: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  clearSearchText: { color: theme.colors.muted, fontSize: 22, lineHeight: 24 },
  taskControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  filters: {
    flex: 1,
    flexDirection: 'row',
    padding: 3,
    borderRadius: 13,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  filter: {
    flex: 1,
    minHeight: 36,
    paddingHorizontal: 7,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5
  },
  filterActive: {
    backgroundColor: theme.colors.primarySoft
  },
  filterText: { color: theme.colors.muted, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: theme.colors.primary, fontWeight: '800' },
  filterCount: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background
  },
  filterCountActive: { backgroundColor: theme.colors.surface },
  filterCountText: { color: theme.colors.muted, fontSize: 10, fontWeight: '800' },
  filterCountTextActive: { color: theme.colors.primary },
  sortButton: {
    height: 44,
    maxWidth: 138,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 13
  },
  sortIcon: { color: theme.colors.primary, fontSize: 16, fontWeight: '800' },
  sortButtonText: { flexShrink: 1, color: theme.colors.ink, fontSize: 11, fontWeight: '700' },
  sortChevron: { color: theme.colors.muted, fontSize: 15, marginTop: -3 },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay
  },
  sortSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: 20
  },
  sheetEyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  sheetTitle: { color: theme.colors.ink, fontSize: 24, fontWeight: '900', letterSpacing: -.4, marginTop: 6 },
  sheetHelp: { color: theme.colors.muted, fontSize: 14, marginTop: 5, marginBottom: 18 },
  sheetOptions: { gap: 9 },
  sheetOption: {
    minHeight: 72,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  sheetOptionActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  sheetOptionCopy: { flex: 1 },
  sheetOptionTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: '800' },
  sheetOptionTitleActive: { color: theme.colors.primary },
  sheetOptionDescription: { color: theme.colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioActive: { borderColor: theme.colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  list: { paddingHorizontal: 20, paddingBottom: 105 },
  emptyList: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 105 }
});
