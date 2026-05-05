import type { Course } from '@/types';

export const spanishCourse: Course = {
  id: 'spanish',
  title: 'Spanish',
  emoji: '🇪🇸',
  color: '#FFC800',
  description: 'Spanish for beginners — greetings, food, family.',
  contentLanguage: 'es',
  units: [
    {
      id: 'es-u1',
      title: 'Hola — Greetings',
      description: 'First words in Spanish.',
      isFree: true,
      outline: [
        {
          id: 'es-u1-l1',
          title: 'Saludos básicos',
          description: 'Hello, goodbye, please, thank you.',
          topics: ['greetings', 'polite phrases'],
          vocab: ['Hola', 'Adiós', 'Gracias', 'Por favor', 'Buenos días'],
          questionCount: 6,
          level: 'beginner',
          xp: 10,
        },
      ],
    },
    {
      id: 'es-u2',
      title: 'Familia',
      description: 'Family words.',
      outline: [
        {
          id: 'es-u2-l1',
          title: 'Mi familia',
          description: 'Mother, father, sister, brother.',
          topics: ['immediate family', 'gender of nouns'],
          vocab: ['madre', 'padre', 'hermano', 'hermana', 'abuelo', 'abuela'],
          questionCount: 8,
          level: 'easy',
          xp: 12,
        },
      ],
    },
    {
      id: 'es-u3',
      title: 'Comida',
      description: 'Food and drinks.',
      outline: [
        {
          id: 'es-u3-l1',
          title: 'En el restaurante',
          description: 'Order food and drinks.',
          topics: ['food vocabulary', 'ordering politely'],
          vocab: ['agua', 'pan', 'café', 'arroz', 'pollo', 'manzana'],
          questionCount: 8,
          level: 'intermediate',
          xp: 14,
        },
      ],
    },
  ],
};
