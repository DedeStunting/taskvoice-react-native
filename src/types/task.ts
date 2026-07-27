export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  source: 'manual' | 'voice';
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'created-desc' | 'due-asc' | 'due-desc';
