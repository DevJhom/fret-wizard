import _ from 'lodash';
import { Setup } from '@data/constants';
import type { FretboardData } from '@/lib/fretboardData';
import type { LibraryCard } from '@services/adapters/localStorageAdapter';

// Which Library card each page's stack was opened from. Kept in this browser only, like the theme.
const storageKey = (setup: Setup) => `${setup.toLowerCase()}WorkspaceCardId`;

export const getWorkspaceCardId = (setup: Setup): string | null => {
  try {
    return localStorage.getItem(storageKey(setup));
  } catch {
    return null;
  }
};

export const setWorkspaceCardId = (setup: Setup, cardId: string) => {
  try {
    localStorage.setItem(storageKey(setup), cardId);
  } catch {
    // Storage unavailable: the card link still works for this visit
  }
};

export const clearWorkspaceCardId = (setup: Setup) => {
  try {
    localStorage.removeItem(storageKey(setup));
  } catch {
    // Storage unavailable
  }
};

// Drops undefined fields and ignores key order, so a stack read back from the API compares equal
const plain = (stack: FretboardData[]) => JSON.parse(JSON.stringify(stack));

export const sameStack = (a: FretboardData[], b: FretboardData[]) => _.isEqual(plain(a), plain(b));

export type CardRouteAction = 'keep' | 'load' | 'detach';

// The URL names a card: keep the page's draft of it, load its saved stack, or drop the id
export const resolveCardRoute = (cardId: string, setup: Setup, cards: LibraryCard[], workspaceCardId: string | null): CardRouteAction => {
  const card = cards.find(c => c.id === cardId);
  if (!card || card.setup !== setup) return 'detach';
  return workspaceCardId === cardId ? 'keep' : 'load';
};

// The card whose unsaved edits would be lost if another card were loaded into the page
export const cardWithUnsavedDraft = (workspaceCardId: string | null, nextCardId: string, workspaceStack: FretboardData[], cards: LibraryCard[]): LibraryCard | undefined => {
  if (!workspaceCardId || workspaceCardId === nextCardId) return undefined;
  const card = cards.find(c => c.id === workspaceCardId);
  return card && !sameStack(workspaceStack, card.fretboards) ? card : undefined;
};
