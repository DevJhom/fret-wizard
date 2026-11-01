import _ from 'lodash';
import { Setup, majorKeyToNumber } from '@data/constants';
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

// Drops undefined fields and ignores key order, so a stack read back from the API compares equal.
// Keys compare by pitch: the Chord page respells a saved C♯ major as D♭ without changing the chord
const plain = (stack: FretboardData[]) => (JSON.parse(JSON.stringify(stack)) as FretboardData[])
  .map(fretboard => ({ ...fretboard, currentKey: majorKeyToNumber[fretboard.currentKey] ?? fretboard.currentKey }));

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

// What the page holds: a draft, or a Library card with or without unsaved edits
export type CardStatus = 'draft' | 'saved' | 'unsaved';

export const cardStatus = (hasCard: boolean, isDirty: boolean): CardStatus => {
  if (!hasCard) return 'draft';
  return isDirty ? 'unsaved' : 'saved';
};

// The Save button names what a click does: create a card, nothing, or overwrite the open one
export const saveLabel = (status: CardStatus): string => ({
  draft: 'Save to Library',
  saved: 'Saved',
  unsaved: 'Save changes',
})[status];

// A rename only counts when the trimmed name is new and not blank
export const renamedTo = (draft: string, current: string): string | null => {
  const name = draft.trim();
  return name && name !== current ? name : null;
};

// The URL named a card the page can't open, so the page says why it is now a draft
export const detachNotice = (action: CardRouteAction): boolean => action === 'detach';

// Browser tab title: the open card first, marked with • while it has unsaved edits
export const pageTitle = (pageName: string, cardName: string | undefined, status: CardStatus): string => {
  const title = `${pageName} · FretWizard`;
  if (!cardName) return title;
  return `${status === 'unsaved' ? '• ' : ''}${cardName} · ${title}`;
};
