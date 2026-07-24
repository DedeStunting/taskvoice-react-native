# TaskVoice

TaskVoice is a polished, local-first React Native task manager for capturing work by typing or speaking. A single recording such as “Buy provisions, call Mum, and submit the report” becomes three separate tasks.

## Features

- Create tasks with a required title and optional description
- Complete, reopen, search, filter, and delete tasks
- Persist all changes locally with AsyncStorage
- Record voice with clear permission, listening, processing, success, and error states
- Securely transcribe and extract multiple tasks through a backend proxy
- Preserve the full transcript as one task if AI extraction fails
- Accessible labels, large touch targets, empty states, and resilient stored-data validation
- Strict TypeScript and unit tests for central business rules

## Screenshots

The capture checklist is in [`screenshots/README.md`](screenshots/README.md). Device-generated PNGs should be added there before submission; screenshots are intentionally not fabricated.

| Empty task list | Mixed tasks | Add task |
|---|---|---|
| `01-task-list-empty.png` | `02-task-list-mixed.png` | `03-add-task-screen.png` |

| Listening | Voice results |
|---|---|
| `04-voice-listening.png` | `05-voice-results.png` |

## Stack

- Expo 57, React Native 0.86, React 19, TypeScript
- React Navigation native stack
- AsyncStorage
- Expo Audio
- Node.js, Express, Multer
- OpenAI `gpt-4o-transcribe` for speech-to-text and `gpt-5.6-luna` structured output for task extraction
- Jest

## Architecture

The mobile app uses Context plus `useReducer`. Screens call a small task API exposed by `TaskProvider`; the reducer owns deterministic state transitions, while the storage service owns serialization. Hydration must finish before automatic saves begin, preventing the initial empty state from overwriting saved tasks.

Voice processing is deliberately split into two steps:

1. Audio transcription answers “what was said?”
2. Structured extraction answers “which separate actions were said?”

The API key exists only in the Node server. The mobile bundle receives a public backend URL, never an OpenAI credential. The backend validates file presence, type, and size, requests structured JSON, deduplicates task titles, and falls back to the transcript when extraction fails.

## Setup

Requirements: Node.js 20.19+ and npm, plus Expo Go or an Android/iOS simulator.

```bash
npm install
cp .env.example .env
npm --prefix server install
cp server/.env.example server/.env
```

Set `OPENAI_API_KEY` in `server/.env`. Set `EXPO_PUBLIC_VOICE_API_URL` in the root `.env`:

- iOS simulator: `http://localhost:3001`
- Android emulator: `http://10.0.2.2:3001`
- Physical device: `http://<your-computer-LAN-IP>:3001`

The device and computer must share a network for a LAN URL. Never commit either `.env` file.

Start the backend:

```bash
npm run server
```

In another terminal, start Expo:

```bash
npm start
```

Press `i` for iOS, `a` for Android, or scan the QR code with Expo Go. Restart Expo after changing `EXPO_PUBLIC_*` values.

## Verification

```bash
npm run typecheck
npm test
npm --prefix server run typecheck
```

Manual release checks:

1. Add a task with and without a description.
2. Confirm whitespace-only titles show validation.
3. Toggle a task, restart the app, and confirm its state remains.
4. Cancel and confirm deletion.
5. Deny microphone permission and verify recovery guidance.
6. Record one task, then several actions in one sentence.
7. Stop the backend and verify the network error.
8. Search titles/descriptions and exercise all filters.

## API contract

`POST /api/voice-tasks`, multipart field `audio`:

```json
{
  "transcript": "Buy provisions and call Mum",
  "tasks": [
    { "title": "Buy provisions" },
    { "title": "Call Mum" }
  ]
}
```

`GET /health` returns `{ "status": "ok" }`.

## Decisions and trade-offs

- A native stack fits the required list → form → list flow; tabs add no value.
- Context/reducer is enough for two screens and keeps state transitions testable without Redux ceremony.
- A single AsyncStorage JSON array is simple and adequate for a personal list. Large datasets or cloud sync would warrant a database.
- Recorded files are buffered in memory on the server for a small interview app. Production should stream uploads to temporary object storage, authenticate callers, rate-limit, restrict CORS, add request IDs, and apply retention controls.
- `gpt-5.6-luna` is selected for the small, latency-sensitive extraction step; the model name can later move to configuration if cost/quality experiments require alternatives.
- Search and filters are implemented because they improve the review experience without complicating the task model.

## Known limitations

- No authentication, cloud sync, task editing, due dates, notifications, or offline voice transcription
- Voice requires the backend, internet access, and a configured OpenAI account
- Delete confirmation uses the native alert, whose appearance varies by platform
- Real device screenshots and live voice calls cannot be produced in a source-only environment

## Future improvements

- Task editing and undo deletion
- Backend authentication, rate limits, telemetry, and automated route tests
- End-to-end tests on iOS and Android
- Configurable language hints and user confirmation before adding extracted tasks
- Encrypted cloud sync and multi-device conflict resolution

## Repository map

```text
src/components    Reusable interface pieces
src/screens       Two navigation destinations
src/context       Shared task state and reducer
src/hooks         Task and recording workflows
src/services      Persistence and backend client
src/utils         Pure validation/normalization helpers
server/src        Secure voice endpoint and OpenAI services
tests             Reducer and validation tests
screenshots       Submission capture checklist
```

## Privacy

Manual tasks stay in AsyncStorage on the device. Voice audio and its transcript are sent to the configured TaskVoice backend and OpenAI for processing. A production release should present this clearly in an in-app privacy notice and publish a retention policy.
