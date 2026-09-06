/**
 * Languages exercise generators
 */

import { makeFactGenerator, ExerciseGenerator } from './types';

export const LANGUAGES_GENERATORS: ExerciseGenerator[] = [
  makeFactGenerator({
    id: 'languages.frenchEnglish',
    name: 'French–English Vocabulary',
    description: 'Basic everyday French and English words.',
    category: 'languages',
    level: 'primary',
    facts: [
      { question: "What does 'bonjour' mean in English?", answer: 'Hello', options: ['Goodbye', 'Please', 'Thank you'] },
      { question: "What does 'merci' mean?", answer: 'Thank you', options: ['Sorry', 'Please', 'Good morning'] },
      { question: "What is the French word for 'cat'?", answer: 'chat', options: ['chien', 'oiseau', 'poisson'] },
      { question: "What does 'l'école' mean?", answer: 'school', options: ['hospital', 'shop', 'church'] },
      { question: "What is the French word for 'water'?", answer: 'eau', options: ['pain', 'lait', 'vin'] },
      { question: "What does 'maison' mean?", answer: 'house', options: ['garden', 'kitchen', 'car'] },
    ],
  }),
  makeFactGenerator({
    id: 'languages.englishGrammar',
    name: 'English Grammar',
    description: 'Parts of speech and sentence structure.',
    category: 'languages',
    level: 'gcse',
    facts: [
      { question: 'What is the plural of child?', answer: 'children', options: ['childs', 'children', 'childes'] },
      { question: 'Which of these is a verb: blue, jump, table?', answer: 'jump', options: ['blue', 'jump', 'table'] },
      { question: 'What is the past tense of eat?', answer: 'ate', options: ['eated', 'ate', 'eaten'] },
      { question: 'What type of word describes a noun?', answer: 'adjective', options: ['adverb', 'verb', 'adjective'] },
      { question: 'What is the opposite of ancient?', answer: 'modern', options: ['old', 'modern', 'historic'] },
      { question: 'Which punctuation mark ends a question?', answer: 'question mark', options: ['full stop', 'comma', 'question mark'] },
    ],
  }),
  makeFactGenerator({
    id: 'languages.synonymsAntonyms',
    name: 'Synonyms & Antonyms',
    description: 'Words with the same or opposite meaning.',
    category: 'languages',
    level: 'gcse',
    facts: [
      { question: 'What is a synonym of happy?', answer: 'joyful', options: ['sad', 'joyful', 'angry'] },
      { question: 'What is an antonym of expand?', answer: 'shrink', options: ['grow', 'shrink', 'stretch'] },
      { question: 'What is a synonym of big?', answer: 'large', options: ['tiny', 'large', 'narrow'] },
      { question: 'What is an antonym of brave?', answer: 'cowardly', options: ['bold', 'cowardly', 'fearless'] },
      { question: 'What is a synonym of fast?', answer: 'quick', options: ['slow', 'quick', 'steady'] },
      { question: 'What is an antonym of rare?', answer: 'common', options: ['scarce', 'common', 'unusual'] },
    ],
  }),
  makeFactGenerator({
    id: 'languages.literaryTerms',
    name: 'Literary Terms',
    description: 'Figures of speech and literary devices.',
    category: 'languages',
    level: 'alevel',
    facts: [
      { question: 'What is a metaphor?', answer: 'A comparison without like or as', options: ['A comparison using like', 'A repeated vowel sound', 'A type of stanza'] },
      { question: 'What is alliteration?', answer: 'Repetition of initial consonant sounds', options: ['Repetition of vowel sounds', 'An exaggerated statement', 'A reference to history'] },
      { question: 'What is a sonnet?', answer: 'A 14-line poem', options: ['A 10-line poem', 'A 14-line poem', 'A 16-line poem'] },
      { question: 'What is the turning point of a story called?', answer: 'The climax', options: ['The exposition', 'The climax', 'The epilogue'] },
      { question: 'What is foreshadowing?', answer: 'A hint of what will happen later', options: ['A flashback to the past', 'A hint of what will happen later', 'The final resolution'] },
      { question: 'What is personification?', answer: 'Giving human qualities to non-human things', options: ['Comparing two unlike things', 'Giving human qualities to non-human things', 'Repeating words for effect'] },
    ],
  }),
];
