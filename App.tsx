import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { TaskProvider } from './src/context/TaskContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';

function AppContent() {
  const { theme } = useAppTheme();
  const navigationTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.ink,
      border: theme.colors.border,
      notification: theme.colors.accent
    }
  };
  return (
    <TaskProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </TaskProvider>
  );
}

export default function App() {
  return <ThemeProvider><AppContent /></ThemeProvider>;
}
