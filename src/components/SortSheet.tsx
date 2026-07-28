import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TASK_SORT_OPTIONS } from '../constants/taskOptions';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';
import { TaskSort } from '../types/task';

interface SortSheetProps {
  visible: boolean;
  value: TaskSort;
  onChange: (sort: TaskSort) => void;
  onDismiss: () => void;
}

export function SortSheet({ visible, value, onChange, onDismiss }: SortSheetProps) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const selectSort = (sort: TaskSort) => {
    onChange(sort);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          accessibilityRole="none"
          style={styles.sheet}
          onPress={event => event.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.eyebrow}>ORGANIZE</Text>
          <Text style={styles.title}>Sort tasks</Text>
          <Text style={styles.help}>Choose how your task list is ordered.</Text>

          <View style={styles.options}>
            {TASK_SORT_OPTIONS.map(option => {
              const selected = value === option.key;

              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => selectSort(option.key)}
                  style={[styles.option, selected && styles.optionActive]}
                >
                  <View style={styles.optionCopy}>
                    <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
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
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.overlay
    },
    sheet: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 34
    },
    handle: {
      alignSelf: 'center',
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: 20
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.5
    },
    title: {
      color: theme.colors.ink,
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.4,
      marginTop: 6
    },
    help: {
      color: theme.colors.muted,
      fontSize: 14,
      marginTop: 5,
      marginBottom: 18
    },
    options: {
      gap: 9
    },
    option: {
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
    optionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primarySoft
    },
    optionCopy: {
      flex: 1
    },
    optionTitle: {
      color: theme.colors.ink,
      fontSize: 15,
      fontWeight: '800'
    },
    optionTitleActive: {
      color: theme.colors.primary
    },
    optionDescription: {
      color: theme.colors.muted,
      fontSize: 12,
      lineHeight: 17,
      marginTop: 3
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center'
    },
    radioActive: {
      borderColor: theme.colors.primary
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary
    }
  });
