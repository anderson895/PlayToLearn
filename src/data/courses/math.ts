import type { Course } from '@/types';

export const mathCourse: Course = {
  id: 'math',
  title: 'Math',
  emoji: '🧮',
  color: '#FF9600',
  description: 'Counting, arithmetic and word problems for grade school.',
  contentLanguage: 'en',
  units: [
    {
      id: 'math-u1',
      title: 'Counting & Adding',
      description: 'Numbers up to 20.',
      isFree: true,
      outline: [
        {
          id: 'math-u1-l1',
          title: 'Single-digit addition',
          description: 'Add numbers from 1 to 9.',
          topics: ['addition under 10', 'number facts'],
          questionCount: 8,
          level: 'beginner',
          xp: 10,
        },
        {
          id: 'math-u1-l2',
          title: 'Subtraction',
          description: 'Take away numbers up to 10.',
          topics: ['subtraction under 10', 'inverse of addition'],
          questionCount: 8,
          level: 'beginner',
          xp: 10,
        },
      ],
    },
    {
      id: 'math-u2',
      title: 'Multiplication',
      description: 'Times tables.',
      outline: [
        {
          id: 'math-u2-l1',
          title: 'Times tables 2 & 3',
          description: 'Multiply by 2 and 3.',
          topics: ['times-2 facts', 'times-3 facts'],
          questionCount: 8,
          level: 'easy',
          xp: 12,
        },
        {
          id: 'math-u2-l2',
          title: 'Times tables 4 & 5',
          description: 'Multiply by 4 and 5.',
          topics: ['times-4 facts', 'times-5 facts'],
          questionCount: 8,
          level: 'easy',
          xp: 12,
        },
      ],
    },
    {
      id: 'math-u3',
      title: 'Word problems',
      description: 'Read, set up, solve.',
      outline: [
        {
          id: 'math-u3-l1',
          title: 'One-step word problems',
          description: 'Translate sentences into math.',
          topics: ['add or subtract from a story', 'identifying the operation'],
          questionCount: 6,
          level: 'intermediate',
          xp: 15,
        },
      ],
    },
  ],
};
