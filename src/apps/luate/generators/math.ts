/**
 * Mathematics Exercise Generators
 *
 * Each generator produces ONE exercise. For multi-item formats
 * (t-f / fill / short / 1-line) the exercise contains `count` sub-items
 * and the total points are split across them. For MCQ, each call still
 * generates `count` separate MCQ blocks (since MCQs do not group well).
 *
 * To add a new math generator: define it below and add it to MATH_GENERATORS.
 */

import {
  ExerciseGenerator, GeneratedQuestion, GeneratorSettings, OutputFormat,
  makeRng, randInt, pick, shuffle, buildSyntax, buildMulti, isMultiItemFormat,
} from './types';

// ─── Helpers ────────────────────────────────────────────────────────────

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const simplify = (n: number, d: number): [number, number] => {
  const g = gcd(n, d) || 1;
  return d < 0 ? [-n / g, -d / g] : [n / g, d / g];
};
const fmt = (n: number, dp = 2) => {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(dp).replace(/\.?0+$/, '');
};
const distractors = (rng: () => number, correct: number, range: number, count = 3): string[] => {
  const set = new Set<number>([correct]);
  let safety = 0;
  while (set.size < count + 1 && safety++ < 50) {
    const d = correct + randInt(rng, -range, range);
    if (d !== correct && !set.has(d)) set.add(d);
  }
  return Array.from(set).filter(v => v !== correct).slice(0, count).map(String);
};

/**
 * Generic dispatcher. `mkItem` returns one {prompt, answer, distractors?} per call.
 * Builds a multi-item block for t-f/fill/short/1-line, or N separate MCQs.
 */
function buildExercise(
  s: GeneratorSettings,
  header: string,
  mkItem: (rng: () => number, i: number) => { prompt: string; answer: string; mcqOptions?: string[] },
): GeneratedQuestion[] {
  const rng = makeRng(s.seed);
  const items = Array.from({ length: s.count }, (_, i) => mkItem(rng, i));

  if (isMultiItemFormat(s.format)) {
    // For t-f: ensure answer is "true"/"false"
    const cleaned = items.map(it => {
      if (s.format === 't-f') {
        const a = it.answer.toLowerCase().trim();
        return { prompt: it.prompt, answer: a === 'true' || a === 'false' ? a : 'true' };
      }
      return { prompt: it.prompt, answer: it.answer };
    });
    return [{ syntax: buildMulti(s.format as 't-f' | 'fill' | 'short' | '1-line',
      s.pointsPerQuestion, header, cleaned) }];
  }

  // MCQ / Open: emit N separate blocks. Points stay per-question.
  const perPts = Math.max(1, Math.round(s.pointsPerQuestion / s.count));
  return items.map(it => ({
    syntax: buildSyntax(s.format, perPts, it.prompt, it.answer, it.mcqOptions),
  }));
}

/** Make a t-f friendly variant: turn a numeric answer into a true/false claim. */
function toTfClaim(rng: () => number, prompt: string, correct: string, fakeFn: () => string)
  : { prompt: string; answer: string } {
  const isTrue = rng() > 0.5;
  const shown = isTrue ? correct : fakeFn();
  return { prompt: `${prompt} → ${shown}`, answer: isTrue ? 'true' : 'false' };
}

// ─── 1. Trinomial factorisation ─────────────────────────────────────────

const trinomial: ExerciseGenerator = {
  id: 'math.trinomial',
  level: 'alevel',
  name: 'Trinomial Factorisation',
  description: 'Factorise quadratic expressions ax² + bx + c into (x − r₁)(x − r₂).',
  category: 'math',
  supportedFormats: ['1-line', 'mcq', 't-f'],
  customFields: [
    { key: 'rootMax', label: 'Max root magnitude', type: 'number', default: 8, min: 3, max: 20 },
  ],
  defaultCustom: { rootMax: 8 },
  generate(s) {
    const max = (s.custom?.rootMax as number) ?? 8;
    return buildExercise(s, 'Factorise each trinomial', (rng) => {
      const r1 = randInt(rng, -max, max) || 1;
      const r2 = randInt(rng, -max, max) || 1;
      const b = -(r1 + r2), c = r1 * r2;
      const expr = `x² ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}`;
      const fact = `(x ${r1 >= 0 ? '-' : '+'} ${Math.abs(r1)})(x ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)})`;
      if (s.format === 't-f') return toTfClaim(rng, `${expr} factorises as`, fact,
        () => `(x - ${r1 + 1})(x - ${r2})`);
      if (s.format === 'mcq') {
        const wrong = [
          `(x ${r1 >= 0 ? '+' : '-'} ${Math.abs(r1)})(x ${r2 >= 0 ? '-' : '+'} ${Math.abs(r2)})`,
          `(x - ${r1 + 1})(x - ${r2})`,
          `(x - ${r1})(x + ${r2 + 1})`,
        ];
        return { prompt: `Factorise: ${expr}`, answer: fact, mcqOptions: shuffle(rng, [fact, ...wrong]) };
      }
      return { prompt: `Factorise: ${expr}`, answer: fact };
    });
  },
};

// ─── 2. Multiplication tables ───────────────────────────────────────────

const multiplicationTables: ExerciseGenerator = {
  id: 'math.multiplication',
  level: 'primary',
  name: 'Multiplication Tables',
  description: 'Practice multiplication facts. Configure target tables.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  customFields: [
    { key: 'minTable', label: 'Min table', type: 'number', default: 2, min: 1, max: 12 },
    { key: 'maxTable', label: 'Max table', type: 'number', default: 9, min: 1, max: 12 },
  ],
  defaultCustom: { minTable: 2, maxTable: 9 },
  generate(s) {
    const min = (s.custom?.minTable as number) ?? 2;
    const max = (s.custom?.maxTable as number) ?? 9;
    return buildExercise(s, 'Compute each product', (rng) => {
      const a = randInt(rng, min, max);
      const b = randInt(rng, 1, 12);
      const ans = a * b;
      if (s.format === 'fill') return { prompt: `${a} × ___ = ${ans}`, answer: String(b) };
      if (s.format === 'mcq')
        return { prompt: `${a} × ${b} = ?`, answer: String(ans),
          mcqOptions: shuffle(rng, [String(ans), ...distractors(rng, ans, 10)]) };
      return { prompt: `${a} × ${b} = ?`, answer: String(ans) };
    });
  },
};

// ─── 3. Linear equations ────────────────────────────────────────────────

const linearEquations: ExerciseGenerator = {
  id: 'math.linearEq',
  level: 'gcse',
  name: 'Linear Equations',
  description: 'Solve ax + b = c or two-sided equations.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  customFields: [
    { key: 'twoSided', label: 'Two-sided (ax+b = cx+d)', type: 'boolean', default: false },
  ],
  defaultCustom: { twoSided: false },
  generate(s) {
    const two = !!s.custom?.twoSided;
    const range = s.difficulty === 'easy' ? 5 : s.difficulty === 'medium' ? 9 : 15;
    return buildExercise(s, 'Solve each equation for x', (rng) => {
      const x = randInt(rng, -range, range) || 1;
      const a = randInt(rng, 2, range);
      let question: string, answer: string;
      if (two) {
        const c = randInt(rng, 2, range);
        const d = randInt(rng, -range, range);
        const b = c * x + d - a * x;
        question = `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}x ${d >= 0 ? '+' : '-'} ${Math.abs(d)}`;
        answer = `x = ${x}`;
      } else {
        const c = randInt(rng, -range, range);
        const b = c - a * x;
        question = `${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`;
        answer = `x = ${x}`;
      }
      if (s.format === 'mcq')
        return { prompt: `Solve: ${question}`, answer,
          mcqOptions: shuffle(rng, [answer, `x = ${x + 1}`, `x = ${x - 1}`, `x = ${-x}`]) };
      if (s.format === 'fill') return { prompt: `${question} → x = ___`, answer: String(x) };
      return { prompt: `Solve: ${question}`, answer };
    });
  },
};

// ─── 4. Perimeter & area ────────────────────────────────────────────────

const perimeterArea: ExerciseGenerator = {
  id: 'math.perimeterArea',
  level: 'gcse',
  name: 'Perimeter & Area',
  description: 'Compute perimeter or area of rectangles, triangles, circles.',
  category: 'math',
  supportedFormats: ['1-line', 'mcq', 't-f'],
  customFields: [
    { key: 'mode', label: 'Quantity', type: 'select', default: 'mixed',
      options: [{ value: 'area', label: 'Area' }, { value: 'perimeter', label: 'Perimeter' }, { value: 'mixed', label: 'Mixed' }] },
  ],
  defaultCustom: { mode: 'mixed' },
  generate(s) {
    const mode = (s.custom?.mode as string) ?? 'mixed';
    return buildExercise(s, 'Compute the requested measurement', (rng) => {
      const shape = pick(rng, ['rectangle', 'triangle', 'circle']);
      const want = mode === 'mixed' ? pick(rng, ['area', 'perimeter']) : mode;
      let q = '', a = '';
      if (shape === 'rectangle') {
        const w = randInt(rng, 3, 20), h = randInt(rng, 3, 20);
        if (want === 'area') { q = `Rectangle ${w}cm × ${h}cm. Area?`; a = `${w * h} cm²`; }
        else { q = `Rectangle ${w}cm × ${h}cm. Perimeter?`; a = `${2 * (w + h)} cm`; }
      } else if (shape === 'triangle') {
        const b = randInt(rng, 4, 20), h = randInt(rng, 4, 20);
        if (want === 'area') { q = `Triangle base ${b}cm, height ${h}cm. Area?`; a = `${(b * h) / 2} cm²`; }
        else { const c = Math.round(Math.hypot(b / 2, h)); q = `Isoceles triangle base ${b}cm, height ${h}cm (sides ≈${c}cm). Perimeter?`; a = `${b + 2 * c} cm`; }
      } else {
        const r = randInt(rng, 2, 12);
        if (want === 'area') { q = `Circle radius ${r}cm. Area? (use π ≈ 3.14)`; a = `${fmt(Math.PI * r * r)} cm²`; }
        else { q = `Circle radius ${r}cm. Circumference?`; a = `${fmt(2 * Math.PI * r)} cm`; }
      }
      if (s.format === 't-f') {
        const num = parseFloat(a);
        const unit = a.split(' ').slice(-1)[0];
        return toTfClaim(rng, q, a, () => `${fmt(num * 1.2)} ${unit}`);
      }
      if (s.format === 'mcq') {
        const num = parseFloat(a);
        const unit = a.split(' ').slice(-1)[0];
        return { prompt: q, answer: a,
          mcqOptions: shuffle(rng, [a, `${fmt(num * 1.5)} ${unit}`, `${fmt(num * 0.5)} ${unit}`, `${fmt(num + 5)} ${unit}`]) };
      }
      return { prompt: q, answer: a };
    });
  },
};

// ─── 5. Fractions operations ────────────────────────────────────────────

const fractions: ExerciseGenerator = {
  id: 'math.fractions',
  level: 'gcse',
  name: 'Fractions — Operations',
  description: 'Add, subtract, multiply, divide and simplify fractions.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  customFields: [
    { key: 'maxDen', label: 'Max denominator', type: 'number', default: 9, min: 3, max: 20 },
    { key: 'op', label: 'Operation', type: 'select', default: 'mixed',
      options: [{ value: '+', label: 'Add' }, { value: '-', label: 'Subtract' }, { value: '*', label: 'Multiply' }, { value: '/', label: 'Divide' }, { value: 'mixed', label: 'Mixed' }] },
  ],
  defaultCustom: { maxDen: 9, op: 'mixed' },
  generate(s) {
    const md = (s.custom?.maxDen as number) ?? 9;
    const opSet = (s.custom?.op as string) ?? 'mixed';
    return buildExercise(s, 'Compute and simplify each fraction', (rng) => {
      const op = opSet === 'mixed' ? pick(rng, ['+', '-', '*', '/']) : opSet;
      const n1 = randInt(rng, 1, md - 1), d1 = randInt(rng, 2, md);
      const n2 = randInt(rng, 1, md - 1), d2 = randInt(rng, 2, md);
      let n = 0, d = 1;
      if (op === '+') { n = n1 * d2 + n2 * d1; d = d1 * d2; }
      else if (op === '-') { n = n1 * d2 - n2 * d1; d = d1 * d2; }
      else if (op === '*') { n = n1 * n2; d = d1 * d2; }
      else { n = n1 * d2; d = d1 * n2; }
      const [sn, sd] = simplify(n, d);
      const ans = sd === 1 ? `${sn}` : `${sn}/${sd}`;
      const sym = op === '*' ? '×' : op === '/' ? '÷' : op;
      const q = `${n1}/${d1} ${sym} ${n2}/${d2}`;
      if (s.format === 'mcq')
        return { prompt: `${q} = ?`, answer: ans,
          mcqOptions: shuffle(rng, [ans, `${sn + 1}/${sd}`, `${sn}/${sd + 1}`, `${n}/${d}`]) };
      if (s.format === 'fill') return { prompt: `${q} = ___`, answer: ans };
      return { prompt: `${q} = ?`, answer: ans };
    });
  },
};

// ─── 6. Probability — two-way tables ────────────────────────────────────

const probability: ExerciseGenerator = {
  id: 'math.probability',
  level: 'gcse',
  name: 'Probability — Two-way Tables',
  description: 'Compute probabilities from a generated two-way table.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  generate(s) {
    return buildExercise(s, 'Compute each probability from the survey data', (rng) => {
      const a = randInt(rng, 5, 25), b = randInt(rng, 5, 25);
      const c = randInt(rng, 5, 25), d = randInt(rng, 5, 25);
      const total = a + b + c + d;
      const [pn, pd] = simplify(a, total);
      const ans = `${pn}/${pd}`;
      const q = `Survey: ${a} like Tea+Cake, ${b} Tea only, ${c} Cake only, ${d} neither (n=${total}). P(Tea AND Cake)`;
      if (s.format === 'mcq')
        return { prompt: `${q} = ?`, answer: ans,
          mcqOptions: shuffle(rng, [ans, `${a}/${a + b}`, `${a + b}/${total}`, `${a}/${a + c}`]) };
      if (s.format === 'fill') return { prompt: `${q} = ___`, answer: ans };
      return { prompt: `${q} = ?`, answer: ans };
    });
  },
};

// ─── 7. Sequences ───────────────────────────────────────────────────────

const sequences: ExerciseGenerator = {
  id: 'math.sequences',
  level: 'gcse',
  name: 'Sequences',
  description: 'Find the next term of arithmetic / geometric sequences.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq', 't-f'],
  customFields: [
    { key: 'kind', label: 'Type', type: 'select', default: 'mixed',
      options: [{ value: 'arith', label: 'Arithmetic' }, { value: 'geom', label: 'Geometric' }, { value: 'mixed', label: 'Mixed' }] },
  ],
  defaultCustom: { kind: 'mixed' },
  generate(s) {
    const kindSet = (s.custom?.kind as string) ?? 'mixed';
    return buildExercise(s, 'Find the next term of each sequence', (rng) => {
      const kind = kindSet === 'mixed' ? pick(rng, ['arith', 'geom']) : kindSet;
      const a0 = randInt(rng, 1, 10);
      const r = randInt(rng, 2, kind === 'geom' ? 4 : 8);
      const terms: number[] = [];
      for (let k = 0; k < 5; k++) terms.push(kind === 'arith' ? a0 + k * r : a0 * r ** k);
      const next = kind === 'arith' ? a0 + 5 * r : a0 * r ** 5;
      const q = `${terms.join(', ')}, ___`;
      if (s.format === 't-f')
        return toTfClaim(rng, `Next term of ${terms.join(', ')} is`, String(next),
          () => String(next + randInt(rng, 1, 5)));
      if (s.format === 'mcq')
        return { prompt: `Next term: ${terms.join(', ')}, ?`, answer: String(next),
          mcqOptions: shuffle(rng, [String(next), String(next + r), String(next - r), String(next * 2)]) };
      if (s.format === 'fill') return { prompt: q, answer: String(next) };
      return { prompt: q, answer: String(next) };
    });
  },
};

// ─── 8. Right-angle trigonometry ────────────────────────────────────────

const trigonometry: ExerciseGenerator = {
  id: 'math.trigonometry',
  level: 'alevel',
  name: 'Right-angle Trigonometry',
  description: 'SOH-CAH-TOA — find missing sides or angles in right triangles.',
  category: 'math',
  supportedFormats: ['1-line', 'mcq', 'fill'],
  generate(s) {
    return buildExercise(s, 'Find the missing side or angle (2 d.p.)', (rng) => {
      const angle = randInt(rng, 20, 70);
      const adj = randInt(rng, 4, 15);
      const opp = +(adj * Math.tan(angle * Math.PI / 180)).toFixed(2);
      const hyp = +(adj / Math.cos(angle * Math.PI / 180)).toFixed(2);
      const ratio = pick(rng, ['sin', 'cos', 'tan']);
      let q = '', a = '';
      if (ratio === 'tan') { q = `Right triangle, angle ${angle}°, adjacent ${adj}. Opposite?`; a = String(opp); }
      else if (ratio === 'cos') { q = `Right triangle, angle ${angle}°, adjacent ${adj}. Hypotenuse?`; a = String(hyp); }
      else { q = `Right triangle, opposite ${opp}, hypotenuse ${hyp}. Angle?`; a = String(angle); }
      if (s.format === 'mcq') {
        const num = parseFloat(a);
        return { prompt: q, answer: a,
          mcqOptions: shuffle(rng, [a, fmt(num * 1.2), fmt(num * 0.8), fmt(num + 5)]) };
      }
      if (s.format === 'fill') return { prompt: q.replace('?', '___'), answer: a };
      return { prompt: q, answer: a };
    });
  },
};

// ─── 9. Quadratic equations ─────────────────────────────────────────────

const quadratics: ExerciseGenerator = {
  id: 'math.quadratics',
  level: 'alevel',
  name: 'Quadratic Equations',
  description: 'Solve x² + bx + c = 0 by factorisation or quadratic formula.',
  category: 'math',
  supportedFormats: ['1-line', 'mcq', 't-f'],
  generate(s) {
    const range = s.difficulty === 'easy' ? 5 : s.difficulty === 'medium' ? 9 : 15;
    return buildExercise(s, 'Find the roots of each quadratic', (rng) => {
      const r1 = randInt(rng, -range, range) || 1;
      const r2 = randInt(rng, -range, range) || 1;
      const b = -(r1 + r2), c = r1 * r2;
      const eq = `x² ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0`;
      const sorted = [r1, r2].sort((x, y) => x - y);
      const ans = `x = ${sorted[0]} or x = ${sorted[1]}`;
      if (s.format === 't-f')
        return toTfClaim(rng, `Roots of ${eq} are`, ans,
          () => `x = ${sorted[0] + 1} or x = ${sorted[1]}`);
      if (s.format === 'mcq')
        return { prompt: `Solve: ${eq}`, answer: ans,
          mcqOptions: shuffle(rng, [ans,
            `x = ${sorted[0] + 1} or x = ${sorted[1]}`,
            `x = ${sorted[0]} or x = ${sorted[1] - 1}`,
            `x = ${-sorted[0]} or x = ${-sorted[1]}`]) };
      return { prompt: `Solve: ${eq}`, answer: ans };
    });
  },
};

// ─── 10. Unit conversions ───────────────────────────────────────────────

const UNIT_CONVERSIONS = [
  { from: 'km', to: 'm', factor: 1000 },
  { from: 'm', to: 'cm', factor: 100 },
  { from: 'cm', to: 'mm', factor: 10 },
  { from: 'kg', to: 'g', factor: 1000 },
  { from: 'g', to: 'mg', factor: 1000 },
  { from: 'L', to: 'mL', factor: 1000 },
  { from: 'h', to: 'min', factor: 60 },
  { from: 'min', to: 's', factor: 60 },
  { from: 'tonne', to: 'kg', factor: 1000 },
];

const unitConversions: ExerciseGenerator = {
  id: 'math.unitConversions',
  level: 'primary',
  name: 'Unit Conversions',
  description: 'Convert between length, mass, volume, and time units.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  generate(s) {
    return buildExercise(s, 'Convert each value', (rng) => {
      const conv = pick(rng, UNIT_CONVERSIONS);
      const reverse = rng() > 0.5;
      const value = randInt(rng, 1, 20);
      const ans = reverse ? value / conv.factor : value * conv.factor;
      const from = reverse ? conv.to : conv.from;
      const to = reverse ? conv.from : conv.to;
      if (s.format === 'mcq')
        return { prompt: `${value} ${from} = ? ${to}`, answer: String(ans),
          mcqOptions: shuffle(rng, [String(ans), String(ans * 10), String(ans / 10), String(ans + 1)]) };
      if (s.format === 'fill') return { prompt: `${value} ${from} = ___ ${to}`, answer: String(ans) };
      return { prompt: `${value} ${from} = ? ${to}`, answer: String(ans) };
    });
  },
};

// ─── 11. Percentages ────────────────────────────────────────────────────

const percentages: ExerciseGenerator = {
  id: 'math.percentages',
  level: 'gcse',
  name: 'Percentages',
  description: 'Discounts, increases, find the percentage, reverse percentage.',
  category: 'math',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  generate(s) {
    return buildExercise(s, 'Compute each percentage problem', (rng) => {
      const kind = pick(rng, ['discount', 'increase', 'findPct']);
      const val = randInt(rng, 20, 200);
      const pct = pick(rng, [5, 10, 15, 20, 25, 30, 40, 50]);
      let q = '', ans = '';
      if (kind === 'discount') {
        ans = fmt(val * (1 - pct / 100));
        q = `£${val} item, ${pct}% discount. New price?`;
      } else if (kind === 'increase') {
        ans = fmt(val * (1 + pct / 100));
        q = `£${val} increased by ${pct}%. New value?`;
      } else {
        const part = Math.round(val * pct / 100);
        ans = `${pct}%`;
        q = `What percentage of ${val} is ${part}?`;
      }
      if (s.format === 'mcq') {
        const num = parseFloat(ans);
        return { prompt: q, answer: ans,
          mcqOptions: shuffle(rng, [ans, fmt(num * 1.1), fmt(num * 0.9), fmt(num + 5)]) };
      }
      if (s.format === 'fill') return { prompt: q.replace('?', '___'), answer: ans };
      return { prompt: q, answer: ans };
    });
  },
};

// ─── 12. Vectors ────────────────────────────────────────────────────────

const vectors: ExerciseGenerator = {
  id: 'math.vectors',
  level: 'alevel',
  name: 'Vectors',
  description: 'Add, subtract, and scale 2D column vectors.',
  category: 'math',
  supportedFormats: ['1-line', 'mcq', 't-f'],
  generate(s) {
    return buildExercise(s, 'Compute each vector operation', (rng) => {
      const op = pick(rng, ['+', '-', 'scalar']);
      const ax = randInt(rng, -8, 8), ay = randInt(rng, -8, 8);
      const bx = randInt(rng, -8, 8), by = randInt(rng, -8, 8);
      const k = randInt(rng, 2, 5);
      let q = '', ans = '';
      if (op === '+') { q = `(${ax}, ${ay}) + (${bx}, ${by})`; ans = `(${ax + bx}, ${ay + by})`; }
      else if (op === '-') { q = `(${ax}, ${ay}) - (${bx}, ${by})`; ans = `(${ax - bx}, ${ay - by})`; }
      else { q = `${k} × (${ax}, ${ay})`; ans = `(${k * ax}, ${k * ay})`; }
      if (s.format === 't-f')
        return toTfClaim(rng, `${q} =`, ans, () => `(${ax + bx + 1}, ${ay + by})`);
      if (s.format === 'mcq')
        return { prompt: `${q} = ?`, answer: ans,
          mcqOptions: shuffle(rng, [ans, `(${ax + bx + 1}, ${ay + by})`,
            `(${ax + bx}, ${ay + by + 1})`, `(${ax - bx}, ${ay - by})`]) };
      return { prompt: `${q} = ?`, answer: ans };
    });
  },
};

// ─── Export registry ────────────────────────────────────────────────────

export const MATH_GENERATORS: ExerciseGenerator[] = [
  trinomial, multiplicationTables, linearEquations, perimeterArea,
  fractions, probability, sequences, trigonometry,
  quadratics, unitConversions, percentages, vectors,
];
