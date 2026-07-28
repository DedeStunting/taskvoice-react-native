import { initialTaskState, taskReducer } from '../src/context/taskReducer';
import { Task } from '../src/types/task';
const task: Task = { id: '1', title: 'Call Mum', completed: false, source: 'manual',
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
describe('taskReducer', () => {
  it('hydrates saved tasks', () => expect(taskReducer(initialTaskState, { type: 'LOAD_TASKS', tasks: [task] }))
    .toMatchObject({ tasks: [task], isHydrated: true }));
  it('adds multiple tasks at the beginning', () => expect(taskReducer({ ...initialTaskState, tasks: [task] },
    { type: 'ADD_TASKS', tasks: [{ ...task, id: '2' }, { ...task, id: '3' }] }).tasks.map(item => item.id))
    .toEqual(['2', '3', '1']));
  it('toggles and timestamps a task', () => expect(taskReducer({ ...initialTaskState, tasks: [task] },
    { type: 'TOGGLE_TASK', id: '1', at: 'later' }).tasks[0]).toMatchObject({ completed: true, updatedAt: 'later' }));
  it('updates task details without changing its source or completion state', () => expect(taskReducer(
    { ...initialTaskState, tasks: [{ ...task, source: 'voice', description: 'Old note' }] },
    { type: 'UPDATE_TASK', id: '1', changes: { title: 'Updated task', dueDate: '2026-02-01' }, at: 'later' }
  ).tasks[0]).toEqual({
    ...task,
    source: 'voice',
    title: 'Updated task',
    description: undefined,
    dueDate: '2026-02-01',
    updatedAt: 'later'
  }));
  it('deletes only the matching task', () => expect(taskReducer({ ...initialTaskState, tasks: [task, { ...task, id: '2' }] },
    { type: 'DELETE_TASK', id: '1' }).tasks.map(item => item.id)).toEqual(['2']));
});
