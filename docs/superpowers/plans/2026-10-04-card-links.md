# Library Card Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Opening a Library card puts its id in the URL (`/fret-wizard/scale/<card-id>`). Save on that page updates the same card, "Save as new card" forks a copy, and the card only changes when you press Save.

**Architecture:** The URL is the source of truth for which card a Scale or Chord page is working on. `pageRoute.ts` learns an optional card id segment. A new `cardSession.ts` remembers, per page and in this browser only, which card the page's stack came from. It also holds the pure decisions: keep the draft, load the card, or drop the id; is the stack unsaved; would loading lose someone's edits. `FretboardPage` applies those decisions and saves. `DefaultLayout` owns history and passes the card id down. The old "auto-update the active card on leave" path and `activeCardId` are removed.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Pinia, lodash, Vitest + happy-dom.

**Spec (user decisions, 2026-10-04):**
- Card ids are the existing `LibraryCard.id` GUIDs (`crypto.randomUUID()` for guests, SQL `uniqueidentifier` for accounts).
- Save button with a card open: **Save** updates the card, and **Save as new card** creates a copy.
- **Explicit Save only.** Leaving the page no longer updates the card. The button shows unsaved vs saved, and the "Active · auto-saves" label goes away.
- **Scale/Chord tabs stay on the card** until you open another card or close it.

## Global Constraints

- Use path aliases in imports; never relative paths. Components use `<script setup lang="ts">`.
- The persisted data shape (`LibraryCard`, workspace stacks) stays unchanged. The only new storage is the localStorage keys `scaleWorkspaceCardId` and `chordWorkspaceCardId`, and every read and write goes through try/catch.
- Card ids appear in the URL only on the Scale and Chord pages. `/library/<x>` and `/chord-progression/<x>` ignore the extra segment.
- Copy (exact): Save button `Save to Library` (no card open), `Save` (card open, unsaved changes), `Saved` (card open, no changes, disabled); secondary `Save as new card`; close button `aria-label` `Close <card name>`; discard prompt `"<name>" has unsaved changes. Discard them and open this card?`.
- Commit messages are plain: no `Co-Authored-By` trailer.
- Run `npm test` and `npm run build` before calling a task done.

## Review Focus

1. **Opening another card (from the Library, Back/Forward or a bookmark) while the current card has unsaved changes:** the user is asked first. Cancel returns to the edited card with its edits intact. Tested in Task 2 (`cardWithUnsavedDraft`).
2. **A URL naming a deleted card, a card of the other page type, or a card from another account:** the page opens normally without the id, and nothing crashes. Tested in Task 2 (`resolveCardRoute` → `detach`).
3. **Refreshing with unsaved edits:** the edits stay and still show as unsaved. Tested in Task 2 (`resolveCardRoute` → `keep`).
4. **A stack read back from the API with different key order or missing optional fields:** it must not show as "unsaved". Tested in Task 2 (`sameStack`).
5. **Odd URLs** (trailing slash, extra segments, a malformed `%` escape): each resolves to a sensible page without throwing. Tested in Task 1.

---

## Execution phases

The main session implements the plan inline and stops after each phase.

| Phase | Tasks | Deliverable |
|---|---|---|
| 1 | Task 0, Task 1, Task 2 | Commit the pending empty-state tweak; card-aware routes and card session helpers, with tests |
| 2 | Task 3, Task 4 | Scale/Chord pages save to their card; the layout drives the URL. Feature works end to end |
| 3 | Task 5, Task 6 | Remove `activeCardId`, auto-save and the Active label; docs; final verification |

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/pageRoute.ts` | Modify | `routeFromPath`, `pathForView(view, cardId?)`, `isFretboardView` |
| `src/lib/cardSession.ts` | Create | Workspace card id storage, `sameStack`, `resolveCardRoute`, `cardWithUnsavedDraft` |
| `src/components/FretboardPage.vue` | Modify | Attach/load the URL's card, Save / Save as new / Close, unsaved state |
| `src/components/StackBar.vue` | Modify | Open-card name with ×, Save / Saved / Save as new card buttons |
| `src/layout/DefaultLayout.vue` | Modify | Card id in history, tabs return to the page's card, no auto-save |
| `src/stores/useLibraryStore.ts` | Modify | Drop `activeCardId` and `activeCard` |
| `src/components/LibraryPage.vue`, `LibraryCardItem.vue` | Modify | Drop the Active label |
| `tests/unit/pageRoute.test.ts` | Modify | Card id routes |
| `tests/unit/cardSession.test.ts` | Create | Tests for Task 2 |
| `tests/unit/libraryStore.test.ts` | Modify | `reset` no longer touches `activeCardId` |
| `CLAUDE.md` | Modify | Routing and saving behaviour |

---

### Task 0: Commit the pending empty-state tweak

- [ ] **Step 1:** On `library-redesign`, commit the uncommitted Library empty-state change (`src/components/LibraryPage.vue`, `src/layout/DefaultLayout.vue`):

```bash
git add src/components/LibraryPage.vue src/layout/DefaultLayout.vue
git commit -m "feat: simplify the empty library state"
```

This feature continues on `library-redesign`.

---

### Task 1: Card ids in page routes

**Files:** Modify `src/lib/pageRoute.ts`, `tests/unit/pageRoute.test.ts`

**Interfaces — Produces:**
- `isFretboardView(view: View): view is FretboardView`
- `interface Route { view: View; cardId: string | null }`
- `routeFromPath(path: string): Route`
- `pathForView(view: View, cardId?: string | null): string`
- `viewFromPath(path: string): View` (kept, now `routeFromPath(path).view`)

- [ ] **Step 1: Add the failing tests.** Append inside the `describe` in `tests/unit/pageRoute.test.ts`, and add `routeFromPath` to its import:

```ts
  it('carries a card id on the Scale and Chord pages', () => {
    expect(pathForView('scale', 'abc-123')).toBe('/fret-wizard/scale/abc-123')
    expect(routeFromPath('/fret-wizard/scale/abc-123')).toEqual({ view: 'scale', cardId: 'abc-123' })
    expect(routeFromPath('/fret-wizard/chord/abc-123/')).toEqual({ view: 'chord', cardId: 'abc-123' })
  })

  it('ignores a card id on other pages', () => {
    expect(pathForView('library', 'abc-123')).toBe('/fret-wizard/library')
    expect(routeFromPath('/fret-wizard/library/abc-123')).toEqual({ view: 'library', cardId: null })
  })

  it('has no card id for plain pages', () => {
    expect(pathForView('scale', null)).toBe('/fret-wizard/scale')
    expect(routeFromPath('/fret-wizard/scale')).toEqual({ view: 'scale', cardId: null })
  })

  it('survives odd paths', () => {
    expect(routeFromPath('/fret-wizard/scale/a/b')).toEqual({ view: 'scale', cardId: null })
    expect(routeFromPath('/fret-wizard/scale/%E0%A4%A')).toEqual({ view: 'scale', cardId: null })
    expect(routeFromPath('/fret-wizard/nope/abc')).toEqual({ view: 'scale', cardId: null })
  })
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/pageRoute.test.ts`. Expected: FAIL (`routeFromPath` is not exported).

- [ ] **Step 3: Implement.** Replace `pathForView` and `viewFromPath` in `src/lib/pageRoute.ts` with:

```ts
export const isFretboardView = (view: View): view is FretboardView => view === 'scale' || view === 'chord';

export interface Route {
  view: View;
  // The Library card a Scale/Chord page is working on: /fret-wizard/scale/<card-id>
  cardId: string | null;
}

export const pathForView = (view: View, cardId: string | null = null) =>
  `${base}${segments[view]}${cardId && isFretboardView(view) ? `/${encodeURIComponent(cardId)}` : ''}`;

const decode = (text: string) => {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

export const routeFromPath = (path: string): Route => {
  const rest = path.startsWith(base) ? path.slice(base.length).replace(/\/$/, '') : '';
  const [segment, cardId, ...extra] = rest.split('/');
  const view = (Object.keys(segments) as View[]).find(v => segments[v] === segment) ?? 'scale';
  const hasCard = isFretboardView(view) && segments[view] === segment && !!cardId && extra.length === 0;
  return { view, cardId: hasCard ? decode(cardId) : null };
}

export const viewFromPath = (path: string): View => routeFromPath(path).view;
```

- [ ] **Step 4:** Run `npx vitest run tests/unit/pageRoute.test.ts`. Expected: PASS, both the old tests and the new ones.

- [ ] **Step 5:** `git add src/lib/pageRoute.ts tests/unit/pageRoute.test.ts && git commit -m "feat: carry a library card id in scale and chord URLs"`

---

### Task 2: Card session helpers

**Files:** Create `src/lib/cardSession.ts`, `tests/unit/cardSession.test.ts`

**Interfaces — Produces:**
- `getWorkspaceCardId(setup: Setup): string | null`, `setWorkspaceCardId(setup: Setup, cardId: string): void`, `clearWorkspaceCardId(setup: Setup): void`
- `sameStack(a: FretboardData[], b: FretboardData[]): boolean`
- `type CardRouteAction = 'keep' | 'load' | 'detach'`
- `resolveCardRoute(cardId: string, setup: Setup, cards: LibraryCard[], workspaceCardId: string | null): CardRouteAction`
- `cardWithUnsavedDraft(workspaceCardId: string | null, nextCardId: string, workspaceStack: FretboardData[], cards: LibraryCard[]): LibraryCard | undefined`

- [ ] **Step 1: Write the failing tests** in `tests/unit/cardSession.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { Setup } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'
import { cardWithUnsavedDraft, clearWorkspaceCardId, getWorkspaceCardId, resolveCardRoute, sameStack, setWorkspaceCardId } from '@/lib/cardSession'

const board = (key: string): FretboardData => ({ ...defaultDataFor(Setup.Scale), currentKey: key })
const card = (id: string, setup: Setup, fretboards: FretboardData[]): LibraryCard => ({ id, name: `Card ${id}`, setup, fretboards, createdAt: 0 })

const scaleCard = card('s1', Setup.Scale, [board('A')])
const otherScaleCard = card('s2', Setup.Scale, [board('E')])
const chordCard = card('c1', Setup.Chord, [defaultDataFor(Setup.Chord)])
const cards = [scaleCard, otherScaleCard, chordCard]

describe('workspace card id', () => {
  beforeEach(() => localStorage.clear())

  it('is remembered per page', () => {
    setWorkspaceCardId(Setup.Scale, 's1')
    expect(getWorkspaceCardId(Setup.Scale)).toBe('s1')
    expect(getWorkspaceCardId(Setup.Chord)).toBeNull()
    clearWorkspaceCardId(Setup.Scale)
    expect(getWorkspaceCardId(Setup.Scale)).toBeNull()
  })
})

describe('sameStack', () => {
  it('ignores key order and undefined fields', () => {
    const a = board('A')
    const reordered = JSON.parse(JSON.stringify({ chordView: undefined, ...a })) as FretboardData
    expect(sameStack([a], [{ ...reordered }])).toBe(true)
    expect(sameStack([{ ...a, chordView: undefined }], [a])).toBe(true)
  })

  it('sees real changes', () => {
    expect(sameStack([board('A')], [board('E')])).toBe(false)
    expect(sameStack([board('A')], [board('A'), board('A')])).toBe(false)
  })
})

describe('resolveCardRoute', () => {
  it('keeps the draft when the page already holds that card', () => {
    expect(resolveCardRoute('s1', Setup.Scale, cards, 's1')).toBe('keep')
  })

  it('loads the card when the page holds something else', () => {
    expect(resolveCardRoute('s1', Setup.Scale, cards, null)).toBe('load')
    expect(resolveCardRoute('s1', Setup.Scale, cards, 's2')).toBe('load')
  })

  it('drops ids for missing cards or the other page type', () => {
    expect(resolveCardRoute('gone', Setup.Scale, cards, 'gone')).toBe('detach')
    expect(resolveCardRoute('c1', Setup.Scale, cards, null)).toBe('detach')
  })
})

describe('cardWithUnsavedDraft', () => {
  it('names the card whose edits would be lost', () => {
    expect(cardWithUnsavedDraft('s1', 's2', [board('G')], cards)).toBe(scaleCard)
  })

  it('is quiet when nothing would be lost', () => {
    expect(cardWithUnsavedDraft('s1', 's2', [board('A')], cards)).toBeUndefined() // draft matches saved card
    expect(cardWithUnsavedDraft(null, 's2', [board('G')], cards)).toBeUndefined() // no card open
    expect(cardWithUnsavedDraft('s1', 's1', [board('G')], cards)).toBeUndefined() // reopening the same card
    expect(cardWithUnsavedDraft('gone', 's2', [board('G')], cards)).toBeUndefined() // card was deleted
  })
})
```

- [ ] **Step 2:** Run `npx vitest run tests/unit/cardSession.test.ts`. Expected: FAIL (`@/lib/cardSession` can't be resolved).

- [ ] **Step 3: Implement** `src/lib/cardSession.ts`:

```ts
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
```

- [ ] **Step 4:** Run `npx vitest run tests/unit/cardSession.test.ts`, then `npm test`. Expected: PASS.

- [ ] **Step 5:** `git add src/lib/cardSession.ts tests/unit/cardSession.test.ts && git commit -m "feat: add library card session helpers"`

**Phase 1 stops here.**

---

### Task 3: Scale/Chord page saves to its card

**Files:** Modify `src/components/FretboardPage.vue`, `src/components/StackBar.vue`

**Interfaces:**
- Consumes: everything Task 2 produces.
- Produces: `FretboardPage` props `{ setup: Setup, cardId?: string | null }` and emits `open-card(cardId: string, replace: boolean)` and `close-card(replace: boolean)`. `StackBar` gains props `cardName?: string`, `isDirty: boolean` and emits `save-as-new` and `close-card`.

- [ ] **Step 1: StackBar script.** Replace the `hasSaved` ref and the `save` function with:

```ts
const saveLabel = computed(() => {
    if (!props.cardName) return 'Save to Library';
    return props.isDirty ? 'Save' : 'Saved';
});
```

Change `import { ref, onMounted } from 'vue';` to `import { computed, ref, onMounted } from 'vue';`. Add the props `cardName?: string, isDirty: boolean` to `defineProps`, and add `(e: 'save-as-new'): void` and `(e: 'close-card'): void` to `defineEmits`.

- [ ] **Step 2: StackBar template.** Replace the `stack-actions` div with:

```vue
        <div class="stack-actions">
            <span v-if="cardName" class="open-card" :title="cardName">
                <span class="open-card-name">{{ cardName }}</span>
                <button type="button" class="open-card-close" :aria-label="`Close ${cardName}`" @click="emit('close-card')">×</button>
            </span>
            <button type="button" class="stack-action reset-action" @click="emit('reset')">Reset</button>
            <button v-if="cardName" type="button" class="stack-action save-as-new-action" @click="emit('save-as-new')">Save as new card</button>
            <button type="button" class="stack-action save-action" :disabled="!!cardName && !isDirty" @click="emit('save')">{{ saveLabel }}</button>
        </div>
```

- [ ] **Step 3: StackBar styles.** Add these after `.save-action`:

```scss
.save-action:disabled {
    opacity: 0.6;
    cursor: default;
    filter: none;
}

.save-as-new-action {
    background-color: var(--option-background-color);
}

.open-card {
    display: inline-flex;
    align-items: center;
    max-width: 220px;
    padding-left: 0.75rem;
    border: 1px solid var(--card-border-color);
    border-radius: 9px;
}

.open-card-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
    font-weight: 600;
}

.open-card-close {
    width: 36px;
    height: 42px;
    border: none;
    background: none;
    color: var(--muted-text-color);
    font-size: 1.1rem;
    cursor: pointer;

    &:hover {
        color: inherit;
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}
```

In the `@media (max-width: $phone)` block, add `flex-wrap: wrap;` to `.stack-actions`.

- [ ] **Step 4: FretboardPage script.** Add the import:

```ts
import { cardWithUnsavedDraft, clearWorkspaceCardId, getWorkspaceCardId, resolveCardRoute, sameStack, setWorkspaceCardId } from '@/lib/cardSession';
```

Replace `const props = defineProps<{ setup: Setup }>();` with:

```ts
const props = defineProps<{ setup: Setup, cardId?: string | null }>();

const emit = defineEmits<{
    (e: 'open-card', cardId: string, replace: boolean): void
    (e: 'close-card', replace: boolean): void
}>();
```

After `const chord = computed(...)`, add:

```ts
// The Library card named in the URL, once the library has loaded
const openCard = computed(() => props.cardId ? libraryStore.cards.find(c => c.id === props.cardId && c.setup === props.setup) : undefined);
const isDirty = computed(() => !!openCard.value && !sameStack(stack.value, openCard.value.fretboards));
```

Replace `saveToLibrary` with:

```ts
const saveCard = async () => {
    if (openCard.value) {
        await libraryStore.updateCardFretboards(openCard.value.id, stack.value);
    } else {
        await saveAsNewCard();
    }
}

const saveAsNewCard = async () => {
    await libraryStore.ensureLoaded();
    const card = await libraryStore.createCard(`Card ${libraryStore.cards.length + 1}`, props.setup, stack.value);
    if (!card) return;
    setWorkspaceCardId(props.setup, card.id);
    emit('open-card', card.id, false);
}

// Keeps the stack as a plain draft; the next Save makes a new card
const closeCard = () => {
    clearWorkspaceCardId(props.setup);
    emit('close-card', false);
}

// Brings the page in line with the card named in the URL
const attachCard = async (cardId: string | null | undefined) => {
    if (!cardId) return;
    await libraryStore.ensureLoaded();
    const workspaceCardId = getWorkspaceCardId(props.setup);
    const action = resolveCardRoute(cardId, props.setup, libraryStore.cards, workspaceCardId);
    if (action === 'detach') {
        if (workspaceCardId === cardId) clearWorkspaceCardId(props.setup);
        emit('close-card', true);
        return;
    }
    if (action === 'keep') return;

    const unsaved = cardWithUnsavedDraft(workspaceCardId, cardId, stack.value, libraryStore.cards);
    if (unsaved && !window.confirm(`"${unsaved.name}" has unsaved changes. Discard them and open this card?`)) {
        emit('open-card', unsaved.id, true);
        return;
    }

    const card = libraryStore.cards.find(c => c.id === cardId)!;
    stack.value = card.fretboards.length
        ? _.cloneDeep(card.fretboards).map(fretboard => ({ ...fretboard, currentSetup: props.setup }))
        : [defaultDataFor(props.setup)];
    selectedIndex.value = 0;
    setWorkspaceCardId(props.setup, cardId);
}
```

Replace the `onMounted` block with:

```ts
onMounted(async () => {
    await loadStack();
    await attachCard(props.cardId);
})

// Back/Forward between cards, or a card just saved, changes the id without remounting the page
watch(() => props.cardId, cardId => attachCard(cardId));
```

- [ ] **Step 5: FretboardPage template.** On `<StackBar>`, add `:card-name="openCard?.name"` and `:is-dirty="isDirty"`, change `@save="saveToLibrary"` to `@save="saveCard"`, and add `@save-as-new="saveAsNewCard"` and `@close-card="closeCard"`.

- [ ] **Step 6:** Run `npm test` and `npm run build`. Expected: both pass. `cardId` is optional, so the layout still compiles before Task 4.

- [ ] **Step 7:** `git add src/components/FretboardPage.vue src/components/StackBar.vue && git commit -m "feat: save scale and chord pages to their library card"`

---

### Task 4: Layout drives the card URL

**Files:** Modify `src/layout/DefaultLayout.vue`

**Interfaces — Consumes:** `routeFromPath`, `pathForView`, `isFretboardView` (Task 1); `getWorkspaceCardId` (Task 2); FretboardPage's props and emits (Task 3).

- [ ] **Step 1: Imports.** Change the customizerService import to `import { fetchCurrentTheme, saveCurrentTheme, flushPendingSaves } from '@/services/customizerService';`. Change `import { pathForView, viewFromPath } from '@/lib/pageRoute';` to `import { isFretboardView, pathForView, routeFromPath } from '@/lib/pageRoute';`. Add `import { getWorkspaceCardId } from '@/lib/cardSession';`.

- [ ] **Step 2: State and navigation.** Replace everything from `// The page lives in the URL path so a refresh reopens it` down to the end of the `watch(currentView, …)` block (that is: `currentView`, `isMenuOpen`, `getCurrentTheme`, `saveActiveCard`, `onLoadCard`, `switchView`, `closeMenuOnEscape`, `refreshPage`, `replacePath`, `onPopState` and the `watch(currentView…)`) with:

```ts
// The page and, on Scale/Chord, the open Library card live in the URL path so a refresh reopens them
const initialRoute = routeFromPath(window.location.pathname);
const currentView = ref<View>(initialRoute.view);
const currentCardId = ref<string | null>(initialRoute.cardId);
// Phone-only sidebar holding the page nav
const isMenuOpen = ref(false);

const getCurrentTheme = async () => {
  const data = await fetchCurrentTheme();
  if (data) {
    theme.value = data;
  }
}

// Every page or card switch adds a history entry, unless it corrects the current one
const navigate = async (view: View, cardId: string | null = null, replace = false) => {
  isMenuOpen.value = false;
  // Debounced API saves must land before the next page reads its stack back.
  await flushPendingSaves();
  currentView.value = view;
  currentCardId.value = isFretboardView(view) ? cardId : null;
  const path = pathForView(view, currentCardId.value);
  if (window.location.pathname === path) return;
  if (replace) {
    history.replaceState(history.state, '', path);
  } else {
    history.pushState(null, '', path);
  }
}

// Scale and Chord tabs return to the card that page was last working on
const switchView = (view: View) => navigate(view, isFretboardView(view) ? getWorkspaceCardId(setupForView[view]) : null);

const onLoadCard = (card: LibraryCard) => navigate(viewForSetup[card.setup], card.id);

const onOpenCard = (cardId: string, replace: boolean) => navigate(currentView.value, cardId, replace);

const onCloseCard = (replace: boolean) => navigate(currentView.value, null, replace);

const closeMenuOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isMenuOpen.value = false;
}

const refreshPage = () => {
  window.location.reload();
};

// Rewrites the app root or an unknown path without adding a history entry
const replacePath = () => {
  const path = pathForView(currentView.value, currentCardId.value);
  if (window.location.pathname !== path) history.replaceState(history.state, '', path);
}

// Back/Forward follow the URL without adding history
const onPopState = async () => {
  const route = routeFromPath(window.location.pathname);
  await flushPendingSaves();
  currentView.value = route.view;
  currentCardId.value = route.cardId;
  replacePath();
}
```

- [ ] **Step 3: Mount.** In `onMounted`, change `replacePath(currentView.value);` to `replacePath();`.

- [ ] **Step 4: Template.** Change the `<FretboardPage …>` line to:

```vue
          <FretboardPage v-else :key="`${currentView}-${authStore.sessionVersion}`" :setup="setupForView[currentView]" :card-id="currentCardId" @open-card="onOpenCard" @close-card="onCloseCard"/>
```

- [ ] **Step 5:** Run `npm test` and `npm run build`. Expected: both pass, with no unused-import errors.

- [ ] **Step 6:** `git add src/layout/DefaultLayout.vue && git commit -m "feat: keep the open library card in the URL"`

**Phase 2 stops here.** The feature works end to end; ask the user to try it.

---

### Task 5: Remove activeCardId and auto-save leftovers

**Files:** Modify `src/stores/useLibraryStore.ts`, `src/components/LibraryPage.vue`, `src/components/LibraryCardItem.vue`, `tests/unit/libraryStore.test.ts`

- [ ] **Step 1: Test first.** In `tests/unit/libraryStore.test.ts`, change the last test to:

```ts
  it('reset forgets the cards, and the next load reads again', async () => {
    useAuthStore().status = 'guest'
    const library = useLibraryStore()
    await library.createCard('Card 1', Setup.Scale)

    library.reset()
    expect(library.cards).toEqual([])
    expect(library.isLoaded).toBe(false)
    expect('activeCardId' in library.$state).toBe(false)

    await library.ensureLoaded()
    expect(library.cards).toHaveLength(1)
  })
```

Run `npx vitest run tests/unit/libraryStore.test.ts`. Expected: FAIL on `'activeCardId' in library.$state`.

- [ ] **Step 2: Store.** In `useLibraryStore.ts`, delete the `activeCardId` state field, the whole `getters` block, `this.activeCardId = null` in `reset()`, and `if (this.activeCardId === id) this.activeCardId = null` in `deleteCard()`.

- [ ] **Step 3: Library card.** In `LibraryCardItem.vue`, delete the `isActive: boolean,` prop, the `<span v-if="isActive" class="active-label" …>…</span>` element, and the `.active-label` and `.active-dot` style blocks. In `LibraryPage.vue`, delete the `:is-active="card.id === libraryStore.activeCardId"` line.

- [ ] **Step 4:** Run `npm test` and `npm run build`. Expected: both pass. `git grep -n activeCard -- src tests` prints nothing.

- [ ] **Step 5:** `git add src/stores/useLibraryStore.ts src/components/LibraryPage.vue src/components/LibraryCardItem.vue tests/unit/libraryStore.test.ts && git commit -m "refactor: drop the auto-saving active card"`

---

### Task 6: Docs and final verification

- [ ] **Step 1: CLAUDE.md.** Replace the sentence that begins `The current page lives in the URL path` (it ends `there is no vue-router.`) with:

```
The current page lives in the URL path (`/fret-wizard/scale`, `/chord`, `/chord-progression`, `/library`; `src/lib/pageRoute.ts`, `history.pushState`), so a refresh reopens it and Back/Forward switch pages; there is no vue-router. A Scale/Chord page opened from a Library card carries the card id (`/fret-wizard/scale/<card-id>`). `src/lib/cardSession.ts` remembers per page (localStorage `scaleWorkspaceCardId` / `chordWorkspaceCardId`) which card the stack came from, so a refresh keeps unsaved edits and the Scale/Chord tabs return to that card.
```

Replace `A \`LibraryCard\` stores \`setup\` plus a \`fretboards\` stack; the active card auto-updates when leaving its page.` with:

```
A `LibraryCard` stores `setup` plus a `fretboards` stack. A card changes only when Save is pressed on its page ("Save as new card" forks it; × closes it). Opening another card over unsaved edits asks first.
```

- [ ] **Step 2:** Run `npm test` and `npm run build`. Expected: both pass.

- [ ] **Step 3:** `git add CLAUDE.md && git commit -m "docs: describe library card links"`

- [ ] **Step 4: Manual checklist for the user** (`npm run dev`):
1. Open a card from the Library: the URL becomes `/fret-wizard/scale/<id>`, and the stack bar shows the card name with ×. The button reads "Saved" and is disabled.
2. Change something: the button reads "Save". Press it: it reads "Saved", and the Library card shows the change.
3. "Save as new card": the URL switches to the new card's id, and the Library has both cards.
4. Refresh with unsaved edits: the edits stay, and the button still reads "Save".
5. Go to the Library and click the Scale tab: you're back on `/scale/<id>`.
6. Edit card A without saving, then open card B: you're asked first. Cancel keeps A and its edits; OK opens B.
7. × closes the card: the URL becomes `/scale`, and "Save to Library" creates a new card and opens it.
8. Delete the open card in the Library, then click the Scale tab: the page opens without an id.
9. Back/Forward between two cards switches between them.
10. Signed in: the same flows work, and a card link opened on another device loads that card.

**Phase 3 stops here.**
