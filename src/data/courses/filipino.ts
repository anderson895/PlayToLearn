import type { Course } from '@/types';

export const filipinoCourse: Course = {
  id: 'filipino',
  title: 'Filipino',
  emoji: '🇵🇭',
  color: '#58CC02',
  description: 'Wikang Filipino para sa mga nag-aaral.',
  contentLanguage: 'fil',
  units: [
    {
      id: 'fil-u1',
      title: 'Pagbati',
      description: 'Greetings in Filipino.',
      isFree: true,
      outline: [
        {
          id: 'fil-u1-l1',
          title: 'Magandang araw!',
          description: 'Common greetings.',
          topics: ['time-of-day greetings', 'polite expressions'],
          vocab: ['Magandang umaga', 'Magandang hapon', 'Magandang gabi', 'Salamat', 'Paalam'],
          questionCount: 6,
          level: 'beginner',
          xp: 10,
        },
      ],
    },
    {
      id: 'fil-u2',
      title: 'Pamilya',
      description: 'Family in Filipino.',
      outline: [
        {
          id: 'fil-u2-l1',
          title: 'Mga miyembro',
          description: 'Family members.',
          topics: ['immediate family', 'extended family'],
          vocab: ['Nanay', 'Tatay', 'Ate', 'Kuya', 'Lolo', 'Lola'],
          questionCount: 8,
          level: 'easy',
          xp: 12,
        },
      ],
    },
  ],
};
