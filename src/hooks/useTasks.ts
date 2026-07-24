import { useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error('useTasks must be used inside TaskProvider');
  return value;
}
