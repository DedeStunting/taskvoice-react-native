import { Router } from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { extractTasks } from '../services/extractTasks.js';
import { transcribeAudio } from '../services/transcribeAudio.js';

const maxBytes = Number(process.env.MAX_AUDIO_MB ?? 20) * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 1 }
});
export function voiceTasksRouter(client: OpenAI) {
  const router = Router();
  router.post('/', upload.single('audio'), async (request, response) => {
    if (!request.file) {
      response.status(400).json({ error: 'An audio file is required.' });
      return;
    }
    if (!request.file.mimetype.startsWith('audio/')) {
      response.status(415).json({ error: 'The uploaded file must be audio.' });
      return;
    }
    try {
      const transcript = await transcribeAudio(
        client,
        request.file.buffer,
        request.file.originalname,
        request.file.mimetype
      );
      if (!transcript) {
        response.status(422).json({ error: 'No speech was detected.' });
        return;
      }
      try {
        const tasks = await extractTasks(client, transcript);
        // A usable transcript still becomes a task if structured extraction returns nothing.
        response.json(
          tasks.length
            ? { transcript, tasks }
            : { transcript, tasks: [{ title: transcript }], fallback: true }
        );
      } catch {
        // Extraction is an enhancement; transcription alone is sufficient for a valid response.
        response.json({ transcript, tasks: [{ title: transcript }], fallback: true });
      }
    } catch (error) {
      console.error('Voice processing failed:', error instanceof Error ? error.message : error);
      response.status(502).json({ error: 'Unable to process audio.' });
    }
  });
  return router;
}
