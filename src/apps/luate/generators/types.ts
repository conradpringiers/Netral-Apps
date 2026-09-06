/**
 * Exercise Generator System — Core Types
 *
 * IMPORTANT: A generator produces ONE exercise. Use `count` to control
 * how many sub-items the exercise contains (e.g. one Short[] block with
 * 10 sub-questions, not 10 separate Short[] exercises). This keeps the
 * answer document compact and matches the "exercise = section of related
 * questions" mental model.
 *
 * To add a new generator:
 *   1. Define it in a category file (e.g. math.ts) implementing ExerciseGenerator
 *   2. Add it to the array exported from that file
 *   3. Register the array in src/apps/luate/generators/index.ts
 */

export type OutputFormat = 'mcq' | 'fill' | '1-line' | 't-f' | 'short' | 'open';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Category = 'math' | 'sciences' | 'geography' | 'history' | 'languages' | 'cs' | 'business';

/** Education level used to group generators into tabs within a subject. */
export type Level = 'primary' | 'gcse' | 'alevel';

export interface LevelMeta {
  id: Level;
  label: string;
  shortLabel: string;
}

export const LEVELS: LevelMeta[] = [
  { id: 'primary', label: 'Primary (ages 6–11)', shortLabel: 'Primary' },
  { id: 'gcse', label: 'GCSE (ages 14–16)', shortLabel: 'GCSE' },
  { id: 'alevel', label: 'A Level (ages 16–18)', shortLabel: 'A Level' },
];

export const getLevelById = (id: Level): LevelMeta =>
  LEVELS.find(l => l.id === id) ?? LEVELS[0];

export interface GeneratedQuestion {
  /** Luate syntax line, e.g. "MCQ[2;What is 2+2?;{2;3;4;5};4]" */
  syntax: string;
}

export interface GeneratorSettingField {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  default: number | string | boolean;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
}

export interface GeneratorSettings {
  /** Number of sub-items in the generated exercise (or MCQ/Open count if format is single-only). */
  count: number;
  format: OutputFormat;
  /** Total points for the exercise (split across sub-items when applicable). */
  pointsPerQuestion: number;
  difficulty: Difficulty;
  seed?: number;
  /** Generator-specific extra settings */
  custom?: Record<string, number | string | boolean>;
}

export interface ExerciseGenerator {
  id: string;
  name: string;
  description: string;
  category: Category;
  /** Education level / tab this generator belongs to */
  level: Level;
  /** Output formats this generator can produce */
  supportedFormats: OutputFormat[];
  /** Extra fields specific to this generator */
  customFields?: GeneratorSettingField[];
  /** Default custom values, used when modal opens */
  defaultCustom?: Record<string, number | string | boolean>;
  /**
   * Generate ONE exercise. For multi-item formats (t-f, fill, short/1-line)
   * the generator returns a single GeneratedQuestion containing N sub-items.
   * For single-only formats (mcq, open) it may return N separate questions.
   */
  generate: (settings: GeneratorSettings) => GeneratedQuestion[];
}

export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'math', label: 'Mathematics', emoji: '∑', color: 'text-blue-600' },
  { id: 'sciences', label: 'Sciences', emoji: '⚗︎', color: 'text-green-600' },
  { id: 'geography', label: 'Geography', emoji: '🌍', color: 'text-cyan-600' },
  { id: 'history', label: 'History', emoji: '📜', color: 'text-amber-700' },
  { id: 'languages', label: 'Languages', emoji: '🗣', color: 'text-pink-600' },
  { id: 'cs', label: 'Computer Science', emoji: '💻', color: 'text-violet-600' },
  { id: 'business', label: 'Business', emoji: '💼', color: 'text-emerald-700' },
];

// ─── Seeded RNG ─────────────────────────────────────────────────────────
// Mulberry32 — deterministic when seed is given, random otherwise

export function makeRng(seed?: number): () => number {
  let s = seed !== undefined ? seed >>> 0 : (Math.random() * 2 ** 32) >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randInt = (rng: () => number, min: number, max: number) =>
  Math.floor(rng() * (max - min + 1)) + min;

export const pick = <T>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length)];

export const shuffle = <T>(rng: () => number, arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── Helper: build Luate syntax lines ────────────────────────────────────

/** Sanitize text that would break Luate syntax (semicolons / brackets). */
const safe = (s: unknown) => String(s).replace(/[;\]\[{}]/g, ',');

/**
 * Build a single-question line. Use for MCQ / Open / Checkbox /
 * truly-single questions. For multi-item exercises, prefer buildMulti.
 */
export function buildSyntax(
  format: OutputFormat,
  points: number,
  question: string,
  answer: string,
  options?: string[]
): string {
  const q = safe(question);
  const a = safe(answer);
  const opts = options?.map(safe);

  switch (format) {
    case 'mcq': {
      const o = opts && opts.length >= 2 ? opts : [a, 'Option A', 'Option B', 'Option C'];
      return `MCQ[${points};${q};{${o.join(';')}};${a}]`;
    }
    case 'fill':
      // single-item form (legacy); prefer buildMulti for clusters
      return `FillBlank[${points};${q};${a}]`;
    case '1-line':
    case 'short':
      return `Short[${points};${q};${a}]`;
    case 't-f':
      return `TrueFalse[${points};${q};${a}]`;
    case 'open':
      return `Open[${points};${q};6;${a}]`;
  }
}

/**
 * Build a single multi-item exercise (TrueFalse / FillBlank / Short).
 * Prompts items[i].prompt, answers items[i].answer.
 *
 *   buildMulti('t-f', 3, 'Evaluate:', [{prompt:'2+2=4', answer:'true'}, ...])
 *     → "TrueFalse[3;Evaluate:;{2+2=4;true}{...}]"
 */
export function buildMulti(
  format: 't-f' | 'fill' | 'short' | '1-line',
  points: number,
  header: string,
  items: { prompt: string; answer: string }[],
): string {
  const directive = format === 't-f' ? 'TrueFalse'
    : format === 'fill' ? 'FillBlank' : 'Short';
  const blocks = items.map(it => `{${safe(it.prompt)};${safe(it.answer)}}`).join('');
  return `${directive}[${points};${safe(header)};${blocks}]`;
}

/** True if this format is rendered as a multi-item exercise. */
export function isMultiItemFormat(f: OutputFormat): boolean {
  return f === 't-f' || f === 'fill' || f === 'short' || f === '1-line';
}

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  'mcq': 'Multiple Choice',
  'fill': 'Fill the Blank',
  '1-line': 'Short Answer',
  'short': 'Short Answer',
  't-f': 'True / False',
  'open': 'Open-ended',
};

// ─── Fact-bank generator ───────────────────────────────────────────────
// Makes it trivial to add factual subjects (sciences, geography, history,
// languages, cs, business) as a list of question/answer facts.

export interface Fact {
  question: string;
  answer: string;
  /** Extra wrong answers for MCQ (correct answer is added automatically). */
  options?: string[];
  /** For True/False: whether the statement is true. Defaults to true. */
  isTrue?: boolean;
}

export interface FactGeneratorOptions {
  id: string;
  name: string;
  description: string;
  category: Category;
  level: Level;
  facts: Fact[];
  supportedFormats?: OutputFormat[];
}

export function makeFactGenerator(opts: FactGeneratorOptions): ExerciseGenerator {
  const supportedFormats: OutputFormat[] =
    opts.supportedFormats ?? ['mcq', 't-f', 'fill', 'short', '1-line', 'open'];

  return {
    id: opts.id,
    name: opts.name,
    description: opts.description,
    category: opts.category,
    level: opts.level,
    supportedFormats,
    generate: (settings) => {
      const rng = makeRng(settings.seed);
      const count = Math.max(1, Math.min(settings.count, opts.facts.length));
      const chosen = shuffle(rng, opts.facts).slice(0, count);
      const fmt = settings.format;
      const pts = Math.max(1, Math.round(settings.pointsPerQuestion));

      // Multi-item formats (t-f / fill / short) → one exercise with N sub-items
      if (isMultiItemFormat(fmt)) {
        if (fmt === 't-f') {
          const items = chosen.map(f => ({
            prompt: f.question,
            answer: (f.isTrue ?? true) ? 'true' : 'false',
          }));
          return [{ syntax: buildMulti('t-f', pts, `${opts.name}:`, items) }];
        }
        const items = chosen.map(f => ({ prompt: f.question, answer: f.answer }));
        const directive = fmt === 'fill' ? 'fill' : 'short';
        return [{ syntax: buildMulti(directive, pts, `${opts.name}:`, items) }];
      }

      // Single-question formats (mcq / open)
      if (fmt === 'open') {
        return chosen.map(f => ({ syntax: buildSyntax('open', pts, f.question, f.answer) }));
      }

      // mcq (default) — dedupe the correct answer, then shuffle among distractors
      return chosen.map(f => {
        const answer = f.answer.trim();
        const fallback = ['None of the above', 'All of the above', 'Not enough information'];
        const provided = (f.options ?? [])
          .map(o => o.trim())
          .filter(o => o && o.toLowerCase() !== answer.toLowerCase());
        const distractors = provided.length >= 2
          ? provided.slice(0, 3)
          : [...provided, ...fallback.filter(o => o.toLowerCase() !== answer.toLowerCase())].slice(0, 3);
        const options = shuffle(rng, [answer, ...distractors]);
        return { syntax: buildSyntax('mcq', pts, f.question, answer, options) };
      });
    },
  };
}
