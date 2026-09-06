/**
 * Generator Registry
 *
 * Add a new category by importing its array and pushing it here.
 *
 * Example to add a new subject:
 *   import { SCIENCES_GENERATORS } from './sciences';
 *   ALL_GENERATORS.push(...SCIENCES_GENERATORS);
 */

import { ExerciseGenerator, Category } from './types';
import { MATH_GENERATORS } from './math';
import { SCIENCES_GENERATORS } from './sciences';
import { GEOGRAPHY_GENERATORS } from './geography';
import { HISTORY_GENERATORS } from './history';
import { LANGUAGES_GENERATORS } from './languages';
import { CS_GENERATORS } from './cs';
import { BUSINESS_GENERATORS } from './business';

export const ALL_GENERATORS: ExerciseGenerator[] = [
  ...MATH_GENERATORS,
  ...SCIENCES_GENERATORS,
  ...GEOGRAPHY_GENERATORS,
  ...HISTORY_GENERATORS,
  ...LANGUAGES_GENERATORS,
  ...CS_GENERATORS,
  ...BUSINESS_GENERATORS,
];

export const getGeneratorsByCategory = (cat: Category) =>
  ALL_GENERATORS.filter(g => g.category === cat);

export const getGeneratorById = (id: string) =>
  ALL_GENERATORS.find(g => g.id === id);

export const getActiveCategories = (): Category[] => {
  const set = new Set<Category>();
  for (const g of ALL_GENERATORS) set.add(g.category);
  return Array.from(set);
};

export * from './types';
