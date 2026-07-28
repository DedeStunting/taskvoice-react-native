import { TaskFilter, TaskSort } from '../types/task';

export const TASK_FILTER_OPTIONS: readonly { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' }
];

export const TASK_SORT_OPTIONS: readonly {
  key: TaskSort;
  label: string;
  description: string;
}[] = [
  {
    key: 'created-desc',
    label: 'Newest first',
    description: 'Recently added tasks appear at the top'
  },
  {
    key: 'due-asc',
    label: 'Due soonest',
    description: 'The nearest deadlines appear first'
  },
  {
    key: 'due-desc',
    label: 'Due latest',
    description: 'Later deadlines appear first'
  }
];
