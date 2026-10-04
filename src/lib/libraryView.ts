import { Setup } from '@data/constants';
import { patternSubtitle, patternSymbol } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';
import type { LibraryCard } from '@services/adapters/localStorageAdapter';

export type LibraryFilter = 'all' | Setup;
export type LibrarySort = 'newest' | 'oldest' | 'name';

// Same symbol the stack chips use: "Am Pentatonic", "Gmaj7", "E5"
export const fretboardLabel = (fretboard: FretboardData, setup: Setup) =>
  patternSymbol(fretboard.currentKey, fretboard.currentTonality, fretboard.currentPattern, setup == Setup.Scale);

// Lets people type "Bb", "bbm" or "F#" for B♭, B♭m and F♯
export const normalizeAccidentals = (text: string) =>
  text.replace(/#/g, '♯').replace(/\b([A-Ga-g])b(?=$|[\sm0-9(])/g, '$1♭');

const searchText = (card: LibraryCard) => {
  const isScale = card.setup == Setup.Scale;
  const words = card.fretboards.flatMap(f => [
    fretboardLabel(f, card.setup),
    patternSubtitle(f.currentKey, f.currentTonality, f.currentPattern, isScale),
    f.currentTonality,
  ]);
  return [card.name, ...words].join(' ').toLowerCase();
};

// Every word of the query must appear somewhere in the card
export const matchesQuery = (card: LibraryCard, query: string) => {
  const terms = normalizeAccidentals(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = searchText(card);
  return terms.every(term => text.includes(term));
};

export const filterCounts = (cards: LibraryCard[]): Record<LibraryFilter, number> => ({
  all: cards.length,
  [Setup.Scale]: cards.filter(c => c.setup === Setup.Scale).length,
  [Setup.Chord]: cards.filter(c => c.setup === Setup.Chord).length,
});

const compare: Record<LibrarySort, (a: LibraryCard, b: LibraryCard) => number> = {
  newest: (a, b) => b.createdAt - a.createdAt,
  oldest: (a, b) => a.createdAt - b.createdAt,
  name: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
};

export const visibleCards = (cards: LibraryCard[], filter: LibraryFilter, query: string, sort: LibrarySort) =>
  cards
    .filter(c => (filter === 'all' || c.setup === filter) && matchesQuery(c, query))
    .sort(compare[sort]);

// "Oct 2" this year, "Mar 3, 2025" otherwise
export const savedDate = (createdAt: number, now = Date.now()) => {
  const date = new Date(createdAt);
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
};

export const cardMeta = (card: LibraryCard, now = Date.now()) => {
  const count = card.fretboards.length;
  return `${count} ${count === 1 ? 'fretboard' : 'fretboards'} · Saved ${savedDate(card.createdAt, now)}`;
};
