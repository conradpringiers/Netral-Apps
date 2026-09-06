/**
 * Netral Luate Parser
 * Parses exam/quiz syntax into structured data
 *
 * Multi-item types (TrueFalse / FillBlank / Short):
 *   TrueFalse[3;Évalue:;{La Terre est ronde;true}{Pi est rationnel;false}{2+2=4;true}]
 *   FillBlank[4;Complète:;{Capitale: ___;Paris}{Auteur d'Hamlet: ___;Shakespeare}]
 *   Short[6;Réponds:;{2+2?;4}{5×5?;25}]
 * Single-question (legacy, auto-promoted to 1 sub-item):
 *   TrueFalse[1;The earth is round;true]
 *   Short[2;What is 2+2?;4]
 *   FillBlank[2;Capital of France is ___;Paris]
 *
 * Other types stay single:
 *   MCQ[2;Q?;{A;B;C;D};A]
 *   Checkbox[3;Pick all;{A;B;C};A,C]
 *   Open[5;Explain X;6;optional answer]
 *   Canvas[0;Draw the circuit;200]
 */

import { ThemeName } from '@/core/themes/themes';

// ─── Types ──────────────────────────────────────────────────────────────

export type QuestionType = 'mcq' | 'checkbox' | 'open' | 'short' | 'truefalse' | 'fillblank' | 'canvas';

export interface LuateSubItem {
  prompt: string;
  answer?: string;
}

export interface LuateQuestion {
  type: QuestionType;
  points: number;
  question: string;          // Header / instruction (for multi-item) or full question
  options?: string[];        // MCQ / Checkbox
  lines?: number;            // Open
  answer?: string;           // MCQ / Checkbox / Open
  canvasHeight?: number;     // Canvas
  subItems?: LuateSubItem[]; // TrueFalse / FillBlank / Short — when multi-item
}

export interface LuateSection {
  title: string;
  questions: LuateQuestion[];
  totalPoints: number;
}

export interface LuateDocument {
  title: string;
  theme: ThemeName;
  subtitle?: string;
  duration?: string;
  instructions?: string;
  sections: LuateSection[];
  totalPoints: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Parse a sequence of "{text;text}{text;text}" blocks. Returns null if none. */
function parseSubItemBlocks(rest: string): LuateSubItem[] | null {
  const items: LuateSubItem[] = [];
  const re = /\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest)) !== null) {
    const parts = m[1].split(';');
    items.push({
      prompt: (parts[0] || '').trim(),
      answer: parts[1]?.trim() || undefined,
    });
  }
  return items.length > 0 ? items : null;
}

/** Per-item points (rounded to nearest integer, min 1). */
export function pointsPerSubItem(totalPoints: number, count: number): number {
  if (count <= 0) return 0;
  return Math.max(1, Math.round(totalPoints / count));
}

// ─── Parser ──────────────────────────────────────────────────────────────

export function parseLuateDocument(source: string): LuateDocument {
  const lines = source.split('\n');

  let title = 'Exam';
  let theme: ThemeName = 'Modern';
  let subtitle: string | undefined;
  let duration: string | undefined;
  let instructions: string | undefined;
  const sections: LuateSection[] = [];
  let currentSection: LuateSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const titleMatch = line.match(/^---\s+(.+)$/);
    if (titleMatch) { title = titleMatch[1].trim(); continue; }

    const themeMatch = line.match(/^Theme\[([^\]]+)\]$/i);
    if (themeMatch) { theme = themeMatch[1].trim() as ThemeName; continue; }

    const subMatch = line.match(/^Subtitle\[([^\]]+)\]$/i);
    if (subMatch) { subtitle = subMatch[1].trim(); continue; }

    const durMatch = line.match(/^Duration\[([^\]]+)\]$/i);
    if (durMatch) { duration = durMatch[1].trim(); continue; }

    const instrMatch = line.match(/^Instructions\[([^\]]+)\]$/i);
    if (instrMatch) { instructions = instrMatch[1].trim(); continue; }

    const sectionMatch = line.match(/^--\s+(.+)$/);
    if (sectionMatch) {
      currentSection = { title: sectionMatch[1].trim(), questions: [], totalPoints: 0 };
      sections.push(currentSection);
      continue;
    }

    // Auto-create default section
    if (!currentSection && line.match(/^(MCQ|Checkbox|Open|Short|TrueFalse|FillBlank|Canvas)\[/i)) {
      currentSection = { title: 'Questions', questions: [], totalPoints: 0 };
      sections.push(currentSection);
    }

    if (!currentSection) continue;

    // MCQ[points;question;{opts};answer?]
    const mcqMatch = line.match(/^MCQ\[(\d+);([^;]+);\{([^}]+)\}(?:;([^\]]*))?\]$/i);
    if (mcqMatch) {
      const pts = parseInt(mcqMatch[1]);
      currentSection.questions.push({
        type: 'mcq', points: pts,
        question: mcqMatch[2].trim(),
        options: mcqMatch[3].split(';').map(o => o.trim()),
        answer: mcqMatch[4]?.trim() || undefined,
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // Checkbox[points;question;{opts};answer?]
    const cbMatch = line.match(/^Checkbox\[(\d+);([^;]+);\{([^}]+)\}(?:;([^\]]*))?\]$/i);
    if (cbMatch) {
      const pts = parseInt(cbMatch[1]);
      currentSection.questions.push({
        type: 'checkbox', points: pts,
        question: cbMatch[2].trim(),
        options: cbMatch[3].split(';').map(o => o.trim()),
        answer: cbMatch[4]?.trim() || undefined,
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // Open[points;question] or Open[points;question;lines?;answer?]
    const openMatch = line.match(/^Open\[(\d+);([^\]]+)\]$/i);
    if (openMatch) {
      const pts = parseInt(openMatch[1]);
      const parts = openMatch[2].split(';');
      currentSection.questions.push({
        type: 'open', points: pts,
        question: parts[0].trim(),
        lines: parts.length >= 2 && !isNaN(parseInt(parts[1])) ? parseInt(parts[1]) : 6,
        answer: parts.length >= 2 && isNaN(parseInt(parts[1])) ? parts[1].trim() :
                parts.length >= 3 ? parts[2].trim() : undefined,
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // ── Multi-item or legacy: TrueFalse / FillBlank / Short ──
    // Try multi first: Type[points;header;{q;a}{q;a}...]
    const multiTypes: { rx: RegExp; type: QuestionType }[] = [
      { rx: /^TrueFalse\[(\d+);([^;{]+);(\{.+\})\]$/i, type: 'truefalse' },
      { rx: /^FillBlank\[(\d+);([^;{]+);(\{.+\})\]$/i, type: 'fillblank' },
      { rx: /^Short\[(\d+);([^;{]+);(\{.+\})\]$/i, type: 'short' },
    ];
    let matched = false;
    for (const { rx, type } of multiTypes) {
      const m = line.match(rx);
      if (m) {
        const pts = parseInt(m[1]);
        const subItems = parseSubItemBlocks(m[3]);
        if (subItems) {
          currentSection.questions.push({
            type, points: pts,
            question: m[2].trim(),
            subItems,
          });
          currentSection.totalPoints += pts;
          matched = true;
          break;
        }
      }
    }
    if (matched) continue;

    // Legacy single: Short[pts;q;answer?]  → promoted to subItems[1]
    const shortMatch = line.match(/^Short\[(\d+);([^\]]+)\]$/i);
    if (shortMatch) {
      const pts = parseInt(shortMatch[1]);
      const parts = shortMatch[2].split(';');
      const prompt = parts[0].trim();
      const answer = parts[1]?.trim() || undefined;
      currentSection.questions.push({
        type: 'short', points: pts,
        question: prompt,
        subItems: [{ prompt, answer }],
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // Legacy TrueFalse[pts;statement;answer?]
    const tfMatch = line.match(/^TrueFalse\[(\d+);([^\]]+)\]$/i);
    if (tfMatch) {
      const pts = parseInt(tfMatch[1]);
      const parts = tfMatch[2].split(';');
      const prompt = parts[0].trim();
      const answer = parts[1]?.trim() || undefined;
      currentSection.questions.push({
        type: 'truefalse', points: pts,
        question: prompt,
        subItems: [{ prompt, answer }],
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // Legacy FillBlank[pts;sentence;answer?]
    const fbMatch = line.match(/^FillBlank\[(\d+);([^\]]+)\]$/i);
    if (fbMatch) {
      const pts = parseInt(fbMatch[1]);
      const parts = fbMatch[2].split(';');
      const prompt = parts[0].trim();
      const answer = parts[1]?.trim() || undefined;
      currentSection.questions.push({
        type: 'fillblank', points: pts,
        question: prompt,
        subItems: [{ prompt, answer }],
      });
      currentSection.totalPoints += pts;
      continue;
    }

    // Canvas[points;label;height?]
    const canvasMatch = line.match(/^Canvas\[(\d+);([^\]]+)\]$/i);
    if (canvasMatch) {
      const pts = parseInt(canvasMatch[1]);
      const parts = canvasMatch[2].split(';');
      currentSection.questions.push({
        type: 'canvas', points: pts,
        question: parts[0].trim(),
        canvasHeight: parts[1] ? parseInt(parts[1]) : 200,
      });
      currentSection.totalPoints += pts;
      continue;
    }
  }

  const totalPoints = sections.reduce((sum, s) => sum + s.totalPoints, 0);
  return { title, theme, subtitle, duration, instructions, sections, totalPoints };
}

// ─── Encode/Decode for interrogation ─────────────────────────────────────

/** Strip answers from document source for student link */
export function stripAnswers(source: string): string {
  return source.split('\n').map(line => {
    const trimmed = line.trim();
    // MCQ/Checkbox: remove trailing answer after options
    if (/^(MCQ|Checkbox)\[/i.test(trimmed)) {
      return line.replace(/;\{([^}]+)\};[^\]]+\]$/i, ';{$1}]');
    }
    // Multi-item Short/TrueFalse/FillBlank: each {q;a} → {q}
    if (/^(Short|TrueFalse|FillBlank)\[\d+;[^;{]+;\{/i.test(trimmed)) {
      return line.replace(/\{([^}]*)\}/g, (_, inner: string) => {
        const parts = inner.split(';');
        return `{${parts[0]}}`;
      });
    }
    // Legacy single Short[pts;q;answer] → Short[pts;q]
    if (/^Short\[/i.test(trimmed)) {
      const m = trimmed.match(/^Short\[(\d+);([^;]+);[^\]]+\]$/i);
      if (m) return `Short[${m[1]};${m[2]}]`;
    }
    // Legacy single TrueFalse
    if (/^TrueFalse\[/i.test(trimmed)) {
      const m = trimmed.match(/^TrueFalse\[(\d+);([^;]+);[^\]]+\]$/i);
      if (m) return `TrueFalse[${m[1]};${m[2]}]`;
    }
    // Legacy single FillBlank
    if (/^FillBlank\[/i.test(trimmed)) {
      const m = trimmed.match(/^FillBlank\[(\d+);([^;]+);[^\]]+\]$/i);
      if (m) return `FillBlank[${m[1]};${m[2]}]`;
    }
    // Open — remove trailing text answer if present (after lines count)
    if (/^Open\[/i.test(trimmed)) {
      const m = trimmed.match(/^Open\[(\d+);([^;]+)(?:;\d+)?;[^\]]+\]$/i);
      if (m) {
        const linesM = trimmed.match(/;(\d+);/);
        return linesM ? `Open[${m[1]};${m[2]};${linesM[1]}]` : `Open[${m[1]};${m[2]}]`;
      }
    }
    return line;
  }).join('\n');
}

/**
 * Extract answer key. For multi-item questions, value is encoded as
 * "ans0||ans1||ans2" (matches the student-answer encoding).
 */
export function extractAnswerKey(doc: LuateDocument): Record<number, string> {
  const key: Record<number, string> = {};
  let qi = 0;
  for (const section of doc.sections) {
    for (const q of section.questions) {
      if (q.subItems && q.subItems.length > 0) {
        if (q.subItems.some(it => it.answer !== undefined)) {
          key[qi] = q.subItems.map(it => it.answer ?? '').join('||');
        }
      } else if (q.answer) {
        key[qi] = q.answer;
      }
      qi++;
    }
  }
  return key;
}

// ─── Default Content ─────────────────────────────────────────────────────

export function getDefaultLuateContent(): string {
  return `--- Mathematics Final Exam
Theme[Modern]
Subtitle[Grade 10 — Semester 2]
Duration[90 minutes]
Instructions[Answer all questions. Show your work for full credit. No calculator allowed on Part 1.]

-- Part 1: Fundamentals

MCQ[2;What is the derivative of x²?;{2x;x²;2;x/2};2x]
MCQ[2;Which number is prime?;{15;21;23;27};23]
TrueFalse[3;Evaluate each statement;{The square root of 144 is 12;true}{Pi is a rational number;false}{Every prime greater than 2 is odd;true}]
Short[4;Quick mental math;{What is 7! (7 factorial)?;5040}{What is 12 × 12?;144}{What is the GCD of 24 and 36?;12}{What is 2^10?;1024}]

-- Part 2: Algebra

FillBlank[4;Complete each formula;{The quadratic formula is x = (-b ± √(b²-4ac)) / ___;2a}{The discriminant is b² - ___;4ac}{(a+b)² = a² + ___ + b²;2ab}{(a-b)(a+b) = a² - ___;b²}]
Open[4;Solve the equation: 2x² - 5x + 3 = 0. Show all steps.]
MCQ[3;What are the roots of x² - 9 = 0?;{x=3 and x=-3;x=9;x=3 only;x=0 and x=9};x=3 and x=-3]
Checkbox[3;Select all expressions equivalent to (a+b)²;{a²+2ab+b²;a²+b²;(a+b)(a+b);a²+ab+ab+b²};a²+2ab+b²,(a+b)(a+b),a²+ab+ab+b²]

-- Part 3: Analysis

Open[5;Prove that the sum of the angles in a triangle is 180°.]
Canvas[0;Draw the graph of f(x) = x² - 4x + 3;250]
Open[6;Given f(x) = x³ - 3x² + 2x, find the critical points and determine if each is a maximum, minimum, or inflection point.;10]
Short[2;Calculate the limit: lim(x→0) sin(x)/x;1]
`;
}
