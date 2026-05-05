import type { Course } from '@/types';

export const chessCourse: Course = {
  id: 'chess',
  title: 'Chess',
  emoji: '♟️',
  color: '#3C3C3C',
  description: 'Learn how to play chess from zero.',
  contentLanguage: 'en',
  units: [
    {
      id: 'ch-u1',
      title: 'Pieces',
      description: 'Meet the pieces and their moves.',
      isFree: true,
      outline: [
        {
          id: 'ch-u1-l1',
          title: 'The Pawn',
          description: 'How pawns move and capture.',
          topics: ['pawn forward move', 'pawn diagonal capture', 'first-move two squares', 'promotion'],
          questionCount: 6,
          level: 'beginner',
          xp: 10,
        },
        {
          id: 'ch-u1-l2',
          title: 'The Knight',
          description: 'L-shaped moves.',
          topics: ['knight L-shape move', 'jumping over pieces', 'knight captures'],
          questionCount: 6,
          level: 'beginner',
          xp: 12,
        },
      ],
    },
    {
      id: 'ch-u2',
      title: 'Checkmate',
      description: 'Ending the game.',
      outline: [
        {
          id: 'ch-u2-l1',
          title: 'Check vs Checkmate',
          description: 'What is the difference?',
          topics: ['definition of check', 'definition of checkmate', 'stalemate'],
          questionCount: 6,
          level: 'easy',
          xp: 12,
        },
      ],
    },
    {
      id: 'ch-u3',
      title: 'Tactics',
      description: 'Forks, pins and skewers.',
      outline: [
        {
          id: 'ch-u3-l1',
          title: 'Forks',
          description: 'Attack two pieces at once.',
          topics: ['knight forks', 'queen forks'],
          questionCount: 6,
          level: 'intermediate',
          xp: 15,
        },
      ],
    },
  ],
};
