import { normaliseVoiceTasks } from '../src/utils/normaliseVoiceTasks';
import { validateTaskTitle } from '../src/utils/taskValidation';
describe('validation', () => {
  it('rejects blank manual titles', () => expect(validateTaskTitle('   ')).toBe('Please enter a task title.'));
  it('accepts a trimmed title', () => expect(validateTaskTitle(' Submit report ')).toBeNull());
  it('normalises, filters and deduplicates voice tasks', () => expect(normaliseVoiceTasks([
    { title: ' Call Mum. ' }, { title: 'call mum' }, { title: ' ' }, { nope: true }
  ])).toEqual([{ title: 'Call Mum' }]));
  it('rejects a non-array response', () => expect(normaliseVoiceTasks({ tasks: [] })).toEqual([]));
});
