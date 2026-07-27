import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { RootStackParamList } from './navigationTypes';
import { useAppTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
export function AppNavigator() {
  const { theme } = useAppTheme();
  return (
    <Stack.Navigator screenOptions={{
      headerShadowVisible: false, headerStyle: { backgroundColor: theme.colors.background },
      headerTintColor: theme.colors.ink, headerTitleStyle: { fontWeight: '800' },
      contentStyle: { backgroundColor: theme.colors.background }
    }}>
      <Stack.Screen name="Tasks" component={TaskListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ title: 'New task' }} />
    </Stack.Navigator>
  );
}
