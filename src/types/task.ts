export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  source: 'manual' | 'voice';
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
