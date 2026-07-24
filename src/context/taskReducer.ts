import { Task } from '../types/task';

export interface TaskState { tasks: Task[]; isHydrated: boolean; storageError: string | null }
export type TaskAction =
  | { type: 'LOAD_TASKS'; tasks: Task[] }
  | { type: 'ADD_TASKS'; tasks: Task[] }
  | { type: 'TOGGLE_TASK'; id: string; at: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'STORAGE_ERROR'; message: string };

export const initialTaskState: TaskState = { tasks: [], isHydrated: false, storageError: null };

export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'LOAD_TASKS': return { ...state, tasks: action.tasks, isHydrated: true };
    case 'ADD_TASKS': return { ...state, tasks: [...action.tasks, ...state.tasks] };
    case 'TOGGLE_TASK':
      return { ...state, tasks: state.tasks.map(task => task.id === action.id
        ? { ...task, completed: !task.completed, updatedAt: action.at } : task) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(task => task.id !== action.id) };
    case 'STORAGE_ERROR': return { ...state, storageError: action.message, isHydrated: true };
    default: return state;
  }
}
