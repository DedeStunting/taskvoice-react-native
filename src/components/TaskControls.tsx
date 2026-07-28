import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TASK_FILTER_OPTIONS, TASK_SORT_OPTIONS } from '../constants/taskOptions';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { TaskFilter, TaskSort } from '../types/task';

interface TaskControlsProps {
  counts: Record<TaskFilter, number>;
  filter: TaskFilter;
  sort: TaskSort;
  showSort: boolean;
  onFilterChange: (filter: TaskFilter) => void;
  onOpenSort: () => void;
}

export function TaskControls({
  counts,
  filter,
  sort,
  showSort,
  onFilterChange,
  onOpenSort
}: TaskControlsProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const selectedSort =
    TASK_SORT_OPTIONS.find(option => option.key === sort) ?? TASK_SORT_OPTIONS[0];

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {TASK_FILTER_OPTIONS.map(option => {
          const selected = filter === option.key;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${option.label}, ${counts[option.key]} tasks`}
              onPress={() => onFilterChange(option.key)}
              style={[styles.filter, selected && styles.filterActive]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>
                {option.label}
              </Text>
              <View style={[styles.filterCount, selected && styles.filterCountActive]}>
                <Text style={[styles.filterCountText, selected && styles.filterCountTextActive]}>
                  {counts[option.key]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {showSort && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort tasks. Current selection: ${selectedSort.label}`}
          onPress={onOpenSort}
          style={styles.sortButton}
        >
          <Text style={styles.sortIcon}>↕</Text>
          <Text style={styles.sortButtonText} numberOfLines={1}>
            {selectedSort.label}
          </Text>
          <Text style={styles.sortChevron}>⌄</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
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
    filterText: {
      color: theme.colors.muted,
      fontSize: 12,
      fontWeight: '700'
    },
    filterTextActive: {
      color: theme.colors.primary,
      fontWeight: '800'
    },
    filterCount: {
      minWidth: 19,
      height: 19,
      paddingHorizontal: 5,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background
    },
    filterCountActive: {
      backgroundColor: theme.colors.surface
    },
    filterCountText: {
      color: theme.colors.muted,
      fontSize: 10,
      fontWeight: '800'
    },
    filterCountTextActive: {
      color: theme.colors.primary
    },
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
    sortIcon: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '800'
    },
    sortButtonText: {
      flexShrink: 1,
      color: theme.colors.ink,
      fontSize: 11,
      fontWeight: '700'
    },
    sortChevron: {
      color: theme.colors.muted,
      fontSize: 15,
      marginTop: -3
    }
  });
