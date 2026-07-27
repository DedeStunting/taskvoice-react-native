import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

export function EmptyState({ filtered = false }: { filtered?: boolean }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.root}>
      <View style={styles.icon}><Text style={styles.tick}>✓</Text></View>
      <Text style={styles.title}>{filtered ? 'No matching tasks' : 'No tasks yet'}</Text>
      <Text style={styles.copy}>
        {filtered
          ? 'Try another search or filter.'
          : 'Create your first task or use voice input\nto tell TaskVoice what you need to do.'}
      </Text>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, minHeight: 330 },
  icon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  tick: { color: theme.colors.primary, fontSize: 36, fontWeight: '900' },
  title: { color: theme.colors.ink, fontSize: 22, fontWeight: '800', marginBottom: 9 },
  copy: { color: theme.colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center' }
});
