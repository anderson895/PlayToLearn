import type { Course } from '@/types';

export const japaneseCourse: Course = {
  id: 'japanese',
  title: 'Japanese',
  emoji: '🇯🇵',
  color: '#CE82FF',
  description: 'Hiragana, greetings, and basic phrases.',
  contentLanguage: 'ja',
  units: [
    {
      id: 'jp-u1',
      title: 'Hiragana 1',
      description: 'Vowel row: あ い う え お',
      isFree: true,
      outline: [
        {
          id: 'jp-u1-l1',
          title: 'Vowels',
          description: 'Read your first hiragana.',
          topics: ['hiragana vowel row', 'romaji reading'],
          vocab: ['あ=a', 'い=i', 'う=u', 'え=e', 'お=o'],
          questionCount: 6,
          level: 'beginner',
          xp: 10,
        },
      ],
    },
    {
      id: 'jp-u2',
      title: 'Greetings',
      description: 'Konnichiwa!',
      outline: [
        {
          id: 'jp-u2-l1',
          title: 'Hello & Thanks',
          description: 'Polite phrases.',
          topics: ['time-of-day greetings', 'polite expressions'],
          vocab: ['Konnichiwa', 'Ohayō', 'Konbanwa', 'Arigatō', 'Sayōnara'],
          questionCount: 8,
          level: 'beginner',
          xp: 12,
        },
      ],
    },
  ],
};
