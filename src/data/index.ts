import type { Course, LessonOutline, SubjectId, Unit } from '@/types';
import { englishCourse } from './courses/english';
import { mathCourse } from './courses/math';
import { spanishCourse } from './courses/spanish';
import { japaneseCourse } from './courses/japanese';
import { filipinoCourse } from './courses/filipino';
import { chessCourse } from './courses/chess';

export const COURSES: Course[] = [
  englishCourse,
  mathCourse,
  spanishCourse,
  japaneseCourse,
  filipinoCourse,
  chessCourse,
];

export function getCourse(id: SubjectId): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function findOutline(
  outlineId: string,
): { course: Course; unit: Unit; outline: LessonOutline } | null {
  for (const course of COURSES) {
    for (const unit of course.units) {
      const outline = unit.outline.find((o) => o.id === outlineId);
      if (outline) return { course, unit, outline };
    }
  }
  return null;
}
