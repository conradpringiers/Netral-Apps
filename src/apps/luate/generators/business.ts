/**
 * Business exercise generators
 */

import { makeFactGenerator, ExerciseGenerator } from './types';

export const BUSINESS_GENERATORS: ExerciseGenerator[] = [
  makeFactGenerator({
    id: 'business.basics',
    name: 'Business Basics',
    description: 'Revenue, profit, markets and products.',
    category: 'business',
    level: 'gcse',
    facts: [
      { question: 'What is revenue?', answer: 'Money earned from sales', options: ['Money spent on costs', 'Money earned from sales', 'Money owed to lenders'] },
      { question: 'What is profit?', answer: 'Revenue minus costs', options: ['Revenue plus costs', 'Revenue minus costs', 'Revenue divided by costs'] },
      { question: 'What is a business that sells directly to consumers called?', answer: 'Retailer', options: ['Wholesaler', 'Retailer', 'Manufacturer'] },
      { question: 'What is a start-up?', answer: 'A newly established business', options: ['A large corporation', 'A newly established business', 'A government agency'] },
      { question: 'What is a market?', answer: 'Where buyers and sellers meet', options: ['A physical shop', 'Where buyers and sellers meet', 'A type of tax'] },
      { question: 'What is a product?', answer: 'A good or service offered for sale', options: ['A good or service offered for sale', 'A marketing plan', 'A business loan'] },
    ],
  }),
  makeFactGenerator({
    id: 'business.finance',
    name: 'Finance & Accounting',
    description: 'Assets, liabilities, cash flow and statements.',
    category: 'business',
    level: 'gcse',
    facts: [
      { question: 'What is an asset?', answer: 'Something a business owns of value', options: ['Something a business owes', 'Something a business owns of value', 'A type of expense'] },
      { question: 'What is a liability?', answer: 'Something a business owes', options: ['Something a business owns', 'Something a business owes', 'A source of revenue'] },
      { question: 'What does ROI stand for?', answer: 'Return on Investment', options: ['Rate of Interest', 'Return on Investment', 'Revenue on Income'] },
      { question: 'What is cash flow?', answer: 'Money moving in and out of a business', options: ['Profit for the year', 'Money moving in and out of a business', 'Total sales'] },
      { question: 'What is a balance sheet?', answer: 'A statement of assets, liabilities and equity', options: ['A list of sales', 'A statement of assets, liabilities and equity', 'A marketing report'] },
      { question: 'What is equity?', answer: 'The value owned by shareholders', options: ['Money owed to suppliers', 'The value owned by shareholders', 'Annual profit'] },
    ],
  }),
  makeFactGenerator({
    id: 'business.economics',
    name: 'Economics Concepts',
    description: 'Supply, demand, inflation and markets.',
    category: 'business',
    level: 'alevel',
    facts: [
      { question: 'What is supply?', answer: 'How much producers are willing to sell', options: ['How much consumers want to buy', 'How much producers are willing to sell', 'The price of goods'] },
      { question: 'What is demand?', answer: 'How much consumers are willing to buy', options: ['How much producers sell', 'How much consumers are willing to buy', 'A government policy'] },
      { question: 'What is inflation?', answer: 'A general rise in prices', options: ['A fall in prices', 'A general rise in prices', 'A rise in wages only'] },
      { question: 'What is a monopoly?', answer: 'A market with a single dominant seller', options: ['A market with many sellers', 'A market with a single dominant seller', 'A market with no buyers'] },
      { question: 'What does GDP stand for?', answer: 'Gross Domestic Product', options: ['General Domestic Price', 'Gross Domestic Product', 'Gross Demand Percentage'] },
      { question: 'What is opportunity cost?', answer: 'The value of the next best alternative', options: ['The total cost of a project', 'The value of the next best alternative', 'The cost of borrowing'] },
    ],
  }),
  makeFactGenerator({
    id: 'business.entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Business plans, branding and growth.',
    category: 'business',
    level: 'gcse',
    facts: [
      { question: 'What is a business plan?', answer: 'A document outlining goals and strategy', options: ['A marketing poster', 'A document outlining goals and strategy', 'A tax form'] },
      { question: 'What is a target market?', answer: 'The specific group of customers a business aims at', options: ['All possible customers', 'The specific group of customers a business aims at', 'A competitor market'] },
      { question: 'What is branding?', answer: 'Creating a distinct identity for a product', options: ['Lowering prices', 'Creating a distinct identity for a product', 'Hiring more staff'] },
      { question: 'What does B2B mean?', answer: 'Business to Business', options: ['Buyer to Buyer', 'Business to Business', 'Back to Basics'] },
      { question: 'What is a unique selling point (USP)?', answer: 'What makes a product different from competitors', options: ['The price of a product', 'What makes a product different from competitors', 'The number of employees'] },
      { question: 'What is crowdfunding?', answer: 'Raising money from many small contributions', options: ['Borrowing from a bank', 'Raising money from many small contributions', 'Selling shares to one investor'] },
    ],
  }),
];
