# Play to Learn

Duolingo-style e-learning mobile app for iOS and Android, built with **Expo (React Native)**.

Subjects: English, Math, Spanish, Japanese, Filipino, and Chess — with quizzes, an **AI Tutor** (text + voice), subscriptions via **PayMongo** (Card / GCash), and asset hosting on **Cloudinary**.

> **You only provide outlines. The AI writes the lessons.**
> Each course is defined as a tree of *outlines* — title + topics + vocab + question count.
> The AI Tutor (OpenAI) turns each outline into quiz questions on demand.

---

## How content works (outlines-only)

You **never write quiz questions by hand**. You just author outlines like this in `src/data/courses/<subject>.ts`:

```ts
{
  id: 'eng-u1-l1',
  title: 'Hello & Goodbye',
  description: 'Common greetings.',
  topics: ['formal vs casual greetings', 'time-of-day greetings', 'goodbyes'],
  vocab: ['Hello', 'Hi', 'Good morning', 'Good night', 'Goodbye'],
  questionCount: 6,
  level: 'beginner',
  xp: 10,
}
```

When a user opens a lesson, `src/services/aiContent.ts` calls the backend's
`POST /ai/generate-lesson` endpoint. The backend builds an OpenAI prompt from
the outline and returns a `Lesson` with `QuizQuestion[]`. The result is cached
locally in `AsyncStorage`, so the same lesson is fast forever after the first open.

### Subscription gating (DramaBox-style)

- Each `Unit` can be marked `isFree: true` to give a free taster.
- All other units are **locked** behind Plus.
- Tapping a locked lesson opens the **subscription** screen.
- AI Tutor is free for the first 3 messages, then prompts to upgrade.
- Paywall lives in `app/lesson/[id].tsx` and `app/(tabs)/index.tsx`.

---

## Quick start

```bash
npm install
cp .env.example .env       # PowerShell: Copy-Item .env.example .env
npx expo start              # press i for iOS, a for Android, w for web
```

Without a backend the app runs end-to-end against local stubs (auth, AI generation, subscriptions). Useful for demos.

---

## Project structure

```
app/                        # Expo Router pages
  (auth)/                   # login, register
  (tabs)/                   # learn, courses, tutor, profile
  lesson/[id].tsx           # AI-generated lesson player + paywall
  subscription.tsx          # PayMongo Card + GCash flow

src/
  services/
    auth.ts                 # JWT + secure storage
    aiContent.ts            # generates lessons from outlines (cached)
    aiTutor.ts              # chat + on-device TTS
    paymongo.ts             # tokenize cards, create subscription / GCash source
    cloudinary.ts           # unsigned uploads + CDN URLs
  data/courses/             # OUTLINES ONLY — edit these to change content
  store/userStore.ts        # Zustand + AsyncStorage
  i18n/                     # English, Filipino, Spanish UI translations
  components/               # Button, TextField, ProgressBar, QuestionCard, StatBar
  constants/                # theme tokens, subscription plans
  types/                    # shared TS types
```

---

## Backend: Firebase (no own server needed)

The default backend is **Firebase** — no server to deploy.

| Concern | Service |
|---|---|
| Auth (email + password) | **Firebase Auth** |
| User profiles, XP, streak, completed lessons, subscription state | **Cloud Firestore** |
| Image / audio uploads | **Firebase Storage** |
| AI Tutor + lesson generator (later) | **Firebase Cloud Functions** proxying OpenAI |
| Payments (later) | **Cloud Functions** proxying PayMongo |

### Setup (one-time)

1. Go to https://console.firebase.google.com and create a project.
2. Add a **Web app** (yes, web — RN/Expo uses the JS SDK). Copy the config.
3. In `.env`, fill the `EXPO_PUBLIC_FIREBASE_*` values.
4. In **Authentication → Sign-in method**, enable **Email/Password**.
5. In **Firestore Database**, create a database (start in production mode).
6. Paste the Firestore rules below, then click Publish.
7. Restart Metro (`npx expo start -c`). New users that register will appear in **Firebase Auth → Users** and Firestore → `users/{uid}`.

### Firestore Security Rules (paste into the Firebase console)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, update: if request.auth != null && request.auth.uid == uid;
      allow create: if request.auth != null && request.auth.uid == uid;
      allow delete: if false;
    }
  }
}
```

### Adding AI later (Cloud Functions)

When you're ready to enable real AI lesson generation + tutor:

```bash
npm install -g firebase-tools
firebase login
firebase init functions   # TypeScript, install deps
```

Add a callable function that wraps OpenAI (key only lives in Cloud Functions secrets):

```ts
// functions/src/index.ts
import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';

const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');

export const generateLesson = onCall({ secrets: [OPENAI_API_KEY] }, async (req) => {
  if (!req.auth) throw new Error('Sign in required');
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
  const { subject, language, outline } = req.data;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_GENERATE_LESSON },
      { role: 'user', content: JSON.stringify({ subject, language, outline }) },
    ],
  });
  return { lesson: JSON.parse(completion.choices[0].message.content!) };
});
```

Deploy with `firebase deploy --only functions`, then swap the `fetch` calls in `src/services/aiContent.ts` and `aiTutor.ts` for `httpsCallable(functions, 'generateLesson')`.

---

## Backend you provide (only if you don't use Firebase)

If you'd rather run your own server instead of Firebase, point `EXPO_PUBLIC_API_URL` at it and expose:

| Endpoint | Body | Purpose |
|---|---|---|
| `POST /auth/register` | `{ name, email, password }` | create user, return `{ token, user }` |
| `POST /auth/login` | `{ email, password }` | issue JWT |
| `POST /ai/generate-lesson` | `{ subject, language, outline }` | call OpenAI, return `{ lesson }` |
| `POST /ai/tutor` | `{ subject, language, level, history }` | proxy chat to OpenAI, return `{ reply }` |
| `POST /subscriptions` | `{ planId, paymentMethodId, source }` | create PayMongo subscription with secret key |
| `POST /payments/gcash` | `{ planId }` | create PayMongo GCash *Source*, return `{ checkoutUrl, sourceId }` |
| `POST /webhooks/paymongo` | PayMongo event | activate / cancel subscriptions |

Why a backend? Both `PAYMONGO_SECRET_KEY` and `OPENAI_API_KEY` must **never** ship inside the mobile binary.

### Suggested stack
- **Node.js + Express / Fastify** or **Next.js Route Handlers**
- Postgres (users, subscriptions, completed lessons)
- OpenAI SDK (`openai`) — `gpt-4o-mini` for cost-effective lesson generation, `gpt-4o` for the tutor.
  Use **JSON mode** (`response_format: { type: 'json_object' }`) when generating lessons so the
  reply parses straight into the `Lesson` shape.

### Sample `/ai/generate-lesson` system prompt

```
You are a curriculum writer for "Play to Learn", a Duolingo-style kids' app.

Subject: {{subject}}    Language: {{language}}    Level: {{outline.level}}
Lesson title: {{outline.title}}
Topics to cover:
{{#each outline.topics}}- {{this}}
{{/each}}
Vocabulary to drill (if any): {{outline.vocab}}

Return ONLY valid JSON matching this TypeScript shape:

interface Lesson {
  id: string;          // use "{{outline.id}}"
  title: string;       // use "{{outline.title}}"
  description: string; // use "{{outline.description}}"
  xp: number;          // use {{outline.xp}}
  questions: Array<{
    id: string;
    type: 'multiple-choice' | 'translate' | 'match' | 'listen';
    prompt: string;
    choices: string[];   // exactly 4
    answer: string;      // must be one of choices
    hint?: string;
  }>;
}

Generate exactly {{outline.questionCount}} questions. Mix question types. Keep
language age-appropriate. Never include offensive content.
```

### Sample `/ai/tutor` system prompt

```
You are "Owly", a kid-friendly tutor for Play to Learn. Subject: {{subject}}.
Use the learner's UI language ({{language}}) and level ({{level}}).
Answer in 2–4 short sentences. Encourage. Offer a tiny example. Never reveal
answers to a quiz they're currently taking.
```

### Sample backend handler (Node.js + OpenAI SDK)

```ts
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /ai/generate-lesson
app.post('/ai/generate-lesson', async (req, res) => {
  const { subject, language, outline } = req.body;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_GENERATE_LESSON },
      { role: 'user', content: JSON.stringify({ subject, language, outline }) },
    ],
  });
  const lesson = JSON.parse(completion.choices[0].message.content!);
  res.json({ lesson });
});

// POST /ai/tutor
app.post('/ai/tutor', async (req, res) => {
  const { subject, language, level, history } = req.body;
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_TUTOR(subject, language, level) },
      ...history,
    ],
  });
  res.json({ reply: completion.choices[0].message.content });
});
```

---

## PayMongo setup

1. Create an account at https://dashboard.paymongo.com.
2. Copy your **public** and **secret** keys into `.env`.
3. Add a webhook on the dashboard pointing at your backend's `/webhooks/paymongo` for:
   - `subscription.active`
   - `subscription.cancelled`
   - `payment.paid`
   - `payment.failed`
   - `source.chargeable` (used by GCash)
4. On `source.chargeable` (GCash), your backend creates a `payment` against the source.

The mobile app:
- Tokenizes card details with the **public** key only (`createPaymentMethodCard`).
- Calls your backend, which uses the **secret** key to create the subscription.
- Opens a WebView for any 3DS / GCash redirect URL returned, and listens for `success`/`failed` in the URL to flip the user to "subscribed".

---

## Cloudinary setup

1. Create an account at https://cloudinary.com.
2. Settings → Upload → add an **unsigned** preset (e.g. `playtolearn_unsigned`).
3. Put your cloud name + preset name in `.env`.
4. Use `uploadToCloudinary(uri)` from `@/services/cloudinary` for any user-uploaded media.

---

## Adding a new course

1. Create `src/data/courses/<id>.ts` and export a `Course` object with units & outlines.
2. Add it to `COURSES` in `src/data/index.ts`.
3. Add the matching subject id to the `SubjectId` union in `src/types/index.ts`.

That's it — no quiz authoring needed.

---

## Building for iOS & Android

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview     # APK for internal testing
eas build -p ios --profile preview         # ad-hoc / TestFlight
eas build --profile production -p all
eas submit -p ios
eas submit -p android
```

Update `app.json` → `expo.ios.bundleIdentifier`, `expo.android.package`, and `expo.extra.eas.projectId` before building.

---

## Roadmap

- [ ] Speech-to-text answer mode (`expo-av` recording → Whisper)
- [ ] Leaderboards (weekly leagues)
- [ ] Offline lesson cache for Plus subscribers
- [ ] Family dashboard (parental controls)
- [ ] Image / video lessons hosted on Cloudinary
- [ ] Push notifications for streak reminders (`expo-notifications`)

---

## License

Proprietary — © Play to Learn.
