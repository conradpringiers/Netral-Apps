/**
 * Sciences exercise generators
 */

import { makeFactGenerator, ExerciseGenerator } from './types';

export const SCIENCES_GENERATORS: ExerciseGenerator[] = [
  makeFactGenerator({
    id: 'sciences.statesOfMatter',
    name: 'States of Matter',
    description: 'Solids, liquids and gases for young learners.',
    category: 'sciences',
    level: 'primary',
    facts: [
      { question: 'What are the three states of matter?', answer: 'Solid, liquid and gas', options: ['Solid, liquid and plasma', 'Rock, water and air', 'Hot, cold and warm'] },
      { question: 'Which state of matter has a fixed shape?', answer: 'Solid', options: ['Liquid', 'Gas', 'Plasma'] },
      { question: 'What happens to water when it freezes?', answer: 'It turns into ice', options: ['It turns into steam', 'It disappears', 'It stays the same'] },
      { question: 'Which state of matter fills any container it is placed in?', answer: 'Gas', options: ['Solid', 'Liquid', 'None of them'] },
      { question: 'What is the gas we breathe in to stay alive?', answer: 'Oxygen', options: ['Carbon dioxide', 'Nitrogen', 'Helium'] },
      { question: 'What happens to water when it boils?', answer: 'It turns into steam', options: ['It turns into ice', 'It becomes solid', 'It changes colour'] },
    ],
  }),
  makeFactGenerator({
    id: 'sciences.humanBody',
    name: 'Human Body',
    description: 'Organs and the basics of how the body works.',
    category: 'sciences',
    level: 'primary',
    facts: [
      { question: 'How many bones are in the adult human body?', answer: '206', options: ['150', '206', '350'] },
      { question: 'Which organ pumps blood around the body?', answer: 'The heart', options: ['The lungs', 'The brain', 'The stomach'] },
      { question: 'What do we use to breathe?', answer: 'The lungs', options: ['The kidneys', 'The heart', 'The liver'] },
      { question: 'Which part of the body controls everything we do?', answer: 'The brain', options: ['The heart', 'The lungs', 'The stomach'] },
      { question: 'What is the largest organ of the human body?', answer: 'The skin', options: ['The liver', 'The lungs', 'The brain'] },
      { question: 'Which gas do we breathe out?', answer: 'Carbon dioxide', options: ['Oxygen', 'Nitrogen', 'Hydrogen'] },
    ],
  }),
  makeFactGenerator({
    id: 'sciences.chemistryBasics',
    name: 'Chemistry Basics',
    description: 'Elements, symbols and simple reactions.',
    category: 'sciences',
    level: 'gcse',
    facts: [
      { question: 'What is the chemical symbol for water?', answer: 'H2O', options: ['CO2', 'O2', 'NaCl'] },
      { question: 'What is the pH of a neutral solution?', answer: '7', options: ['0', '7', '14'] },
      { question: 'Which subatomic particles orbit the nucleus?', answer: 'Electrons', options: ['Protons', 'Neutrons', 'Ions'] },
      { question: 'What is the chemical symbol for gold?', answer: 'Au', options: ['Ag', 'Go', 'Gd'] },
      { question: 'Which gas is produced when an acid reacts with a metal?', answer: 'Hydrogen', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen'] },
      { question: 'What is the smallest unit of a chemical element?', answer: 'An atom', options: ['A molecule', 'A cell', 'A compound'] },
    ],
  }),
  makeFactGenerator({
    id: 'sciences.physicsLaws',
    name: 'Physics Laws',
    description: 'Forces, units and fundamental physical laws.',
    category: 'sciences',
    level: 'gcse',
    facts: [
      { question: 'What is the unit of force?', answer: 'Newton', options: ['Joule', 'Watt', 'Pascal'] },
      { question: 'What is the formula for speed?', answer: 'distance divided by time', options: ['distance times time', 'time divided by distance', 'mass times acceleration'] },
      { question: 'What force pulls objects towards the Earth?', answer: 'Gravity', options: ['Magnetism', 'Friction', 'Tension'] },
      { question: 'What is the unit of electrical current?', answer: 'Ampere', options: ['Volt', 'Ohm', 'Watt'] },
      { question: 'What is the approximate speed of light in a vacuum?', answer: '300,000 km/s', options: ['150,000 km/s', '300,000 km/s', '3,000 km/s'] },
      { question: 'Which law states that every action has an equal and opposite reaction?', answer: "Newton's third law", options: ["Newton's first law", "Newton's second law", "Ohm's law"] },
    ],
  }),
];
