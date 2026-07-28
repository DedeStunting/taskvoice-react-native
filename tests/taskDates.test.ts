import { Task } from '../src/types/task';
import {
  addDays,
  formatDueDate,
  fromDateOnly,
  getDueDateState,
  isDateOnly,
  sortTasks,
  toDateOnly
} from '../src/utils/taskDates';

const makeTask = (id: string, createdAt: string, dueDate?: string): Task => ({
  id,
  title: id,
  completed: false,
  source: 'manual',
  createdAt,
  updatedAt: createdAt,
  ...(dueDate ? { dueDate } : {})
});

describe('task dates', () => {
  const today = new Date(2026, 6, 28, 12);

  it('round-trips a local date without a timezone shift', () => {
    expect(toDateOnly(fromDateOnly('2026-07-28'))).toBe('2026-07-28');
  });

  it('validates real date-only strings', () => {
    expect(isDateOnly('2026-02-28')).toBe(true);
    expect(isDateOnly('2026-02-30')).toBe(false);
    expect(isDateOnly('28/07/2026')).toBe(false);
  });

  it('adds days using local calendar arithmetic', () => {
    expect(toDateOnly(addDays(today, 7))).toBe('2026-08-04');
  });

  it('classifies overdue, today and upcoming dates', () => {
    expect(getDueDateState('2026-07-27', today)).toBe('overdue');
    expect(getDueDateState('2026-07-28', today)).toBe('today');
    expect(getDueDateState('2026-07-29', today)).toBe('upcoming');
  });

  it('uses clear relative due-date labels', () => {
    expect(formatDueDate('2026-07-28', today)).toBe('Due today');
    expect(formatDueDate('2026-07-29', today)).toBe('Due tomorrow');
    expect(formatDueDate('2026-07-27', today)).toContain('Overdue');
  });

  it('sorts due dates soonest first and keeps undated tasks last', () => {
    const tasks = [
      makeTask('none', '2026-07-28T12:00:00.000Z'),
      makeTask('later', '2026-07-28T10:00:00.000Z', '2026-08-04'),
      makeTask('soon', '2026-07-28T11:00:00.000Z', '2026-07-29')
    ];
    expect(sortTasks(tasks, 'due-asc').map(task => task.id)).toEqual(['soon', 'later', 'none']);
  });

  it('sorts due dates latest first and keeps undated tasks last', () => {
    const tasks = [
      makeTask('none', '2026-07-28T12:00:00.000Z'),
      makeTask('later', '2026-07-28T10:00:00.000Z', '2026-08-04'),
      makeTask('soon', '2026-07-28T11:00:00.000Z', '2026-07-29')
    ];
    expect(sortTasks(tasks, 'due-desc').map(task => task.id)).toEqual(['later', 'soon', 'none']);
  });

  it('does not mutate the source array while sorting newest first', () => {
    const tasks = [
      makeTask('old', '2026-07-27T12:00:00.000Z'),
      makeTask('new', '2026-07-28T12:00:00.000Z')
    ];
    expect(sortTasks(tasks, 'created-desc').map(task => task.id)).toEqual(['new', 'old']);
    expect(tasks.map(task => task.id)).toEqual(['old', 'new']);
  });
});
