import * as Speech from 'expo-speech';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Calls our backend AI Tutor endpoint, which proxies to OpenAI.
 * Never put OPENAI_API_KEY in the mobile app.
 *
 * Backend contract:
 *   POST /ai/tutor   { subject, language, level, history[] }  ->  { reply }
 */
export async function askTutor(args: {
  authToken: string;
  subject: string;
  language: string;
  level: string;
  history: TutorMessage[];
}): Promise<string> {
  if (!API_URL) return localFallback(args);
  const res = await fetch(`${API_URL}/ai/tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify({
      subject: args.subject,
      language: args.language,
      level: args.level,
      history: args.history,
    }),
  });
  if (!res.ok) throw new Error('AI tutor unavailable');
  const json = await res.json();
  return json.reply as string;
}

/** Speak a message back to the user via on-device TTS. */
export async function speak(text: string, language = 'en-US') {
  Speech.stop();
  Speech.speak(text, { language, pitch: 1.05, rate: 0.95 });
}

export function stopSpeaking() {
  Speech.stop();
}

/* ------------------------- local dev fallback ------------------------- */

function localFallback({
  subject,
  language,
  history,
}: {
  subject: string;
  language: string;
  history: TutorMessage[];
}): Promise<string> {
  const last = history[history.length - 1]?.content ?? '';
  const lower = last.toLowerCase();
  let reply: string;
  if (subject === 'math') {
    reply =
      'Great question! Let me walk you through it step by step. ' +
      'Try writing the numbers down and counting along with me — what do you get when you add them?';
  } else if (subject === 'chess') {
    reply =
      "In chess, every piece has its own moves. Let's start with the pawn — it moves forward one square, but captures diagonally. Want to try a puzzle?";
  } else if (lower.includes('hello') || lower.includes('hi')) {
    reply = `Hi! I'm your Play to Learn tutor. Ready to practice ${subject} in ${language}?`;
  } else {
    reply = `Awesome — let's practice ${subject} together. Tell me what part feels tricky and I'll explain it with a fun example.`;
  }
  return new Promise((r) => setTimeout(() => r(reply), 600));
}
