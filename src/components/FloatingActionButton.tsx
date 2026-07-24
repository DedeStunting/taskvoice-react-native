import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { theme } from '../constants/theme';
export function FloatingActionButton({ onPress, listening }: { onPress: () => void; listening: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!listening) { pulse.setValue(1); return; }
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.2, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' })
    ]));
    animation.start(); return () => animation.stop();
  }, [listening, pulse]);
  return (
    <View style={styles.wrap}>
      {listening && <Animated.View style={[styles.pulse, { transform: [{ scale: pulse }] }]} />}
      <Pressable accessibilityRole="button" accessibilityLabel="Add tasks by voice" onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.86 }]}>
        <Text style={styles.mic}>●</Text>
        <View style={styles.stem} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 22, bottom: 28, width: 62, height: 62, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: '#F4B69A' },
  button: { width: 58, height: 58, borderRadius: 29, backgroundColor: theme.colors.accent,
    alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.shadow, shadowOpacity: .22,
    shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  mic: { color: theme.colors.white, fontSize: 19, marginTop: -7 },
  stem: { width: 4, height: 13, borderRadius: 2, backgroundColor: theme.colors.white, marginTop: -3 }
});
