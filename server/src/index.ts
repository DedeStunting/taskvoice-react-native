import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import OpenAI from 'openai';
import { voiceTasksRouter } from './routes/voiceTasks.js';

if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is required');
const app = express();
const port = Number(process.env.PORT ?? 3001);
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});
app.disable('x-powered-by');
app.use(cors());
app.get('/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/voice-tasks', voiceTasksRouter(client));
app.use((_request, response) => response.status(404).json({ error: 'Not found.' }));
app.listen(port, '0.0.0.0', () => console.log(`TaskVoice server listening on port ${port}`));
