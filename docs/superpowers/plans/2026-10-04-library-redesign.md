# Library Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Library page to match the approved design: each card shows a fretboard preview, one button per saved fretboard, an explicit Open button, rename with Save, and delete with a confirm step. The page gets search, a type filter, sorting and a real empty state.

**Architecture:** The logic lives in two pure TypeScript modules that have unit tests. `boardPreview.ts` (data layer) works out which notes light up on frets 0–12. `libraryView.ts` handles labels, search, filter, sort and dates. Two new presentational components, `FretboardPreview.vue` and `LibraryCardItem.vue`, render that output, and `LibraryPage.vue` puts them together. Store and persistence don't change: the page still calls `createCard`, `renameCard` and `deleteCard`, and still emits `load-card`.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Pinia, SCSS (scoped), Vitest + happy-dom.

**Spec:** Design canvas https://claude.ai/artifact/9iacfwMwcT6oqPfSbmoGm4 (artboards: "Library — desktop", "Library — phone", "Library — empty"). The sample cards and the nav bar in the canvas are mockup content and are not built.

## Global Constraints

- Use path aliases in imports (`@/`, `@data/`, `@stores/`, `@services/`, `@components/`); never relative paths.
- Components use `<script setup lang="ts">` and `<style scoped lang="scss">`. One breakpoint: `@media (max-width: $phone)`.
- Music theory logic stays in `src/lib/music-theory/` (alias `@data/`).
- Theme colors come from CSS variables defined in both `.dark-theme` and `.light-theme` in `src/assets/scss/main.scss`. Degree colors come from the existing `.degree-dot.<class>` rules in `notes-input.scss`. Never hard-code a degree color.
- Global styles to override on purpose: `#app { text-align: center }`, `span { font-size: 14px }`, and `button` / `button:hover { border-color: #646cff }` in `main.scss`. Every new `button` and `span` class sets its own `font-size`, `border`, `background`, `padding`, and its `:hover` border color.
- Touch targets are at least 44px tall: Open, rename, delete, Save, Cancel, the filter buttons, search and sort. Fretboard chips are at least 32px tall.
- Every icon-only button has an `aria-label` that includes the card name.
- Copy (exact): page title `Library`; summary `N saved card(s)`; button `New card`; search placeholder `Search by name, key or pattern`; filters `All` / `Scales` / `Chords`; sort `Newest first` / `Oldest first` / `Name A–Z`; open button `Open in Scale` / `Open in Chord`; active label `Active · auto-saves`; confirm `Delete this card?` with `Cancel` / `Delete`; card meta `N fretboard(s) · Saved Mon D` (`, YYYY` added when the year differs); no-results title `No cards match "<query>"` (or `No cards of this type yet` when only a filter is set) with button `Clear search and filters`; empty state title `Save a stack to see it here`, body `Build fretboards on the Scale or Chord page, then use Save to Library. Each card keeps its whole stack, ready to reopen.`, buttons `Go to Scale` / `Go to Chord`.
- The fretboard preview always shows frets 0–12, whatever the card's `fretAmount`. It shows each fretboard's visible tones (`currentHighlightNotes`) on its visible strings (`currentStrings`). It ignores CAGED shape selection and the Chord page's Fingering view.
- Store, adapters and the persisted data shape stay unchanged.
- Run `npm test` and `npm run build` before calling a task done.

## Review Focus

1. **A card with an empty `fretboards` array** (malformed or old data): the card still renders, with meta `0 fretboards` and no preview or chips. The page doesn't crash. Tested in Task 2 (`cardMeta`) and Task 4 (the component guards on `selectedFretboard`).
2. **Sharp, flat and minor keys** (`F♯`, `B♭`, `A` minor): the preview lights the right root. Tested in Task 1.
3. **Hidden strings and hidden tones**: the preview shows what the user actually saved, not the full pattern. Tested in Task 1.
4. **Typing `Bb`, `F#` or `bbm` in search**: matches `B♭`, `F♯` and `B♭m` cards, while `Blues` still matches blues cards. Tested in Task 2.
5. **Sorting names with numbers or mixed case** (`Card 2`, `Card 10`, `card 3`): natural, case-insensitive order. Tested in Task 2.

---

## Execution phases

Per the user's preference, the main session implements the plan inline (superpowers:executing-plans), stopping after each phase with a short status.

| Phase | Tasks | Deliverable |
|---|---|---|
| 1 | Task 0, Task 1, Task 2 | Branch plus pure logic (`boardPreview`, `libraryView`), with tests passing |
| 2 | Task 3, Task 4 | Theme tokens, `FretboardPreview.vue`, `LibraryCardItem.vue`; build passes |
| 3 | Task 5, Task 6 | New `LibraryPage.vue` wired into the layout, docs, final verification |

## File map

| File | Status | Responsibility |
|---|---|---|
| `src/lib/music-theory/boardPreview.ts` | Create | Lit degree per string × fret 0–12 for one `FretboardData` |
| `src/lib/libraryView.ts` | Create | Card labels, search matching, filter counts, filter + sort, date and meta text |
| `src/lib/degreeClasses.ts` | Create | `Degree` → CSS class map (moved out of `PatternSummary.vue`) |
| `src/components/FretboardPreview.vue` | Create | Mini neck drawn from `boardPreview()` |
| `src/components/LibraryCardItem.vue` | Create | One card: badge, active label, name/rename, meta, preview, chips, open/rename/delete |
| `src/components/LibraryPage.vue` | Rewrite | Header, toolbar, grid, no-results and empty states |
| `src/components/PatternSummary.vue` | Modify | Import `degreeClasses` instead of a local copy |
| `src/layout/DefaultLayout.vue` | Modify | Handle the Library page's new `navigate` event |
| `src/assets/scss/main.scss` | Modify | Four new theme tokens in both themes (`--muted-text-color` already exists) |
| `tests/unit/boardPreview.test.ts` | Create | Tests for Task 1 |
| `tests/unit/libraryView.test.ts` | Create | Tests for Task 2 |
| `CLAUDE.md` | Modify | Component hierarchy entry for the Library page |

---

### Task 0: Branch

- [ ] **Step 1: Create the branch**

The working tree already has uncommitted fixes from this session (open-note scrolling and the "Chord" labels), plus an untracked `temp.txt`. Ask the user whether to commit those fixes on `master` first. Then:

```bash
git checkout -b library-redesign
```

---

### Task 1: Fretboard preview data

**Files:**
- Create: `src/lib/music-theory/boardPreview.ts`
- Test: `tests/unit/boardPreview.test.ts`

**Interfaces:**
- Consumes: `Degree`, `degreeToNumber`, `majorKeyToNumber` from `@data/constants`; `FretboardData`, `CurrentStrings` from `@/lib/fretboardData`.
- Produces:
  - `type StringName = keyof CurrentStrings`
  - `interface PreviewString { name: StringName; notes: (Degree | null)[] }`. `notes[0]` is the open string and `notes[n]` is fret n, so the array length is `frets + 1`.
  - `PREVIEW_FRETS = 12`
  - `boardPreview(fretboard: FretboardData, frets = PREVIEW_FRETS): PreviewString[]`, ordered high e to low E: `e, B, G, D, A, E`.

- [ ] **Step 1: Write the failing tests**

`tests/unit/boardPreview.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Setup, Tonality, degreeInPattern } from '@data/constants'
import { getRoots, getMinorSeconds, getSeconds, getMinorThirds, getThirds, getFourths, getTritones, getFifths, getMinorSixths, getSixths, getMinorSevenths, getSevenths } from '@data/intervals'
import { boardPreview } from '@data/boardPreview'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'

const board = (overrides: Partial<FretboardData>): FretboardData => ({ ...defaultDataFor(Setup.Scale), ...overrides })

const scaleBoard = (key: string, tonality: Tonality, pattern: Pattern) =>
  board({ currentKey: key, currentTonality: tonality, currentPattern: pattern, currentHighlightNotes: degreeInPattern(pattern, tonality)! })

const string = (preview: ReturnType<typeof boardPreview>, name: string) => preview.find(s => s.name === name)!

describe('boardPreview', () => {
  it('returns six strings, high e first, each with the open string plus 12 frets', () => {
    const preview = boardPreview(scaleBoard('A', Tonality.MINOR, Pattern.Pentatonic))
    expect(preview.map(s => s.name)).toEqual(['e', 'B', 'G', 'D', 'A', 'E'])
    preview.forEach(s => expect(s.notes).toHaveLength(13))
  })

  it('lights A minor pentatonic degrees on the low E string', () => {
    const low = string(boardPreview(scaleBoard('A', Tonality.MINOR, Pattern.Pentatonic)), 'E')
    expect(low.notes[0]).toBe(Degree.fifths) // open E
    expect(low.notes[1]).toBeNull() // F is not in the scale
    expect(low.notes[3]).toBe(Degree.minorSevenths) // G
    expect(low.notes[5]).toBe(Degree.roots) // A
    expect(low.notes[8]).toBe(Degree.minorThirds) // C
  })

  it('finds the root for sharp and flat keys', () => {
    const roots = (key: string) => board({ currentKey: key, currentHighlightNotes: [Degree.roots] })
    expect(string(boardPreview(roots('B♭')), 'A').notes[1]).toBe(Degree.roots)
    expect(string(boardPreview(roots('F♯')), 'E').notes[2]).toBe(Degree.roots)
    expect(string(boardPreview(roots('F♯')), 'e').notes[2]).toBe(Degree.roots)
  })

  it('shows only the tones the user left visible', () => {
    const preview = boardPreview(board({ currentKey: 'C', currentHighlightNotes: [Degree.roots] }))
    const lit = preview.flatMap(s => s.notes).filter(Boolean)
    expect(new Set(lit)).toEqual(new Set([Degree.roots]))
    expect(string(preview, 'B').notes[1]).toBe(Degree.roots) // C on the B string
  })

  it('leaves hidden strings empty', () => {
    const fb = scaleBoard('G', Tonality.MAJOR, Pattern.Diatonic)
    fb.currentStrings = { ...fb.currentStrings, G: false }
    expect(string(boardPreview(fb), 'G').notes.every(n => n === null)).toBe(true)
    expect(string(boardPreview(fb), 'D').notes.some(n => n !== null)).toBe(true)
  })

  // MyString lights fret n when the degree's interval list includes n; its open note is fret 12's
  const intervalsFor: Record<Degree, typeof getRoots> = {
    [Degree.roots]: getRoots, [Degree.minorSeconds]: getMinorSeconds, [Degree.seconds]: getSeconds,
    [Degree.minorThirds]: getMinorThirds, [Degree.thirds]: getThirds, [Degree.fourths]: getFourths,
    [Degree.tritones]: getTritones, [Degree.fifths]: getFifths, [Degree.minorSixths]: getMinorSixths,
    [Degree.sixths]: getSixths, [Degree.minorSevenths]: getMinorSevenths, [Degree.sevenths]: getSevenths,
  }

  it('agrees with the notes MyString lights on frets 0 to 12', () => {
    const cases: [string, Tonality, Pattern][] = [
      ['A', Tonality.MINOR, Pattern.Pentatonic],
      ['E♭', Tonality.MAJOR, Pattern.Diatonic],
      ['F♯', Tonality.MINOR, Pattern.Seventh],
      ['G', Tonality.MAJOR, Pattern.Triad],
    ]
    for (const [key, tonality, pattern] of cases) {
      const fb = scaleBoard(key, tonality, pattern)
      for (const s of boardPreview(fb)) {
        for (let fret = 0; fret <= 12; fret++) {
          const position = fret === 0 ? 12 : fret
          const expected = (fb.currentHighlightNotes as Degree[]).find(d => intervalsFor[d](tonality, key, s.name).includes(position)) ?? null
          expect(s.notes[fret], `${key} ${tonality} ${pattern}, ${s.name} string, fret ${fret}`).toBe(expected)
        }
      }
    }
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/boardPreview.test.ts`
Expected: FAIL, because `@data/boardPreview` can't be resolved.

- [ ] **Step 3: Implement**

`src/lib/music-theory/boardPreview.ts`:

```ts
import { Degree, degreeToNumber, majorKeyToNumber } from '@data/constants';
import type { CurrentStrings, FretboardData } from '@/lib/fretboardData';

export type StringName = keyof CurrentStrings;

export interface PreviewString {
  name: StringName;
  // notes[0] is the open string, notes[n] is fret n
  notes: (Degree | null)[];
}

export const PREVIEW_FRETS = 12;

// Pitch class of each open string (C = 0), high e first like the fretboard
const openStrings: [StringName, number][] = [['e', 4], ['B', 11], ['G', 7], ['D', 2], ['A', 9], ['E', 4]];

const degreeBySemitone: Degree[] = [];
Object.values(Degree).forEach(degree => { degreeBySemitone[degreeToNumber[degree]] = degree; });

// Which degree lights up at each position, honoring the fretboard's visible tones and strings
export const boardPreview = (fretboard: FretboardData, frets = PREVIEW_FRETS): PreviewString[] => {
  const root = majorKeyToNumber[fretboard.currentKey];
  const visible = new Set(fretboard.currentHighlightNotes);

  return openStrings.map(([name, open]) => ({
    name,
    notes: Array.from({ length: frets + 1 }, (_, fret) => {
      if (!fretboard.currentStrings[name]) return null;
      const degree = degreeBySemitone[(((open + fret - root) % 12) + 12) % 12];
      return visible.has(degree) ? degree : null;
    }),
  }));
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/boardPreview.test.ts`
Expected: PASS (6 tests). If "agrees with the notes MyString lights" fails, print the failing message's string and fret, and check that position against the interval table in `intervals.ts` before changing the math.

- [ ] **Step 5: Commit**

```bash
git add src/lib/music-theory/boardPreview.ts tests/unit/boardPreview.test.ts
git commit -m "feat: compute fretboard preview notes for library cards"
```

---

### Task 2: Library view helpers

**Files:**
- Create: `src/lib/libraryView.ts`
- Test: `tests/unit/libraryView.test.ts`

**Interfaces:**
- Consumes: `Setup` from `@data/constants`; `patternSymbol`, `patternSubtitle` from `@data/patternNames`; `FretboardData`; `LibraryCard` from `@services/adapters/localStorageAdapter`.
- Produces:
  - `type LibraryFilter = 'all' | Setup`
  - `type LibrarySort = 'newest' | 'oldest' | 'name'`
  - `fretboardLabel(fretboard: FretboardData, setup: Setup): string`, the same symbol the stack chips use (for example `Am Pentatonic`, `Gmaj7`, `E5`)
  - `normalizeAccidentals(text: string): string`
  - `matchesQuery(card: LibraryCard, query: string): boolean`
  - `filterCounts(cards: LibraryCard[]): Record<LibraryFilter, number>`
  - `visibleCards(cards: LibraryCard[], filter: LibraryFilter, query: string, sort: LibrarySort): LibraryCard[]`, which returns a new array
  - `savedDate(createdAt: number, now?: number): string`
  - `cardMeta(card: LibraryCard, now?: number): string`

- [ ] **Step 1: Write the failing tests**

`tests/unit/libraryView.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Pattern, Setup, Tonality } from '@data/constants'
import { defaultDataFor, FretboardData } from '@/lib/fretboardData'
import type { LibraryCard } from '@services/adapters/localStorageAdapter'
import { cardMeta, filterCounts, fretboardLabel, matchesQuery, normalizeAccidentals, savedDate, visibleCards } from '@/lib/libraryView'

const fb = (setup: Setup, key: string, tonality: Tonality, pattern: Pattern): FretboardData =>
  ({ ...defaultDataFor(setup), currentKey: key, currentTonality: tonality, currentPattern: pattern })

let nextId = 0
const card = (name: string, setup: Setup, fretboards: FretboardData[], createdAt = 0): LibraryCard =>
  ({ id: `id-${nextId++}`, name, setup, fretboards, createdAt })

const bluesInA = card('Blues jam', Setup.Scale, [fb(Setup.Scale, 'A', Tonality.MINOR, Pattern.Blue)], 3)
const flatMinor = card('Dark stuff', Setup.Scale, [fb(Setup.Scale, 'B♭', Tonality.MINOR, Pattern.Pentatonic)], 1)
const sharpChords = card('Sevenths', Setup.Chord, [fb(Setup.Chord, 'F♯', Tonality.MAJOR, Pattern.Seventh)], 2)
const all = [bluesInA, flatMinor, sharpChords]

describe('fretboardLabel', () => {
  it('uses the stack chip symbol', () => {
    expect(fretboardLabel(fb(Setup.Scale, 'A', Tonality.MINOR, Pattern.Pentatonic), Setup.Scale)).toBe('Am Pentatonic')
    expect(fretboardLabel(fb(Setup.Chord, 'G', Tonality.MAJOR, Pattern.Seventh), Setup.Chord)).toBe('Gmaj7')
    expect(fretboardLabel(fb(Setup.Chord, 'E', Tonality.MAJOR, Pattern.Power), Setup.Chord)).toBe('E5')
  })
})

describe('normalizeAccidentals', () => {
  it('turns typed accidentals into the symbols the app uses', () => {
    expect(normalizeAccidentals('Bb')).toBe('B♭')
    expect(normalizeAccidentals('bbm')).toBe('b♭m')
    expect(normalizeAccidentals('F#')).toBe('F♯')
    expect(normalizeAccidentals('Eb major')).toBe('E♭ major')
  })

  it('leaves words alone', () => {
    expect(normalizeAccidentals('Blues')).toBe('Blues')
    expect(normalizeAccidentals('dub')).toBe('dub')
  })
})

describe('matchesQuery', () => {
  it('matches the name, key, quality and pattern, ignoring case', () => {
    expect(matchesQuery(bluesInA, 'blues JAM')).toBe(true)
    expect(matchesQuery(bluesInA, 'minor')).toBe(true)
    expect(matchesQuery(bluesInA, 'blues scale')).toBe(true)
    expect(matchesQuery(bluesInA, 'major')).toBe(false)
  })

  it('matches typed accidentals', () => {
    expect(matchesQuery(flatMinor, 'Bb')).toBe(true)
    expect(matchesQuery(flatMinor, 'bbm')).toBe(true)
    expect(matchesQuery(sharpChords, 'F#')).toBe(true)
    expect(matchesQuery(sharpChords, 'Bb')).toBe(false)
  })

  it('matches everything for a blank query', () => {
    expect(matchesQuery(bluesInA, '   ')).toBe(true)
  })
})

describe('visibleCards', () => {
  it('filters by type', () => {
    expect(visibleCards(all, Setup.Chord, '', 'newest')).toEqual([sharpChords])
    expect(visibleCards(all, 'all', '', 'newest')).toHaveLength(3)
  })

  it('sorts newest, oldest, and by name', () => {
    expect(visibleCards(all, 'all', '', 'newest')).toEqual([bluesInA, sharpChords, flatMinor])
    expect(visibleCards(all, 'all', '', 'oldest')).toEqual([flatMinor, sharpChords, bluesInA])
    expect(visibleCards(all, 'all', '', 'name')).toEqual([bluesInA, flatMinor, sharpChords])
  })

  it('sorts names naturally and ignores case', () => {
    const named = ['Card 10', 'card 3', 'Card 2'].map(name => card(name, Setup.Scale, []))
    expect(visibleCards(named, 'all', '', 'name').map(c => c.name)).toEqual(['Card 2', 'card 3', 'Card 10'])
  })

  it('does not reorder the array it was given', () => {
    const input = [...all]
    visibleCards(input, 'all', '', 'name')
    expect(input).toEqual(all)
  })
})

describe('filterCounts', () => {
  it('counts each type', () => {
    expect(filterCounts(all)).toEqual({ all: 3, [Setup.Scale]: 2, [Setup.Chord]: 1 })
  })
})

describe('savedDate and cardMeta', () => {
  const now = new Date(2026, 9, 4).getTime()

  it('drops the year for this year and keeps it otherwise', () => {
    expect(savedDate(new Date(2026, 9, 2).getTime(), now)).toBe('Oct 2')
    expect(savedDate(new Date(2025, 2, 3).getTime(), now)).toBe('Mar 3, 2025')
  })

  it('counts fretboards, including a card with none', () => {
    const at = new Date(2026, 8, 28).getTime()
    expect(cardMeta(card('One', Setup.Scale, [fb(Setup.Scale, 'C', Tonality.MAJOR, Pattern.Pentatonic)], at), now)).toBe('1 fretboard · Saved Sep 28')
    expect(cardMeta(card('Two', Setup.Scale, [bluesInA.fretboards[0], flatMinor.fretboards[0]], at), now)).toBe('2 fretboards · Saved Sep 28')
    expect(cardMeta(card('None', Setup.Scale, [], at), now)).toBe('0 fretboards · Saved Sep 28')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tests/unit/libraryView.test.ts`
Expected: FAIL, because `@/lib/libraryView` can't be resolved.

- [ ] **Step 3: Implement**

`src/lib/libraryView.ts`:

```ts
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
```

`.filter()` already returns a new array, so the `.sort()` after it never reorders the caller's array.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/libraryView.test.ts`
Expected: PASS. If `patternSubtitle` text differs (for example the blues subtitle), check `scaleFullNames` in `patternNames.ts` and fix the test's query, not the helper.

- [ ] **Step 5: Run the full suite and commit**

Run: `npm test`
Expected: all suites pass.

```bash
git add src/lib/libraryView.ts tests/unit/libraryView.test.ts
git commit -m "feat: add library search, filter, sort and label helpers"
```

**Phase 1 stops here.** Report test results and wait.

---

### Task 3: Theme tokens, degree classes and the preview component

**Files:**
- Modify: `src/assets/scss/main.scss` (`.dark-theme` and `.light-theme` blocks)
- Create: `src/lib/degreeClasses.ts`
- Modify: `src/components/PatternSummary.vue:18-31`
- Create: `src/components/FretboardPreview.vue`

**Interfaces:**
- Consumes: `boardPreview`, `PREVIEW_FRETS` (Task 1).
- Produces:
  - `degreeClasses: Record<Degree, string>` from `@/lib/degreeClasses`
  - `<FretboardPreview :fretboard="FretboardData" :label="string" />`
  - CSS variables `--muted-text-color`, `--accent-soft-color`, `--accent-strong-text-color`, `--accent-contrast-color`, `--danger-color`

- [ ] **Step 1: Add the theme tokens**

`--muted-text-color` already exists in both themes (added for the nav restyle). In `src/assets/scss/main.scss`, add these as the last lines of `.dark-theme`:

```scss
  --accent-soft-color: rgba(250, 174, 37, 0.14);
  --accent-strong-text-color: #{$yellow};
  --accent-contrast-color: #191a1b;
  --danger-color: #{$red-dark};
```

and these as the last lines of `.light-theme`:

```scss
  --accent-soft-color: rgba(160, 98, 10, 0.12);
  --accent-strong-text-color: #7f4d06;
  --accent-contrast-color: #ffffff;
  --danger-color: #b4232f;
```

- [ ] **Step 2: Move the degree class map**

Create `src/lib/degreeClasses.ts`:

```ts
import { Degree } from '@data/constants';

// CSS class per degree; the colors are $degree-colors in notes-input.scss
export const degreeClasses: Record<Degree, string> = {
  [Degree.roots]: 'root-note',
  [Degree.minorSeconds]: 'minor-second',
  [Degree.seconds]: 'second',
  [Degree.minorThirds]: 'minor-third',
  [Degree.thirds]: 'third',
  [Degree.fourths]: 'fourth',
  [Degree.tritones]: 'tritone',
  [Degree.fifths]: 'fifth',
  [Degree.minorSixths]: 'minor-sixth',
  [Degree.sixths]: 'sixth',
  [Degree.minorSevenths]: 'minor-seventh',
  [Degree.sevenths]: 'seventh',
};
```

In `src/components/PatternSummary.vue`, delete the local `const degreeClasses ... = { ... };` block (lines 18–31) and add the import below the other imports:

```ts
import { degreeClasses } from '@/lib/degreeClasses';
```

- [ ] **Step 3: Create the preview component**

`src/components/FretboardPreview.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { Degree } from '@data/constants';
import { boardPreview, PREVIEW_FRETS } from '@data/boardPreview';
import { degreeClasses } from '@/lib/degreeClasses';
import type { FretboardData } from '@/lib/fretboardData';

const props = defineProps<{
    fretboard: FretboardData,
    label: string
}>();

const strings = computed(() => boardPreview(props.fretboard));

const dotClass = (degree: Degree | null) => (degree ? degreeClasses[degree] : '');

// Inlay dots under the neck: one at 3, 5, 7, 9; two at 12
const inlayCount = (fret: number) => (fret === 12 ? 2 : [3, 5, 7, 9].includes(fret) ? 1 : 0);
</script>

<template>
    <div class="preview" role="img" :aria-label="`Preview of ${label}, frets 0 to ${PREVIEW_FRETS}`">
        <div v-for="string in strings" :key="string.name" class="preview-string" :class="`string-${string.name}`">
            <div class="open">
                <span v-if="string.notes[0]" class="degree-dot dot open-dot" :class="dotClass(string.notes[0])"></span>
            </div>
            <div class="frets">
                <div v-for="fret in PREVIEW_FRETS" :key="fret" class="fret">
                    <span v-if="string.notes[fret]" class="degree-dot dot" :class="dotClass(string.notes[fret])"></span>
                </div>
            </div>
        </div>
        <div class="inlays" aria-hidden="true">
            <div class="open"></div>
            <div class="inlay-frets">
                <div v-for="fret in PREVIEW_FRETS" :key="fret" class="inlay">
                    <span v-for="n in inlayCount(fret)" :key="n" class="inlay-dot"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview {
    padding: 10px 10px 4px;
    border-radius: 10px;
    border: 1px solid var(--card-border-color);
}

.preview-string {
    position: relative;
    display: flex;
    height: 13px;

    // The string itself, drawn over the neck and under the dots
    &::after {
        content: "";
        position: absolute;
        left: 16px;
        right: 0;
        top: 6px;
        height: 1px;
        background-color: var(--string-color);
        z-index: 1;
    }
}

.string-G::after,
.string-D::after {
    height: 1.5px;
}

.string-A::after,
.string-E::after {
    height: 2px;
}

.open {
    flex: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.frets {
    flex: 1;
    display: flex;
    background-color: var(--neck-background-color);
    border-left: 3px solid var(--nut-color);
}

.fret {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--fret-wire-color);
}

.dot {
    position: relative;
    z-index: 2;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    font-size: 0;
}

.open-dot {
    width: 7px;
    height: 7px;
}

.inlays {
    display: flex;
    height: 12px;
    align-items: center;
}

.inlay-frets {
    flex: 1;
    display: flex;
    padding-left: 3px;
}

.inlay {
    flex: 1 1 0;
    display: flex;
    justify-content: center;
    gap: 3px;
}

.inlay-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--muted-text-color);
    font-size: 0;
}
</style>
```

- [ ] **Step 4: Verify**

Run: `npm test`, then `npm run build`
Expected: tests pass; the build passes with no vue-tsc errors. PatternSummary still compiles with the imported map.

- [ ] **Step 5: Commit**

```bash
git add src/assets/scss/main.scss src/lib/degreeClasses.ts src/components/PatternSummary.vue src/components/FretboardPreview.vue
git commit -m "feat: add fretboard preview component and library theme tokens"
```

---

### Task 4: Library card component

**Files:**
- Create: `src/components/LibraryCardItem.vue`

**Interfaces:**
- Consumes: `fretboardLabel`, `cardMeta` (Task 2); `FretboardPreview` (Task 3); `LibraryCard` from `@stores/useLibraryStore`.
- Produces: `<LibraryCardItem :card :is-active :start-renaming @open @rename="(name: string)" @delete />`. The component never touches the store; the page does.

- [ ] **Step 1: Create the component**

`src/components/LibraryCardItem.vue`:

```vue
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { Setup } from '@data/constants';
import FretboardPreview from '@components/FretboardPreview.vue';
import { cardMeta, fretboardLabel } from '@/lib/libraryView';
import type { FretboardData } from '@/lib/fretboardData';
import type { LibraryCard } from '@stores/useLibraryStore';

const props = defineProps<{
    card: LibraryCard,
    isActive: boolean,
    startRenaming?: boolean
}>();

const emit = defineEmits<{
    (e: 'open'): void,
    (e: 'rename', name: string): void,
    (e: 'delete'): void
}>();

const selected = ref(0);
const isRenaming = ref(false);
const isConfirmingDelete = ref(false);
const draft = ref('');
const nameInput = ref<HTMLInputElement | null>(null);
const cancelDeleteButton = ref<HTMLButtonElement | null>(null);

// Clamped because the active card's stack can shrink while this page is open
const selectedFretboard = computed<FretboardData | undefined>(() =>
    props.card.fretboards[Math.min(selected.value, props.card.fretboards.length - 1)]
);

const chips = computed(() => props.card.fretboards.map((fretboard, index) => ({
    index,
    label: fretboardLabel(fretboard, props.card.setup),
    isSelected: fretboard === selectedFretboard.value,
})));

const meta = computed(() => cardMeta(props.card));

const startRename = async () => {
    draft.value = props.card.name;
    isConfirmingDelete.value = false;
    isRenaming.value = true;
    await nextTick();
    nameInput.value?.select();
};

const saveRename = () => {
    if (!isRenaming.value) return;
    isRenaming.value = false;
    const name = draft.value.trim();
    if (name && name !== props.card.name) emit('rename', name);
};

const cancelRename = () => {
    isRenaming.value = false;
};

const askDelete = async () => {
    isRenaming.value = false;
    isConfirmingDelete.value = true;
    await nextTick();
    cancelDeleteButton.value?.focus();
};

const cancelDelete = () => {
    isConfirmingDelete.value = false;
};

onMounted(() => {
    if (props.startRenaming) startRename();
});
</script>

<template>
    <article class="library-card">
        <div class="card-top">
            <span class="badge" :class="card.setup === Setup.Scale ? 'badge-scale' : 'badge-chord'">{{ card.setup }}</span>
            <span v-if="isActive" class="active-label" title="This card updates itself when you leave its page">
                <span class="active-dot"></span>Active · auto-saves
            </span>
        </div>

        <div>
            <h2 v-if="!isRenaming" class="card-name">{{ card.name }}</h2>
            <div v-else class="rename-row">
                <label class="visually-hidden" :for="`rename-${card.id}`">Card name</label>
                <input
                    :id="`rename-${card.id}`"
                    ref="nameInput"
                    v-model="draft"
                    class="rename-input"
                    maxlength="80"
                    @keydown.enter.prevent="saveRename"
                    @keydown.esc.prevent="cancelRename"
                />
                <button type="button" class="btn-primary" @click="saveRename">Save</button>
            </div>
            <p class="card-meta">{{ meta }}</p>
        </div>

        <FretboardPreview v-if="selectedFretboard" :fretboard="selectedFretboard" :label="fretboardLabel(selectedFretboard, card.setup)"/>

        <div v-if="chips.length > 1" class="chips" role="group" aria-label="Fretboards in this card">
            <button
                v-for="chip in chips"
                :key="chip.index"
                type="button"
                class="chip"
                :class="{ 'chip-selected': chip.isSelected }"
                :aria-pressed="chip.isSelected"
                @click="selected = chip.index"
            >{{ chip.label }}</button>
        </div>
        <div v-else-if="chips.length === 1" class="chips">
            <span class="chip chip-static">{{ chips[0].label }}</span>
        </div>

        <div class="card-footer">
            <div v-if="!isConfirmingDelete" class="footer-row">
                <button type="button" class="btn-open" @click="emit('open')">
                    Open in {{ card.setup }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
                <span class="spacer"></span>
                <button type="button" class="btn-icon" :aria-label="`Rename ${card.name}`" @click="startRename">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>
                </button>
                <button type="button" class="btn-icon" :aria-label="`Delete ${card.name}`" @click="askDelete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                </button>
            </div>
            <div v-else class="footer-row" @keydown.esc="cancelDelete">
                <span class="confirm-text">Delete this card?</span>
                <button ref="cancelDeleteButton" type="button" class="btn-secondary" @click="cancelDelete">Cancel</button>
                <button type="button" class="btn-danger" @click="emit('delete')">Delete</button>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">
.library-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border-radius: 14px;
    background-color: var(--card-background-color);
    border: 1px solid var(--card-border-color);
    box-shadow: var(--card-shadow);
    text-align: left;
    transition: border-color 0.15s ease;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
}

.badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid var(--accent-text-color);
}

.badge-scale {
    background-color: var(--accent-text-color);
    color: var(--accent-contrast-color);
}

.badge-chord {
    color: var(--accent-strong-text-color);
}

.active-label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--muted-text-color);
}

.active-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: $green;
}

.card-name {
    margin: 0;
    font-size: 18px;
    line-height: 1.3;
    font-weight: 650;
    overflow-wrap: anywhere;
}

.card-meta {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--muted-text-color);
}

.rename-row {
    display: flex;
    gap: 8px;
}

.rename-input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--accent-text-color);
    background-color: var(--card-background-color);
    color: inherit;
    font-weight: 600;
    outline: none;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.chip {
    min-height: 32px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--card-border-color);
    background-color: transparent;
    color: var(--muted-text-color);
    font-size: 12px;
    font-weight: 600;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.chip-selected {
    background-color: var(--accent-soft-color);
    border-color: var(--accent-text-color);
    color: var(--accent-strong-text-color);
}

.chip-static {
    display: inline-flex;
    align-items: center;

    &:hover {
        border-color: var(--card-border-color);
    }
}

.card-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--card-border-color);
}

.footer-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.spacer {
    flex: 1;
}

.confirm-text {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
}

%btn {
    height: 44px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
}

.btn-open {
    @extend %btn;
    background-color: var(--accent-soft-color);
    color: var(--accent-strong-text-color);

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.btn-primary {
    @extend %btn;
    background-color: var(--accent-text-color);
    color: var(--accent-contrast-color);

    &:hover {
        border-color: transparent;
    }
}

.btn-secondary {
    @extend %btn;
    background-color: transparent;
    border-color: var(--card-border-color);
    color: inherit;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.btn-danger {
    @extend %btn;
    background-color: var(--danger-color);
    color: #ffffff;

    &:hover {
        border-color: transparent;
    }
}

.btn-icon {
    @extend %btn;
    width: 44px;
    padding: 0;
    background-color: transparent;
    color: var(--muted-text-color);

    &:hover {
        background-color: var(--option-background-color);
        border-color: transparent;
        color: inherit;
    }
}

.library-card button:focus-visible,
.rename-input:focus-visible {
    outline: 2px solid var(--accent-text-color);
    outline-offset: 2px;
}
</style>
```

Notes for the implementer:
- `visually-hidden` is Bootstrap's class, which is already loaded globally.
- With one fretboard, the chip is a plain label (`chip-static`), because there is nothing to switch. With zero fretboards, there is no preview and no chips (Review Focus 1).
- There's no blur-to-save on rename: the Save button would fire after blur, and Esc removes the input. Enter or Save saves, and Esc cancels.
- `aria-pressed` is bound to a plain boolean: Vue 3 renders `false` as `"false"` (it only removes attributes for `null` or `undefined`), and vue-tsc rejects a plain `string` there.
- Compare `card.setup` with `Setup.Scale`, not the string `'Scale'`: vue-tsc rejects comparing a string enum to a literal.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: passes. The component isn't mounted anywhere yet; vue-tsc checks the types.

- [ ] **Step 3: Commit**

```bash
git add src/components/LibraryCardItem.vue
git commit -m "feat: add library card with preview, rename and delete confirm"
```

**Phase 2 stops here.** Report build status and wait.

---

### Task 5: Library page and layout wiring

**Files:**
- Rewrite: `src/components/LibraryPage.vue`
- Modify: `src/layout/DefaultLayout.vue:183`

**Interfaces:**
- Consumes: `visibleCards`, `filterCounts`, `LibraryFilter`, `LibrarySort` (Task 2); `LibraryCardItem` (Task 4); `useLibraryStore` (`cards`, `activeCardId`, `isLoaded`, `loadCards`, `createCard`, `renameCard`, `deleteCard`); `View` from `@/lib/pageRoute`.
- Produces: `LibraryPage` emits `load-card(card: LibraryCard)` (unchanged) and `navigate(view: View)` (new).

- [ ] **Step 1: Replace `src/components/LibraryPage.vue`**

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Setup } from '@data/constants'
import { useLibraryStore } from '@stores/useLibraryStore'
import type { LibraryCard } from '@stores/useLibraryStore'
import LibraryCardItem from '@components/LibraryCardItem.vue'
import { filterCounts, visibleCards } from '@/lib/libraryView'
import type { LibraryFilter, LibrarySort } from '@/lib/libraryView'
import type { View } from '@/lib/pageRoute'

const emit = defineEmits<{
  (e: 'load-card', card: LibraryCard): void
  (e: 'navigate', view: View): void
}>()

const libraryStore = useLibraryStore()

const query = ref('')
const filter = ref<LibraryFilter>('all')
const sort = ref<LibrarySort>('newest')
// A card made with "New card" opens in rename mode
const newCardId = ref<string | null>(null)

const filters: { value: LibraryFilter, label: string }[] = [
  { value: 'all', label: 'All' },
  { value: Setup.Scale, label: 'Scales' },
  { value: Setup.Chord, label: 'Chords' },
]

const cards = computed(() => visibleCards(libraryStore.cards, filter.value, query.value, sort.value))
const counts = computed(() => filterCounts(libraryStore.cards))
const isEmpty = computed(() => libraryStore.isLoaded && libraryStore.cards.length === 0)
const hasNoResults = computed(() => !isEmpty.value && libraryStore.cards.length > 0 && cards.value.length === 0)

const summary = computed(() => {
  const count = libraryStore.cards.length
  return `${count} saved ${count === 1 ? 'card' : 'cards'}`
})

const noResultsText = computed(() =>
  query.value.trim() ? `No cards match "${query.value.trim()}"` : 'No cards of this type yet'
)

const clearFilters = () => {
  query.value = ''
  filter.value = 'all'
}

const handleCreate = async () => {
  const card = await libraryStore.createCard(`Card ${libraryStore.cards.length + 1}`)
  if (!card) return
  // Make sure the new card is on screen
  clearFilters()
  newCardId.value = card.id
}

const handleRename = async (id: string, name: string) => {
  await libraryStore.renameCard(id, name)
}

const handleDelete = async (id: string) => {
  await libraryStore.deleteCard(id)
}

onMounted(async () => {
  await libraryStore.loadCards()
})
</script>

<template>
  <div class="library-page">
    <div class="library-header">
      <div>
        <h1 class="library-title">Library</h1>
        <p class="library-summary">{{ summary }}</p>
      </div>
      <button type="button" class="btn-new" @click="handleCreate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        New card
      </button>
    </div>

    <div v-if="!isEmpty" class="toolbar">
      <label class="search">
        <span class="visually-hidden">Search the library</span>
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input v-model="query" type="search" class="search-input" placeholder="Search by name, key or pattern"/>
      </label>
      <div class="filter-group" role="group" aria-label="Filter by type">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="filter-button"
          :class="{ 'filter-selected': filter === option.value }"
          :aria-pressed="filter === option.value"
          @click="filter = option.value"
        >
          {{ option.label }}<span class="filter-count">{{ counts[option.value] }}</span>
        </button>
      </div>
      <label class="sort">
        Sort
        <select v-model="sort" class="sort-select">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>

    <div v-if="cards.length" class="card-grid">
      <LibraryCardItem
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :is-active="card.id === libraryStore.activeCardId"
        :start-renaming="card.id === newCardId"
        @open="emit('load-card', card)"
        @rename="name => handleRename(card.id, name)"
        @delete="handleDelete(card.id)"
      />
    </div>

    <div v-if="hasNoResults" class="no-results">
      <p class="no-results-text">{{ noResultsText }}</p>
      <button type="button" class="btn-secondary" @click="clearFilters">Clear search and filters</button>
    </div>

    <section v-if="isEmpty" class="empty-state">
      <div class="empty-neck" aria-hidden="true">
        <div v-for="fret in 6" :key="fret" class="empty-fret">
          <span v-if="fret === 2" class="empty-dot"></span>
        </div>
      </div>
      <div class="empty-copy">
        <h2 class="empty-title">Save a stack to see it here</h2>
        <p class="empty-text">Build fretboards on the Scale or Chord page, then use Save to Library. Each card keeps its whole stack, ready to reopen.</p>
      </div>
      <div class="empty-actions">
        <button type="button" class="btn-new" @click="emit('navigate', 'scale')">Go to Scale</button>
        <button type="button" class="btn-secondary" @click="emit('navigate', 'chord')">Go to Chord</button>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.library-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
}

.library-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.library-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 700;
}

.library-summary {
  margin: 6px 0 0;
  color: var(--muted-text-color);
}

%btn {
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-new {
  @extend %btn;
  background-color: var(--accent-text-color);
  color: var(--accent-contrast-color);

  &:hover {
    border-color: transparent;
    filter: brightness(1.08);
  }
}

.btn-secondary {
  @extend %btn;
  background-color: var(--card-background-color);
  border-color: var(--card-border-color);
  color: inherit;

  &:hover {
    border-color: var(--accent-text-color);
  }
}

.toolbar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search {
  position: relative;
  flex: 1 1 280px;
  max-width: 420px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--muted-text-color);
}

.search-input,
.sort-select {
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--card-border-color);
  background-color: var(--card-background-color);
  color: inherit;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 0 14px 0 40px;
  box-sizing: border-box;
}

.sort-select {
  padding: 0 12px;
}

.filter-group {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 12px;
  background-color: var(--option-background-color);
}

.filter-button {
  height: 40px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background-color: transparent;
  color: var(--muted-text-color);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    border-color: transparent;
    color: inherit;
  }
}

.filter-selected {
  background-color: var(--card-background-color);
  color: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.filter-count {
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-text-color);
}

.sort {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted-text-color);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 20px;
}

.no-results,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 64px 16px;
  border: 1px dashed var(--card-border-color);
  border-radius: 14px;
  text-align: center;
}

.no-results-text {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.empty-state {
  background-color: var(--card-background-color);
}

.empty-neck {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  width: 200px;
  height: 72px;
  background-color: var(--neck-background-color);
  background-image: repeating-linear-gradient(to bottom, var(--string-color) 0, var(--string-color) 1px, transparent 1px, transparent 14px);
  background-position: 0 6px;
  border-left: 3px solid var(--nut-color);
}

.empty-fret {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--fret-wire-color);
}

.empty-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1.5px dashed var(--accent-text-color);
}

.empty-copy {
  max-width: 440px;
}

.empty-title {
  margin: 0;
  font-size: 20px;
  font-weight: 650;
}

.empty-text {
  margin: 8px 0 0;
  color: var(--muted-text-color);
}

.empty-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.library-page button:focus-visible,
.search-input:focus-visible,
.sort-select:focus-visible {
  outline: 2px solid var(--accent-text-color);
  outline-offset: 2px;
}

@media (max-width: $phone) {
  .library-page {
    padding: 1.25rem 1rem;
  }

  .library-title {
    font-size: 26px;
  }

  .search {
    max-width: none;
    flex-basis: 100%;
  }

  .filter-group {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filter-button {
    justify-content: center;
  }

  .sort {
    margin-left: 0;
  }
}
</style>
```

- [ ] **Step 2: Wire `navigate` in the layout**

In `src/layout/DefaultLayout.vue`, change line 183 from

```vue
<LibraryPage v-if="currentView === 'library'" :key="`library-${authStore.sessionVersion}`" @load-card="onLoadCard"/>
```

to

```vue
<LibraryPage v-if="currentView === 'library'" :key="`library-${authStore.sessionVersion}`" @load-card="onLoadCard" @navigate="switchView"/>
```

- [ ] **Step 3: Verify**

Run: `npm test`, then `npm run build`
Expected: both pass. The page no longer imports `Done.vue`, `Edit.vue` or `Trash.vue`. Leave those files alone (deleting them is out of scope) and mention it in the phase report.

- [ ] **Step 4: Commit**

```bash
git add src/components/LibraryPage.vue src/layout/DefaultLayout.vue
git commit -m "feat: redesign the library page with search, filters and card previews"
```

---

### Task 6: Docs and final verification

**Files:**
- Modify: `CLAUDE.md` (Component Hierarchy)

- [ ] **Step 1: Update the hierarchy**

In `CLAUDE.md`, replace

```
└── LibraryPage.vue (saved fretboard stacks; opening a card loads it into its Scale/Chord page)
```

with

```
└── LibraryPage.vue (saved fretboard stacks: search, Scales/Chords filter, sort; opening a card loads it into its Scale/Chord page)
    └── LibraryCardItem.vue (badge, rename, delete confirm, one chip per fretboard)
        └── FretboardPreview.vue (frets 0–12 from `boardPreview()` in `@data/boardPreview`)
```

Under **Data Layer**, add:

```
- **`boardPreview.ts`** — Lit degree per string for frets 0–12 of one fretboard (visible tones and strings only). Used by the Library card preview
```

- [ ] **Step 2: Full verification**

Run: `npm test` and `npm run build`
Expected: both pass. Paste the summary lines into the phase report.

- [ ] **Step 3: Manual checklist for the user**

Per the user's preference, Claude does not drive a browser unless asked. Give the user this list to check with `npm run dev`:

1. With cards saved, each card shows a badge, name, meta, preview and chips. Clicking a chip changes the preview.
2. Rename: Enter saves, Esc cancels, and a blank name keeps the old one.
3. Delete asks first. Cancel keeps the card; Delete removes it.
4. Search for `Bb`, `minor` and part of a name. The filter counts are right. Each sort order works.
5. With no cards, the empty state shows, and Go to Scale / Go to Chord switch pages.
6. Phone width (portrait and landscape): the toolbar wraps, the cards fill the width with no sideways scroll, and buttons are easy to tap.
7. Light theme: text and buttons are readable.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe the library page components"
```

**Phase 3 stops here.** Report results and hand over to superpowers:finishing-a-development-branch.
