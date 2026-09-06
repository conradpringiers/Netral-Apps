/**
 * Geography exercise generators
 */

import { makeFactGenerator, ExerciseGenerator } from './types';

export const GEOGRAPHY_GENERATORS: ExerciseGenerator[] = [
  makeFactGenerator({
    id: 'geography.worldCapitals',
    name: 'World Capitals',
    description: 'Match countries to their capital cities.',
    category: 'geography',
    level: 'primary',
    facts: [
      { question: 'What is the capital of France?', answer: 'Paris', options: ['Lyon', 'Marseille', 'Nice'] },
      { question: 'What is the capital of the United Kingdom?', answer: 'London', options: ['Manchester', 'Edinburgh', 'Birmingham'] },
      { question: 'What is the capital of Spain?', answer: 'Madrid', options: ['Barcelona', 'Seville', 'Valencia'] },
      { question: 'What is the capital of Italy?', answer: 'Rome', options: ['Milan', 'Naples', 'Venice'] },
      { question: 'What is the capital of Germany?', answer: 'Berlin', options: ['Munich', 'Hamburg', 'Frankfurt'] },
      { question: 'What is the capital of the United States?', answer: 'Washington, D.C.', options: ['New York', 'Los Angeles', 'Chicago'] },
    ],
  }),
  makeFactGenerator({
    id: 'geography.continentsOceans',
    name: 'Continents & Oceans',
    description: 'Continents, oceans and basic world geography.',
    category: 'geography',
    level: 'primary',
    facts: [
      { question: 'How many continents are there?', answer: '7', options: ['5', '6', '7'] },
      { question: 'What is the largest ocean?', answer: 'Pacific Ocean', options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'] },
      { question: 'What is the largest continent?', answer: 'Asia', options: ['Africa', 'Europe', 'South America'] },
      { question: 'Which continent contains the Sahara Desert?', answer: 'Africa', options: ['Asia', 'Australia', 'South America'] },
      { question: 'What is the smallest continent?', answer: 'Australia', options: ['Europe', 'Antarctica', 'South America'] },
      { question: 'Which ocean lies between Africa and Australia?', answer: 'Indian Ocean', options: ['Atlantic Ocean', 'Pacific Ocean', 'Southern Ocean'] },
    ],
  }),
  makeFactGenerator({
    id: 'geography.riversMountains',
    name: 'Rivers & Mountains',
    description: 'Major rivers, mountains and physical features.',
    category: 'geography',
    level: 'gcse',
    facts: [
      { question: 'What is the longest river in the world?', answer: 'Nile', options: ['Amazon', 'Mississippi', 'Yangtze'] },
      { question: 'What is the highest mountain in the world?', answer: 'Mount Everest', options: ['K2', 'Kangchenjunga', 'Mont Blanc'] },
      { question: 'Which mountain range separates Europe and Asia?', answer: 'Ural Mountains', options: ['Alps', 'Andes', 'Himalayas'] },
      { question: 'What is the longest river in Europe?', answer: 'Volga', options: ['Danube', 'Rhine', 'Seine'] },
      { question: 'Which river flows through London?', answer: 'Thames', options: ['Severn', 'Trent', 'Mersey'] },
      { question: 'What is the largest hot desert in the world?', answer: 'Sahara', options: ['Gobi', 'Kalahari', 'Mojave'] },
    ],
  }),
  makeFactGenerator({
    id: 'geography.countriesEconomies',
    name: 'Countries & Economies',
    description: 'Currencies, populations and country facts.',
    category: 'geography',
    level: 'gcse',
    facts: [
      { question: 'Which country has the largest population?', answer: 'India', options: ['China', 'United States', 'Indonesia'] },
      { question: 'What is the currency of Japan?', answer: 'Yen', options: ['Won', 'Yuan', 'Ringgit'] },
      { question: 'Which country is shaped like a boot?', answer: 'Italy', options: ['Greece', 'Portugal', 'Spain'] },
      { question: 'What is the capital of Australia?', answer: 'Canberra', options: ['Sydney', 'Melbourne', 'Perth'] },
      { question: 'Which country has the largest land area?', answer: 'Russia', options: ['Canada', 'China', 'United States'] },
      { question: 'What currency is used by most of the European Union?', answer: 'Euro', options: ['Dollar', 'Pound', 'Franc'] },
    ],
  }),
];
