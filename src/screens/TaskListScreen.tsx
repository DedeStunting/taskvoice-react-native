import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../components/EmptyState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { SortSheet } from '../components/SortSheet';
import { TaskControls } from '../components/TaskControls';
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
    const filtered = tasks.filter(
      task =>
        (filter === 'all' || (filter === 'completed') === task.completed) &&
        (!needle || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase().includes(needle))
    );
    return sortTasks(filtered, sort);
  }, [tasks, filter, query, sort]);

  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;
  const filterCounts: Record<TaskFilter, number> = { all: tasks.length, active, completed };

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
          <Text
            style={styles.heading}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.86}
          >
            Make room for progress.
          </Text>
          <Text style={styles.summary}>
            {tasks.length
              ? `${tasks.length - completed} left · ${completed} completed`
              : 'Your day starts here'}
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            style={styles.clearSearch}
          >
            <Text style={styles.clearSearchText}>×</Text>
          </Pressable>
        )}
      </View>

      <TaskControls
        counts={filterCounts}
        filter={filter}
        sort={sort}
        showSort={tasks.length > 0}
        onFilterChange={setFilter}
        onOpenSort={() => setShowSort(true)}
      />

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
      <VoiceInputModal
        status={voice.status}
        error={voice.error}
        onStop={voice.stop}
        onDismiss={voice.dismiss}
      />
      <SortSheet
        visible={showSort}
        value={sort}
        onChange={setSort}
        onDismiss={() => setShowSort(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
    heading: {
      color: theme.colors.ink,
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.6,
      marginTop: 5
    },
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
    search: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 13,
      fontSize: 15,
      color: theme.colors.ink
    },
    clearSearch: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
    clearSearchText: { color: theme.colors.muted, fontSize: 22, lineHeight: 24 },
    list: { paddingHorizontal: 20, paddingBottom: 105 },
    emptyList: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 105 }
  });
