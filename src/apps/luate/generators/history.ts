/**
 * History exercise generators
 */

import { makeFactGenerator, ExerciseGenerator } from './types';

export const HISTORY_GENERATORS: ExerciseGenerator[] = [
  makeFactGenerator({
    id: 'history.ancientCivilizations',
    name: 'Ancient Civilizations',
    description: 'Egypt, Rome, Greece and early civilisations.',
    category: 'history',
    level: 'primary',
    facts: [
      { question: 'Which civilization built the pyramids?', answer: 'Ancient Egyptians', options: ['Ancient Greeks', 'Romans', 'Aztecs'] },
      { question: 'Which ancient empire was ruled by Julius Caesar?', answer: 'Roman Empire', options: ['Greek Empire', 'Persian Empire', 'Ottoman Empire'] },
      { question: 'Which civilization first developed democracy in Athens?', answer: 'Ancient Greeks', options: ['Romans', 'Egyptians', 'Vikings'] },
      { question: 'Which river was the Egyptian civilization based around?', answer: 'The Nile', options: ['The Euphrates', 'The Tiber', 'The Indus'] },
      { question: 'What Roman building hosted gladiator fights?', answer: 'The Colosseum', options: ['The Parthenon', 'The Pantheon', 'The Forum'] },
      { question: 'Which ancient wonder was located in Babylon?', answer: 'The Hanging Gardens', options: ['The Great Pyramid', 'The Lighthouse of Alexandria', 'The Colossus of Rhodes'] },
    ],
  }),
  makeFactGenerator({
    id: 'history.keyDates',
    name: 'Key Dates',
    description: 'Important years in world history.',
    category: 'history',
    level: 'gcse',
    facts: [
      { question: 'In which year did World War I begin?', answer: '1914', options: ['1912', '1914', '1918'] },
      { question: 'In which year did World War II end?', answer: '1945', options: ['1943', '1944', '1945'] },
      { question: 'In which year did the French Revolution begin?', answer: '1789', options: ['1776', '1789', '1804'] },
      { question: 'In which year did the Berlin Wall fall?', answer: '1989', options: ['1985', '1989', '1991'] },
      { question: 'In which year was the American Declaration of Independence signed?', answer: '1776', options: ['1776', '1783', '1789'] },
      { question: 'In which year did the Titanic sink?', answer: '1912', options: ['1905', '1912', '1918'] },
    ],
  }),
  makeFactGenerator({
    id: 'history.figures',
    name: 'Historical Figures',
    description: 'People who changed the course of history.',
    category: 'history',
    level: 'gcse',
    facts: [
      { question: 'Who was the first President of the United States?', answer: 'George Washington', options: ['Abraham Lincoln', 'Thomas Jefferson', 'John Adams'] },
      { question: 'Who led the Indian independence movement through non-violence?', answer: 'Mahatma Gandhi', options: ['Jawaharlal Nehru', 'Subhas Chandra Bose', 'Nelson Mandela'] },
      { question: 'Which French military leader became Emperor?', answer: 'Napoleon Bonaparte', options: ['Louis XIV', 'Charles de Gaulle', 'Robespierre'] },
      { question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci', options: ['Michelangelo', 'Raphael', 'Vincent van Gogh'] },
      { question: "Who wrote 'Romeo and Juliet'?", answer: 'William Shakespeare', options: ['Charles Dickens', 'Jane Austen', 'Homer'] },
      { question: 'Who discovered gravity after observing a falling apple?', answer: 'Isaac Newton', options: ['Albert Einstein', 'Galileo Galilei', 'James Maxwell'] },
    ],
  }),
  makeFactGenerator({
    id: 'history.modernWorld',
    name: 'Modern History',
    description: 'World wars, the Cold War and the 20th century.',
    category: 'history',
    level: 'alevel',
    facts: [
      { question: 'What event triggered World War I?', answer: 'The assassination of Archduke Franz Ferdinand', options: ['The invasion of Poland', 'The sinking of the Lusitania', 'The bombing of Pearl Harbor'] },
      { question: 'Which treaty ended World War I?', answer: 'Treaty of Versailles', options: ['Treaty of Paris', 'Treaty of Westphalia', 'Treaty of Rome'] },
      { question: 'What was the Cold War?', answer: 'Tension between the USA and the USSR', options: ['A war fought in cold climates', 'A conflict between France and Germany', 'A trade war between Europe and Asia'] },
      { question: 'Who was the leader of Nazi Germany?', answer: 'Adolf Hitler', options: ['Benito Mussolini', 'Joseph Stalin', 'Francisco Franco'] },
      { question: 'What was the Space Race?', answer: 'Competition between the USA and USSR to reach space', options: ['A race to build the fastest car', 'A competition to colonise the Moon', 'A race to build nuclear weapons'] },
      { question: 'In which year did the Soviet Union collapse?', answer: '1991', options: ['1989', '1991', '1993'] },
    ],
  }),
];
