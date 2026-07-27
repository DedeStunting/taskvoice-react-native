import { Task, TaskSort } from '../types/task';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export type DueDateState = 'overdue' | 'today' | 'upcoming';

export function getDueDateState(dueDate: string, today = new Date()): DueDateState {
  const todayKey = toDateOnly(today);
  if (dueDate < todayKey) return 'overdue';
  if (dueDate === todayKey) return 'today';
  return 'upcoming';
}

export function formatDueDate(dueDate: string, today = new Date()): string {
  const state = getDueDateState(dueDate, today);
  if (state === 'today') return 'Due today';
  const tomorrow = toDateOnly(addDays(today, 1));
  if (dueDate === tomorrow) return 'Due tomorrow';
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    ...(fromDateOnly(dueDate).getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {})
  }).format(fromDateOnly(dueDate));
  return state === 'overdue' ? `Overdue · ${formatted}` : `Due ${formatted}`;
}

export function sortTasks(tasks: Task[], sort: TaskSort): Task[] {
  return [...tasks].sort((left, right) => {
    if (sort === 'created-desc') return right.createdAt.localeCompare(left.createdAt);
    if (!left.dueDate && !right.dueDate) return right.createdAt.localeCompare(left.createdAt);
    if (!left.dueDate) return 1;
    if (!right.dueDate) return -1;
    const dateOrder = left.dueDate.localeCompare(right.dueDate);
    if (dateOrder) return sort === 'due-asc' ? dateOrder : -dateOrder;
    return right.createdAt.localeCompare(left.createdAt);
  });
}
