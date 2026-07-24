import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { TaskListScreen } from '../screens/TaskListScreen';
import { RootStackParamList } from './navigationTypes';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
export function AppNavigator() {
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
