/**
 * Shared grading utilities for Luate exams.
 *
 * Multi-item answers (TrueFalse / FillBlank / Short with subItems) are
 * encoded student-side as "ans0||ans1||ans2..." to keep the existing
 * Record<number, string> shape used by the renderer / exam URL.
 */

import { LuateQuestion, pointsPerSubItem } from '@/core/parser/luateParser';

export const SUB_SEP = '||';

const norm = (s: string) => s.toLowerCase().trim();

/**
 * Score one auto-gradeable question. Returns null when this question
 * requires manual grading (no key, or open/canvas).
 */
export function autoScoreQuestion(
  q: LuateQuestion,
  studentAnswer: string | undefined,
  correctKey: string | undefined,
): { score: number; max: number; itemResults?: boolean[] } | null {
  // Open/canvas always manual
  if (q.type === 'open' || q.type === 'canvas') return null;

  // Multi-item: per sub-item grading, partial credit
  if (q.subItems && q.subItems.length > 0) {
    if (!q.subItems.some(it => it.answer !== undefined)) return null;
    const studentItems = (studentAnswer || '').split(SUB_SEP);
    const per = pointsPerSubItem(q.points, q.subItems.length);
    let score = 0;
    const itemResults: boolean[] = [];
    q.subItems.forEach((item, i) => {
      const given = studentItems[i] || '';
      const expected = item.answer ?? '';
      const ok = !!expected && norm(given) === norm(expected);
      itemResults.push(ok);
      if (ok) score += per;
    });
    // Cap at total points (rounding can sum slightly above)
    return { score: Math.min(score, q.points), max: q.points, itemResults };
  }

  // Single answer (MCQ / Checkbox / legacy)
  if (!correctKey) return null;
  if (!studentAnswer) return { score: 0, max: q.points };

  if (q.type === 'checkbox') {
    const c = correctKey.split(',').map(norm).sort();
    const g = studentAnswer.split(',').map(norm).sort();
    return JSON.stringify(c) === JSON.stringify(g)
      ? { score: q.points, max: q.points }
      : { score: 0, max: q.points };
  }
  return norm(studentAnswer) === norm(correctKey)
    ? { score: q.points, max: q.points }
    : { score: 0, max: q.points };
}

/** True if a question must be manually graded (no key or open-ended). */
export function requiresManualGrading(q: LuateQuestion): boolean {
  if (q.type === 'open' || q.type === 'canvas') return true;
  if (q.subItems && q.subItems.length > 0) {
    return !q.subItems.some(it => it.answer !== undefined);
  }
  return !q.answer;
}

/** Decode a multi-item answer string into per-item parts. */
export function decodeSubAnswers(s: string | undefined): string[] {
  return s ? s.split(SUB_SEP) : [];
}
