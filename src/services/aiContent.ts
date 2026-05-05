/**
 * AI lesson generator.
 *
 * The mobile app sends a LessonOutline to the backend, which calls OpenAI
 * (recommended: gpt-4o or gpt-4o-mini in JSON mode) and returns a Lesson
 * with QuizQuestion[].
 *
 * Why a backend? OPENAI_API_KEY must NEVER live in the mobile app.
 *
 * Backend contract:
 *   POST /ai/generate-lesson
 *   body: { subject, language, outline }
 *   200:  { lesson: Lesson }
 *
 * Locally (no backend), we synthesize a believable lesson so the app demos.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lesson, LessonOutline, QuizQuestion } from '@/types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const CACHE_PREFIX = '@playtolearn/lesson/';

export async function getOrGenerateLesson(args: {
  authToken: string;
  subject: string;
  language: string;
  outline: LessonOutline;
}): Promise<Lesson> {
  const cacheKey = CACHE_PREFIX + args.outline.id;
  const cached = await AsyncStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as Lesson;
    } catch {
      // fall through and regenerate
    }
  }
  const lesson = await generateLesson(args);
  await AsyncStorage.setItem(cacheKey, JSON.stringify(lesson));
  return lesson;
}

export async function generateLesson(args: {
  authToken: string;
  subject: string;
  language: string;
  outline: LessonOutline;
}): Promise<Lesson> {
  if (API_URL) {
    const res = await fetch(`${API_URL}/ai/generate-lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${args.authToken}`,
      },
      body: JSON.stringify({
        subject: args.subject,
        language: args.language,
        outline: args.outline,
      }),
    });
    if (!res.ok) throw new Error(`AI generation failed (${res.status})`);
    const json = await res.json();
    return json.lesson as Lesson;
  }
  // Local dev fallback — no API key required.
  return synthesize(args.outline, args.subject);
}

export async function clearLessonCache(outlineId?: string) {
  if (outlineId) {
    await AsyncStorage.removeItem(CACHE_PREFIX + outlineId);
    return;
  }
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(CACHE_PREFIX)));
}

/* ----------------------- local fallback generator ----------------------- */

function synthesize(outline: LessonOutline, subject: string): Lesson {
  const topics = outline.topics.length ? outline.topics : [outline.title];
  const vocab = outline.vocab ?? [];
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < outline.questionCount; i++) {
    const topic = topics[i % topics.length];
    if (vocab.length >= 4 && i % 2 === 0) {
      const answer = vocab[i % vocab.length];
      const distractors = vocab.filter((v) => v !== answer).slice(0, 3);
      while (distractors.length < 3) distractors.push(`option ${distractors.length + 1}`);
      questions.push({
        id: `${outline.id}-q${i + 1}`,
        type: 'multiple-choice',
        prompt: `Which one matches: ${topic}?`,
        choices: shuffle([answer, ...distractors]),
        answer,
      });
    } else {
      questions.push({
        id: `${outline.id}-q${i + 1}`,
        type: 'multiple-choice',
        prompt: `${subject}: ${topic} — pick the correct answer.`,
        choices: shuffle(['Correct', 'Almost', 'Not quite', 'Try again']),
        answer: 'Correct',
      });
    }
  }

  return {
    id: outline.id,
    title: outline.title,
    description: outline.description,
    xp: outline.xp,
    questions,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
