import AsyncStorage from '@react-native-async-storage/async-storage';
import { TASKS_STORAGE_KEY } from '../constants/storage';
import { Task } from '../types/task';
import { isDateOnly } from '../utils/taskDates';

const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.completed === 'boolean' &&
    (item.source === 'manual' || item.source === 'voice') &&
    typeof item.createdAt === 'string' &&
    typeof item.updatedAt === 'string' &&
    (item.dueDate === undefined || isDateOnly(item.dueDate))
  );
};

export async function loadTasks(): Promise<Task[]> {
  const stored = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
  } catch {
    return [];
  }
}

export const saveTasks = (tasks: Task[]) =>
  AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
