import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { AppTheme } from '../constants/theme';
import { useAppTheme } from '../context/ThemeContext';

export function FloatingActionButton({ onPress, listening }: { onPress: () => void; listening: boolean }) {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!listening) { pulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.2, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' })
    ]));
    animation.start();
    return () => animation.stop();
  }, [listening, pulse]);

  return (
    <View style={styles.wrap}>
      {listening && <Animated.View style={[styles.pulse, { transform: [{ scale: pulse }] }]} />}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add tasks by voice"
        accessibilityHint="Starts recording so spoken actions can be added as tasks"
        onPress={onPress}
        style={({ pressed }) => [styles.button, listening && styles.buttonListening, pressed && styles.pressed]}
      >
        <Ionicons name={listening ? 'mic' : 'mic-outline'} size={27} color={theme.colors.white} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 22,
    bottom: 28,
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulse: { position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: theme.colors.accentSoft },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: .22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6
  },
  buttonListening: {
    borderWidth: 3,
    borderColor: theme.colors.background
  },
  pressed: { opacity: .86 },
});
