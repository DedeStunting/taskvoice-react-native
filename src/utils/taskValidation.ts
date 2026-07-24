export const validateTaskTitle = (title: string): string | null =>
  title.trim() ? null : 'Please enter a task title.';
