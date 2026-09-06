/**
 * Computer Science exercise generators
 *
 * Includes algorithmic generators (binary conversion / addition) that produce
 * fresh random exercises on every run, plus conceptual fact-based generators.
 */

import {
  makeFactGenerator, makeRng, randInt, buildSyntax, buildMulti,
  isMultiItemFormat, ExerciseGenerator,
} from './types';

/** Generate plausible MCQ distractors for a binary or decimal answer. */
function binaryDistractors(answer: string, rng: () => number): string[] {
  const set = new Set<string>();
  if (/^[01]+$/.test(answer)) {
    const n = parseInt(answer, 2);
    while (set.size < 3) {
      const d = n + randInt(rng, 1, 8);
      if (d !== n) set.add(d.toString(2));
    }
  } else {
    const n = parseInt(answer, 10);
    while (set.size < 3) {
      const d = n + randInt(rng, 1, 10);
      if (d !== n) set.add(String(d));
    }
  }
  return [...set];
}

/** Algorithmic: binary ↔ decimal conversions. */
const binaryConverter: ExerciseGenerator = {
  id: 'cs.binaryConverter',
  name: 'Binary ↔ Decimal',
  description: 'Randomly generated conversions between binary and decimal.',
  category: 'cs',
  level: 'gcse',
  supportedFormats: ['1-line', 'fill', 'mcq', 't-f'],
  generate(s) {
    const rng = makeRng(s.seed);
    const count = Math.max(1, s.count);
    const pts = Math.max(1, Math.round(s.pointsPerQuestion));
    const fmt = s.format;

    if (fmt === 't-f') {
      const items: { prompt: string; answer: string }[] = [];
      for (let i = 0; i < count; i++) {
        const value = randInt(rng, 1, 255);
        const bin = value.toString(2);
        const isTrue = rng() > 0.5;
        const target = isTrue ? value : value + randInt(rng, 1, 5);
        items.push({
          prompt: `${bin} in binary equals ${target} in decimal.`,
          answer: isTrue ? 'true' : 'false',
        });
      }
      return [{ syntax: buildMulti('t-f', pts, 'Evaluate each statement:', items) }];
    }

    const items: { prompt: string; answer: string }[] = [];
    for (let i = 0; i < count; i++) {
      const value = randInt(rng, 1, 255);
      if (rng() > 0.5) {
        items.push({ prompt: `Convert ${value.toString(2)} (binary) to decimal.`, answer: String(value) });
      } else {
        items.push({ prompt: `Convert ${value} (decimal) to binary.`, answer: value.toString(2) });
      }
    }

    if (isMultiItemFormat(fmt)) {
      const directive = fmt === 'fill' ? 'fill' : 'short';
      return [{ syntax: buildMulti(directive, pts, 'Convert each value:', items) }];
    }

    return items.map(it => ({
      syntax: buildSyntax('mcq', pts, it.prompt, it.answer, binaryDistractors(it.answer, rng)),
    }));
  },
};

/** Algorithmic: binary addition. */
const binaryAddition: ExerciseGenerator = {
  id: 'cs.binaryAddition',
  name: 'Binary Addition',
  description: 'Randomly generated addition of binary numbers.',
  category: 'cs',
  level: 'alevel',
  supportedFormats: ['1-line', 'fill', 'mcq'],
  generate(s) {
    const rng = makeRng(s.seed);
    const count = Math.max(1, s.count);
    const pts = Math.max(1, Math.round(s.pointsPerQuestion));
    const fmt = s.format;

    const items: { prompt: string; answer: string }[] = [];
    for (let i = 0; i < count; i++) {
      const a = randInt(rng, 1, 15);
      const b = randInt(rng, 1, 15);
      items.push({
        prompt: `Add the binary numbers ${a.toString(2)} and ${b.toString(2)}.`,
        answer: (a + b).toString(2),
      });
    }

    if (isMultiItemFormat(fmt)) {
      const directive = fmt === 'fill' ? 'fill' : 'short';
      return [{ syntax: buildMulti(directive, pts, 'Add each pair of binary numbers:', items) }];
    }

    return items.map(it => ({
      syntax: buildSyntax('mcq', pts, it.prompt, it.answer, binaryDistractors(it.answer, rng)),
    }));
  },
};

export const CS_GENERATORS: ExerciseGenerator[] = [
  binaryConverter,
  binaryAddition,
  makeFactGenerator({
    id: 'cs.dataRepresentation',
    name: 'Data Representation',
    description: 'Bits, bytes and how data is stored.',
    category: 'cs',
    level: 'gcse',
    facts: [
      { question: 'How many bits are in a byte?', answer: '8', options: ['4', '16', '32'] },
      { question: 'What is the smallest unit of data?', answer: 'A bit', options: ['A byte', 'A nibble', 'A word'] },
      { question: 'How many values can 3 bits represent?', answer: '8', options: ['6', '9', '12'] },
      { question: 'What is a nibble?', answer: '4 bits', options: ['8 bits', '16 bits', '32 bits'] },
      { question: 'How many bytes are in a kilobyte (binary)?', answer: '1024', options: ['1000', '1024', '2048'] },
      { question: 'Which base does the binary number system use?', answer: '2', options: ['8', '10', '16'] },
    ],
  }),
  makeFactGenerator({
    id: 'cs.programmingConcepts',
    name: 'Programming Concepts',
    description: 'Variables, loops, functions and algorithms.',
    category: 'cs',
    level: 'gcse',
    facts: [
      { question: 'What does a variable store?', answer: 'A value', options: ['A file', 'A screen', 'A program'] },
      { question: 'Which statement makes a decision in code?', answer: 'if', options: ['for', 'while', 'print'] },
      { question: 'What is a function?', answer: 'A reusable block of code', options: ['A data type', 'A variable name', 'A bug'] },
      { question: "What does the term 'bug' mean in programming?", answer: 'An error in the code', options: ['A small feature', 'A comment', 'A loop'] },
      { question: 'Which data type stores true or false?', answer: 'Boolean', options: ['String', 'Integer', 'Float'] },
      { question: 'What is an algorithm?', answer: 'A step-by-step procedure to solve a problem', options: ['A programming language', 'A type of loop', 'A syntax error'] },
    ],
  }),
  makeFactGenerator({
    id: 'cs.booleanLogic',
    name: 'Boolean Logic',
    description: 'AND, OR, NOT and logic gates.',
    category: 'cs',
    level: 'alevel',
    facts: [
      { question: 'What is the result of TRUE AND FALSE?', answer: 'FALSE', options: ['TRUE', 'UNDEFINED', 'BOTH'] },
      { question: 'What is the result of TRUE OR FALSE?', answer: 'TRUE', options: ['FALSE', 'NEITHER', 'UNKNOWN'] },
      { question: 'What is the result of NOT TRUE?', answer: 'FALSE', options: ['TRUE', 'BOTH', 'NONE'] },
      { question: 'Which gate outputs true only when both inputs are true?', answer: 'AND', options: ['OR', 'XOR', 'NOT'] },
      { question: 'Which gate outputs true when at least one input is true?', answer: 'OR', options: ['AND', 'NOR', 'XOR'] },
      { question: 'What is the result of FALSE AND TRUE?', answer: 'FALSE', options: ['TRUE', 'UNKNOWN', 'BOTH'] },
    ],
  }),
  makeFactGenerator({
    id: 'cs.dataStructures',
    name: 'Data Structures',
    description: 'Queues, stacks, trees and complexity.',
    category: 'cs',
    level: 'alevel',
    facts: [
      { question: 'Which data structure uses FIFO (First In First Out)?', answer: 'Queue', options: ['Stack', 'Tree', 'Array'] },
      { question: 'Which data structure uses LIFO (Last In First Out)?', answer: 'Stack', options: ['Queue', 'Array', 'Graph'] },
      { question: 'What is the time complexity of binary search?', answer: 'O(log n)', options: ['O(n)', 'O(n²)', 'O(1)'] },
      { question: 'Which data structure stores key-value pairs?', answer: 'Hash table', options: ['Queue', 'Stack', 'Graph'] },
      { question: 'What is the time complexity of linear search?', answer: 'O(n)', options: ['O(1)', 'O(n²)', 'O(log n)'] },
      { question: 'Which data structure is a collection of nodes connected by edges?', answer: 'Graph', options: ['Array', 'Stack', 'Queue'] },
    ],
  }),
];
