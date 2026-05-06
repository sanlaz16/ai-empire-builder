import { ptBR } from './locales/pt-BR';
import { en } from './locales/en';
import type { Dictionary } from './types';

export type Locale = 'pt-BR' | 'en';

export const DEFAULT_LOCALE: Locale = 'pt-BR';

const dictionaries: Record<Locale, Dictionary> = {
  'pt-BR': ptBR,
  'en': en,
};

export function getDict(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type { Dictionary };
