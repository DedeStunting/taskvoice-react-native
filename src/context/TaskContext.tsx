import { PropsWithChildren, createContext, useEffect, useMemo, useReducer } from 'react';
import { generateId } from '../utils/generateId';
import { loadTasks, saveTasks } from '../services/taskStorage';
import { Task } from '../types/task';
import { VoiceTaskCandidate } from '../types/voice';
import { initialTaskState, taskReducer } from './taskReducer';

interface TaskContextValue {
  tasks: Task[]; isHydrated: boolean; storageError: string | null;
  addTask: (title: string, description?: string) => void;
  addVoiceTasks: (tasks: VoiceTaskCandidate[]) => number;
  toggleTask: (id: string) => void; deleteTask: (id: string) => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);

const makeTask = (candidate: VoiceTaskCandidate, source: Task['source']): Task => {
  const now = new Date().toISOString();
  return { id: generateId(), title: candidate.title.trim(),
    ...(candidate.description?.trim() ? { description: candidate.description.trim() } : {}),
    completed: false, source, createdAt: now, updatedAt: now };
};

export function TaskProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);
  useEffect(() => {
    loadTasks().then(tasks => dispatch({ type: 'LOAD_TASKS', tasks }))
      .catch(() => dispatch({ type: 'STORAGE_ERROR', message: 'Saved tasks could not be loaded.' }));
  }, []);
  useEffect(() => {
    if (!state.isHydrated) return;
    saveTasks(state.tasks).catch(() =>
      dispatch({ type: 'STORAGE_ERROR', message: 'Changes could not be saved on this device.' }));
  }, [state.tasks, state.isHydrated]);
  const value = useMemo<TaskContextValue>(() => ({
    ...state,
    addTask: (title, description) => dispatch({ type: 'ADD_TASKS', tasks: [makeTask({ title, description }, 'manual')] }),
    addVoiceTasks: candidates => {
      const tasks = candidates.map(item => makeTask(item, 'voice'));
      dispatch({ type: 'ADD_TASKS', tasks }); return tasks.length;
    },
    toggleTask: id => dispatch({ type: 'TOGGLE_TASK', id, at: new Date().toISOString() }),
    deleteTask: id => dispatch({ type: 'DELETE_TASK', id })
  }), [state]);
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
