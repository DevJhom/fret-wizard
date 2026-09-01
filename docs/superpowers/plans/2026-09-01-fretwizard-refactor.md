# FretWizard Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the 12-fold copy-paste that runs through the music-theory layer and its consumers into table-driven code, behind a test safety net, then decompose `MainPage.vue` and clean up dead configuration.

**Architecture:** The app repeats the same twelve musical degrees (root, minor second, … seventh) as twelve hand-written constants, twelve getter functions, twelve computed refs, twelve class bindings and twelve template rows across four files. Every one of those lists is an independent opportunity to make a typo — and two typos are already in the codebase. The fix is one ordered `Degree` table in `constants.ts` that every other layer iterates over. Everything else in this plan (CAGED, sidebar, storage adapters, `MainPage.vue`) is the same shape of problem at smaller scale.

**Tech Stack:** Vue 3 (`<script setup>`, Composition API), TypeScript 5, Vite 5, Pinia 2, Bootstrap 5, SCSS, SortableJS. Vitest + @vue/test-utils + jsdom are added by Task 1.

**Spec:** None — this plan is derived from a full read of `src/` on 2026-09-01. The findings that justify each task are recorded in "Findings" below, which serves as the spec.

## Global Constraints

- Node/Vite project; `node_modules` is **not currently installed**. Run `npm install` before anything else.
- Path aliases are mandatory — `@/`, `@components/`, `@data/` (→ `src/lib/music-theory/`), `@stores/`, `@services/`, `@assets/`, `@scss/`, `@images/`. Never use relative paths across directories. Aliases live in **both** `vite.config.ts` and `tsconfig.json` and must stay in sync.
- All components use `<script setup lang="ts">`. Options API is forbidden.
- SCSS variables from `src/assets/scss/variables.scss` are auto-injected by Vite. Never `@import` them in a component.
- `npm run build` (= `vue-tsc && vite build`) must pass at the end of every task.
- `tsconfig.json` currently has `"strict": false` and `"noUnusedLocals": false`. Do **not** flip these until Task 9 — earlier tasks will not compile under strict mode against untouched files.
- Deployment base path is `/fret-wizard/`. Do not change `base` in `vite.config.ts`.
- Commit after every task. Branch: work continues on `library` (current branch) unless told otherwise.
- Behaviour-preserving unless a task explicitly says otherwise. Two tasks (4 and 6) intentionally change behaviour to fix confirmed bugs; both say so in their heading.

---

## Findings

Ranked by value. Line references are from the state of the repo at commit `bc3ce9b`.

| # | Where | Problem | Task |
|---|-------|---------|------|
| 1 | `MyString.vue` (169 lines) | 12 interval computeds + 12 note-name computeds + 24 class-binding entries + 12 `<span>` rows, all the same shape. `isNoteActive()` is invoked ~26× per fret × 24 frets × 6 strings on every render, and each call re-runs `isCAGED()`. | 4 |
| 2 | `MyString.vue:53` | **Confirmed bug.** `seventhNoteName` calls `getNoteName(minorSeconds…)` — pasted from the line above without editing the argument. Major sevenths display the minor-seventh name (in C: `A♯` instead of `B`). | 4 |
| 3 | `MyString.vue:75` | **Confirmed bug.** `isNoteActive` returns `… && isStringActive` — the `ComputedRef` object, not `isStringActive.value`. A ref object is always truthy, so the sidebar's "Strings (EADGBe)" checkboxes have never hidden anything. | 4 |
| 4 | `intervals.ts:117-175` | 12 exported getters that are byte-identical apart from which table they index. All 12 take a `tonality` parameter that is never read. | 3 |
| 5 | `intervals.ts:216-229` | `constructBasePattern` uses `degree == X ? xs.forEach(…) : {}` twelve times — a ternary used as a statement, with `{}` as a no-op branch. | 3 |
| 6 | `intervals.ts:246-264` | `getScale` rotates six arrays by `pop()`/`unshift()` inside a loop that runs up to 11 times — 6 lines of identical code per string, repeated. | 3 |
| 7 | `CAGED.ts:12-53` | The `CAGED` table maps all six strings to the *same* array for every shape — 30 entries carrying 5 distinct values. `isCAGED`'s `stringName` parameter therefore cannot affect the result. | 5 |
| 8 | `CAGED.ts:55-77` | `isCAGED` is declared `: boolean` but has no `return` on the fall-through path, so it returns `undefined`. Only compiles because `strict` is off. | 5 |
| 9 | `CAGED.ts:102-144` | `isCAGEDNameHere` and `GetCAGEDName` are the same 20-line function; the first is the boolean of the second. `MyFretboard.vue:178-179` calls both per fret. `GetCAGEDName` also violates the camelCase convention. | 5 |
| 10 | `SideBar.vue:76-140` | 5 hand-written CAGED checkboxes + 6 hand-written string checkboxes, identical apart from one identifier. Plus a 12-line class object at lines 48-61. | 6 |
| 11 | `SideBar.vue:11-15` | `toggleSidebar()` does `document.getElementById("sidebar").classList.toggle()` *and* flips reactive `isSidebarActive` — two sources of truth for one piece of state, in a framework built to avoid exactly that. | 6 |
| 12 | `customizerService.ts` | 7 hand-written `USE_API ? api.x() : local.x()` ternaries, every one returning a `Promise<T> \| T` union that forces callers to `await` a maybe-promise. `USE_API` is a hardcoded `const`, not configuration. | 7 |
| 13 | `MainPage.vue` (485 lines) | The `{...data, E, A, D, G, B, e}` construction is written out three times (lines 93-101, 111-119, 130-138). `constructFretboardData()` (59-88) duplicates the store's own `currentFretboardData` getter. `updateCustomizers()` (188-200) duplicates the store's `loadFromFretboardData()` — but silently omits `currentSetup` and `currentChordPosition`. | 8 |
| 14 | `MainPage.vue:270` | `:key="fretboard.currentKey"` — the code's own comment says `<!-- fix me -->`. Two fretboards in the same key collide and Vue reuses the wrong DOM. `FretboardData` has no stable id. | 8 |
| 15 | store + `MainPage.vue` | `hasSidebarUpdated` / `hasTonalityUpdated` / `hasReset` are booleans flipped as an ad-hoc event bus, `watch`ed for their side effect. ~14 `@change="patternStore.toggleSidebarStatus()"` handlers exist only to fire it. | 8 |
| 16 | `package.json` | `axios` is a dependency and is imported nowhere (`apiAdapter.ts` uses `fetch`). `scss@0.2.4` is an unrelated abandoned package — `sass` is the real one. `gh-pages` is in `dependencies`, not `devDependencies`. `lodash` is used for `cloneDeep` alone, while `useLibraryStore.ts` already uses native `structuredClone`. | 9 |
| 17 | `package.json` + `database/` | `npm run json-server` serves `database/all-scales.json`, whose shape (`currentScale`/`currentKey`) matches no endpoint `apiAdapter.ts` requests (`/theme`, `/fretboard`, `/fretboards`, `/library-cards`). The script and the file are dead. | 9 |
| 18 | `CLAUDE.md` | Stale: points at `src/components/data/` (moved to `src/lib/music-theory/`), documents a `service.ts` axios client that no longer exists, claims "the app will fail silently if `npm run json-server` is not running" (it will not), and omits `LibraryPage.vue`, `useLibraryStore.ts` and `src/services/adapters/`. | 9 |
| 19 | `chords.ts:12-46` | `getChordPositionIndexes(chord, currentKey)` ignores both parameters and returns `[0, 1, 2]`. `getChordPositions`/`getBarPositions` ignore `chord` entirely, so every chord pattern renders triad shapes. | Out of scope — see Open Questions |

**Start here:** Findings 1-6. That's one thread through `constants.ts` → `intervals.ts` → `MyString.vue`, it removes roughly 200 lines, and it is where both confirmed bugs live.

---

### Task 1: Test harness and characterization tests

The music-theory layer has no tests. Refactoring it without them is guesswork. This task adds Vitest and pins the *current* behaviour of the functions Tasks 2-5 will rewrite, so any accidental change shows up as a failing test.

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Modify: `vite.config.ts` (add `test` block)
- Create: `tests/music-theory/intervals.test.ts`
- Create: `tests/music-theory/noteNames.test.ts`
- Create: `tests/music-theory/CAGED.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest once and exits. Test files import via the `@data/` alias, which Vitest inherits from `vite.config.ts`. A helper `activeFrets(row: boolean[]): number[]` is defined locally in `intervals.test.ts` — it converts the boolean-per-fret array `getScale` returns into the 1-based fret numbers that are set, which is far easier to read in an assertion.

- [ ] **Step 1: Install dependencies**

```bash
npm install
npm install -D vitest@^1.6.0 @vue/test-utils@^2.4.0 jsdom@^24.0.0
```

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block, after `"preview"`, add:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

Add the triple-slash reference as the **first line** of the file, then add a `test` block as a sibling of `css` inside `defineConfig({…})`:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
```

```ts
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
```

- [ ] **Step 4: Write the interval characterization tests**

Create `tests/music-theory/intervals.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Pattern, Tonality } from '@data/constants'
import { getRoots, getThirds, getScale } from '@data/intervals'

/** Boolean-per-fret array -> the 1-based fret numbers that are set. */
const activeFrets = (row: boolean[]): number[] =>
  row.flatMap((isOn, index) => (isOn ? [index + 1] : []))

describe('interval getters', () => {
  it('returns the unshifted table for the key of C', () => {
    expect(getRoots(Tonality.MAJOR, 'C', 'E')).toEqual([-4, 8, 20])
  })

  it('shifts every fret by the key offset', () => {
    expect(getRoots(Tonality.MAJOR, 'D', 'E')).toEqual([-2, 10, 22])
    expect(getRoots(Tonality.MAJOR, 'G', 'E')).toEqual([3, 15, 27])
  })

  it('handles tables that carry a fourth octave entry', () => {
    expect(getThirds(Tonality.MAJOR, 'C', 'B')).toEqual([-19, -7, 5, 17])
  })
})

describe('getScale', () => {
  it('places C major pentatonic correctly on the low E string', () => {
    const scale = getScale(Tonality.MAJOR, Pattern.Pentatonic, 'C')
    expect(activeFrets(scale.E)).toEqual([3, 5, 8, 10, 12, 15, 17, 20, 22, 24])
  })

  it('rotates the pattern when the key changes', () => {
    const scale = getScale(Tonality.MAJOR, Pattern.Pentatonic, 'D')
    expect(activeFrets(scale.E)).toEqual([2, 5, 7, 10, 12, 14, 17, 19, 22, 24])
  })

  it('returns a 24-entry row for every string', () => {
    const scale = getScale(Tonality.MAJOR, Pattern.Diatonic, 'C')
    for (const row of [scale.E, scale.A, scale.D, scale.G, scale.B, scale.e]) {
      expect(row).toHaveLength(24)
    }
  })

  it('lights every fret for the chromatic scale', () => {
    const scale = getScale(Tonality.MAJOR, Pattern.Chromatic, 'C')
    expect(activeFrets(scale.E)).toHaveLength(24)
  })
})
```

- [ ] **Step 5: Write the note-name characterization tests**

Create `tests/music-theory/noteNames.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { Accidental, Degree } from '@data/constants'
import { findRelativeMajor, findRelativeMinor, getNoteName } from '@data/noteNames'

describe('getNoteName', () => {
  it('names degrees in the key of C using sharps', () => {
    expect(getNoteName(Degree.roots, 'C', Accidental.SHARP)).toBe('C')
    expect(getNoteName(Degree.thirds, 'C', Accidental.SHARP)).toBe('E')
    expect(getNoteName(Degree.fifths, 'C', Accidental.SHARP)).toBe('G')
    expect(getNoteName(Degree.minorSevenths, 'C', Accidental.SHARP)).toBe('A♯')
    expect(getNoteName(Degree.sevenths, 'C', Accidental.SHARP)).toBe('B')
  })

  it('uses flat spellings when the accidental is flat', () => {
    expect(getNoteName(Degree.minorThirds, 'C', Accidental.FLAT)).toBe('E♭')
    expect(getNoteName(Degree.minorSevenths, 'C', Accidental.FLAT)).toBe('B♭')
  })

  it('wraps around the octave', () => {
    expect(getNoteName(Degree.thirds, 'A', Accidental.SHARP)).toBe('C♯')
  })
})

describe('relative keys', () => {
  it('maps a minor key to its relative major', () => {
    expect(findRelativeMajor('A')).toBe('C')
    expect(findRelativeMajor('E')).toBe('G')
  })

  it('maps a major key to its relative minor', () => {
    expect(findRelativeMinor('C')).toBe('A')
    expect(findRelativeMinor('G')).toBe('E')
  })
})
```

- [ ] **Step 6: Write the CAGED characterization tests**

Create `tests/music-theory/CAGED.test.ts`. Note the `toBeFalsy()` assertions — `isCAGED` currently returns `undefined` rather than `false` on the fall-through path, and Task 5 tightens that to `false`. `toBeFalsy()` passes both before and after, which is exactly what a characterization test should do.

```ts
import { describe, expect, it } from 'vitest'
import { Tonality } from '@data/constants'
import { GetCAGEDName, isCAGED, isCAGEDNameHere } from '@data/CAGED'
import type { CurrentCAGED } from '@stores/usePatternStore'

const allShapes: CurrentCAGED = {
  CShape: true, AShape: true, GShape: true, EShape: true, DShape: true,
}

describe('isCAGED', () => {
  it('matches a fret inside an active shape', () => {
    expect(isCAGED(0, 'E', 'C', Tonality.MAJOR, ['CShape'])).toBe(true)
    expect(isCAGED(12, 'E', 'C', Tonality.MAJOR, ['CShape'])).toBe(true)
  })

  it('rejects a fret outside every active shape', () => {
    expect(isCAGED(5, 'E', 'C', Tonality.MAJOR, ['CShape'])).toBeFalsy()
  })

  it('ignores shapes that are not active', () => {
    expect(isCAGED(0, 'E', 'C', Tonality.MAJOR, ['GShape'])).toBeFalsy()
  })

  it('shifts the window with the key', () => {
    expect(isCAGED(2, 'E', 'D', Tonality.MAJOR, ['CShape'])).toBe(true)
  })

  it('gives the same answer for every string', () => {
    for (const stringName of ['E', 'A', 'D', 'G', 'B', 'e']) {
      expect(isCAGED(0, stringName, 'C', Tonality.MAJOR, ['CShape'])).toBe(true)
    }
  })
})

describe('CAGED shape names', () => {
  it('names the shape at its anchor fret', () => {
    expect(GetCAGEDName(1, allShapes, 'C', Tonality.MAJOR)).toBe('C Shape')
    expect(GetCAGEDName(3, allShapes, 'C', Tonality.MAJOR)).toBe('A Shape')
    expect(GetCAGEDName(5, allShapes, 'C', Tonality.MAJOR)).toBe('G Shape')
    expect(GetCAGEDName(8, allShapes, 'C', Tonality.MAJOR)).toBe('E Shape')
    expect(GetCAGEDName(10, allShapes, 'C', Tonality.MAJOR)).toBe('D Shape')
  })

  it('reports no name between anchors', () => {
    expect(GetCAGEDName(2, allShapes, 'C', Tonality.MAJOR)).toBeUndefined()
  })

  it('agrees with isCAGEDNameHere', () => {
    for (let fret = 0; fret < 24; fret++) {
      expect(Boolean(isCAGEDNameHere(fret, allShapes, 'C', Tonality.MAJOR)))
        .toBe(Boolean(GetCAGEDName(fret, allShapes, 'C', Tonality.MAJOR)))
    }
  })
})
```

- [ ] **Step 7: Run the tests and confirm they all pass**

Run: `npm test`
Expected: PASS, 3 files, all tests green. These describe today's behaviour, so a failure here means one of the expected values above was computed wrong — fix the *test*, not the source.

- [ ] **Step 8: Confirm the build still passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vite.config.ts tests/
git commit -m "test: add vitest and characterization tests for the music theory layer"
```

---

### Task 2: One ordered Degree table in `constants.ts`

`Degree` is an enum whose twelve members are re-listed by hand in five places: `degreeToNumber`, `degreeInPattern`'s destructure, `usePatternStore.ts:43`, `MyString.vue:25` and `SideBar.vue:9`. This task makes the enum's *order* the single source of truth for semitone offsets and gives every consumer a list to iterate.

**Files:**
- Modify: `src/lib/music-theory/constants.ts:37-65`
- Create: `tests/music-theory/constants.test.ts`

**Interfaces:**
- Consumes: the existing `Degree` enum and `degreeToNumber` map.
- Produces:
  - `DEGREES: readonly Degree[]` — all twelve degrees in semitone order, index === semitone offset from the root.
  - `degreeToNumber: Record<Degree, number>` — unchanged name and values, now *derived* from `DEGREES` instead of hand-written.
  - `degreeCssClass: Record<Degree, string>` — maps each degree to the SCSS class in `notes-input.scss` that colours it (`Degree.roots` → `'root-note'`, `Degree.minorSeconds` → `'minor-second'`, …). The class names are singular and hyphenated while the enum values are plural and spaced, so this map cannot be derived; it must be written out once, here, and never again.
  - `STRING_NAMES: readonly string[]` — `['E', 'A', 'D', 'G', 'B', 'e']`.

- [ ] **Step 1: Write the failing test**

Create `tests/music-theory/constants.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEGREES, Degree, STRING_NAMES, degreeCssClass, degreeToNumber } from '@data/constants'

describe('DEGREES', () => {
  it('lists all twelve degrees', () => {
    expect(DEGREES).toHaveLength(12)
    expect(new Set(DEGREES).size).toBe(12)
  })

  it('is ordered so the index is the semitone offset', () => {
    expect(DEGREES[0]).toBe(Degree.roots)
    expect(DEGREES[4]).toBe(Degree.thirds)
    expect(DEGREES[7]).toBe(Degree.fifths)
    expect(DEGREES[11]).toBe(Degree.sevenths)
  })

  it('agrees with degreeToNumber', () => {
    DEGREES.forEach((degree, index) => {
      expect(degreeToNumber[degree]).toBe(index)
    })
  })
})

describe('degreeCssClass', () => {
  it('maps every degree to a class name', () => {
    for (const degree of DEGREES) {
      expect(degreeCssClass[degree]).toMatch(/^[a-z-]+$/)
    }
  })

  it('uses the class names the stylesheet defines', () => {
    expect(degreeCssClass[Degree.roots]).toBe('root-note')
    expect(degreeCssClass[Degree.minorSeconds]).toBe('minor-second')
    expect(degreeCssClass[Degree.sevenths]).toBe('seventh')
  })
})

describe('STRING_NAMES', () => {
  it('lists the six strings low to high', () => {
    expect(STRING_NAMES).toEqual(['E', 'A', 'D', 'G', 'B', 'e'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/music-theory/constants.test.ts`
Expected: FAIL — `DEGREES`, `degreeCssClass` and `STRING_NAMES` are not exported from `@data/constants`.

- [ ] **Step 3: Add the tables to `constants.ts`**

Replace the hand-written `degreeToNumber` object (lines 52-65) with this block, keeping the `Degree` enum above it untouched:

```ts
/** All twelve degrees in semitone order — the index IS the offset from the root. */
export const DEGREES: readonly Degree[] = [
  Degree.roots,
  Degree.minorSeconds,
  Degree.seconds,
  Degree.minorThirds,
  Degree.thirds,
  Degree.fourths,
  Degree.tritones,
  Degree.fifths,
  Degree.minorSixths,
  Degree.sixths,
  Degree.minorSevenths,
  Degree.sevenths,
]

export const degreeToNumber = Object.fromEntries(
  DEGREES.map((degree, index) => [degree, index]),
) as Record<Degree, number>

/** SCSS class in notes-input.scss that colours each degree. */
export const degreeCssClass: Record<Degree, string> = {
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
}

/** Guitar strings, low to high. */
export const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e'] as const
export type StringName = (typeof STRING_NAMES)[number]
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — the new `constants.test.ts` plus all of Task 1's tests, which still exercise `degreeToNumber` indirectly through `getNoteName`.

- [ ] **Step 5: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/music-theory/constants.ts tests/music-theory/constants.test.ts
git commit -m "refactor: derive degree tables from a single ordered DEGREES list"
```

---

### Task 3: Collapse `intervals.ts` to a table lookup

Twelve identical getters become one. The twelve-branch ternary chain in `constructBasePattern` becomes a nested loop. The six hand-rolled rotations in `getScale` become one `rotateRight` helper applied over `STRING_NAMES`.

`MyString.vue` is the only external consumer of the twelve getters (verified by grep), and Task 4 rewrites it — so this task deletes them outright rather than leaving deprecated wrappers.

**Files:**
- Modify: `src/lib/music-theory/intervals.ts` (whole file)
- Modify: `tests/music-theory/intervals.test.ts` (switch to the new API)
- Modify: `src/components/MyString.vue:6, 28-39` (minimal edit to keep it compiling; Task 4 rewrites it properly)

**Interfaces:**
- Consumes: `DEGREES`, `STRING_NAMES`, `Degree`, `Pattern`, `Tonality`, `degreeInPattern`, `majorKeyToNumber`, `minorKeyToNumber` from `@data/constants`.
- Produces:
  - `getIntervals(degree: Degree, currentKey: string, stringName: string): number[]` — replaces all twelve getters. The `tonality` parameter is dropped because none of the twelve ever read it.
  - `getScale(tonality: Tonality, pattern: Pattern, key: string): Record<StringName, boolean[]>` — unchanged signature and return shape.
  - `getBasePattern` keeps its signature; it is exported but has no consumer outside this file, so it may become non-exported if `vue-tsc` is happy.

- [ ] **Step 1: Update the interval tests to the new API**

In `tests/music-theory/intervals.test.ts`, replace the import and the `interval getters` describe block. Leave the `getScale` block exactly as it is — that is the real regression guard, and it must keep passing untouched.

```ts
import { describe, expect, it } from 'vitest'
import { Degree, Pattern, Tonality } from '@data/constants'
import { getIntervals, getScale } from '@data/intervals'
```

```ts
describe('getIntervals', () => {
  it('returns the unshifted table for the key of C', () => {
    expect(getIntervals(Degree.roots, 'C', 'E')).toEqual([-4, 8, 20])
  })

  it('shifts every fret by the key offset', () => {
    expect(getIntervals(Degree.roots, 'D', 'E')).toEqual([-2, 10, 22])
    expect(getIntervals(Degree.roots, 'G', 'E')).toEqual([3, 15, 27])
  })

  it('handles tables that carry a fourth octave entry', () => {
    expect(getIntervals(Degree.thirds, 'C', 'B')).toEqual([-19, -7, 5, 17])
  })

  it('covers every degree on every string', () => {
    for (const degree of Object.values(Degree)) {
      for (const stringName of ['E', 'A', 'D', 'G', 'B', 'e']) {
        expect(getIntervals(degree, 'C', stringName).length).toBeGreaterThan(0)
      }
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/music-theory/intervals.test.ts`
Expected: FAIL — `getIntervals` is not exported from `@data/intervals`.

- [ ] **Step 3: Rewrite `intervals.ts`**

Replace the entire contents of `src/lib/music-theory/intervals.ts` with:

```ts
import {
  DEGREES,
  Degree,
  Pattern,
  STRING_NAMES,
  StringName,
  Tonality,
  degreeInPattern,
  majorKeyToNumber,
  minorKeyToNumber,
} from '@data/constants'

/** Fret positions per string, for the key of C, across three octaves. */
type FretsByString = Record<string, number[]>

const FRET_COUNT = 24
const REFERENCE_KEY = 'C'

const INTERVAL_TABLE: Record<Degree, FretsByString> = {
  [Degree.roots]:         { e: [-4, 8, 20],       B: [-11, 1, 13],      G: [-7, 5, 17],       D: [-2, 10, 22],      A: [-9, 3, 15],       E: [-4, 8, 20] },
  [Degree.minorSeconds]:  { e: [-3, 9, 21],       B: [-10, 2, 14],      G: [-6, 6, 18],       D: [-1, 11, 23],      A: [-8, 4, 16],       E: [-3, 9, 21] },
  [Degree.seconds]:       { e: [-2, 10, 22],      B: [-9, 3, 15],       G: [-5, 7, 19],       D: [0, 12, 24],       A: [-7, 5, 17],       E: [-2, 10, 22] },
  [Degree.minorThirds]:   { e: [-1, 11, 23],      B: [-8, 4, 16],       G: [-4, 8, 20],       D: [1, 13, 25],       A: [-6, 6, 18],       E: [-1, 11, 23] },
  [Degree.thirds]:        { e: [0, 12, 24],       B: [-19, -7, 5, 17],  G: [-3, 9, 21],       D: [-10, 2, 14, 26],  A: [-5, 7, 19],       E: [0, 12, 24] },
  [Degree.fourths]:       { e: [1, 13, 25],       B: [-18, -6, 6, 18],  G: [-2, 10, 22],      D: [-9, 3, 15, 27],   A: [-4, 8, 20],       E: [1, 13, 25] },
  [Degree.tritones]:      { e: [-10, 2, 14, 26],  B: [-17, -5, 7, 19],  G: [-1, 11, 23],      D: [-8, 4, 16, 28],   A: [-3, 9, 21],       E: [-10, 2, 14, 26] },
  [Degree.fifths]:        { e: [-9, 3, 15],       B: [-4, 8, 20],       G: [0, 12, 24],       D: [-7, 5, 17],       A: [-2, 10, 22],      E: [-9, 3, 15] },
  [Degree.minorSixths]:   { e: [-8, 4, 16],       B: [-3, 9, 21],       G: [1, 13, 25],       D: [-6, 6, 18],       A: [-1, 11, 23],      E: [-8, 4, 16] },
  [Degree.sixths]:        { e: [-7, 5, 17, 29],   B: [-2, 10, 22],      G: [-10, 2, 14, 26],  D: [-5, 7, 19],       A: [0, 12, 24],       E: [-7, 5, 17, 29] },
  [Degree.minorSevenths]: { e: [-6, 6, 18, 30],   B: [-1, 11, 23],      G: [-9, 3, 15, 27],   D: [-4, 8, 20],       A: [1, 13, 25],       E: [-6, 6, 18, 30] },
  [Degree.sevenths]:      { e: [-5, 7, 19, 31],   B: [0, 12, 24],       G: [-8, 4, 16, 28],   D: [-3, 9, 21],       A: [-10, 2, 14, 26],  E: [-5, 7, 19, 31] },
}

/** Frets on `stringName` that sound `degree` in `currentKey`. 1-based; may be negative or past 24. */
export const getIntervals = (degree: Degree, currentKey: string, stringName: string): number[] => {
  const shift = majorKeyToNumber[currentKey] ?? 0
  return INTERVAL_TABLE[degree][stringName].map(fret => fret + shift)
}

const constructBasePattern = (tonality: Tonality, pattern: Pattern, stringName: string): boolean[] => {
  const degrees = degreeInPattern(pattern, tonality) ?? []
  const litFrets = new Set<number>()

  for (const degree of degrees) {
    for (const fret of getIntervals(degree, REFERENCE_KEY, stringName)) {
      litFrets.add(fret)
    }
  }

  return Array.from({ length: FRET_COUNT }, (_, index) => litFrets.has(index + 1))
}

export const getBasePattern = (tonality: Tonality, pattern: Pattern): Record<StringName, boolean[]> =>
  Object.fromEntries(
    STRING_NAMES.map(stringName => [stringName, constructBasePattern(tonality, pattern, stringName)]),
  ) as Record<StringName, boolean[]>

/** Moves every element `amount` places towards the end, wrapping around. */
const rotateRight = <T>(values: T[], amount: number): T[] => {
  const size = values.length
  const offset = ((amount % size) + size) % size
  return [...values.slice(size - offset), ...values.slice(0, size - offset)]
}

export const getScale = (
  tonality: Tonality,
  pattern: Pattern,
  key: string,
): Record<StringName, boolean[]> => {
  const basePattern = getBasePattern(tonality, pattern)
  const keyOffset =
    (tonality === Tonality.MINOR ? minorKeyToNumber[key] : majorKeyToNumber[key]) ?? 0

  return Object.fromEntries(
    STRING_NAMES.map(stringName => [stringName, rotateRight(basePattern[stringName], keyOffset)]),
  ) as Record<StringName, boolean[]>
}
```

Note that `getBasePattern` loses its unused third parameter (`key`) — the old signature took one and then hardcoded `'C'` at the call site anyway (`getScale` line 239).

- [ ] **Step 4: Keep `MyString.vue` compiling**

This is a holding edit; Task 4 replaces all of it. In `src/components/MyString.vue`, change the import on line 6 to:

```ts
import { getIntervals } from '@data/intervals';
```

and replace the twelve computed refs on lines 28-39 with:

```ts
const intervalsFor = (degree: Degree) =>
    computed(() => getIntervals(degree, props.currentKey, props.stringName));

const rootIntervals = intervalsFor(roots);
const minorSecondIntervals = intervalsFor(minorSeconds);
const secondIntervals = intervalsFor(seconds);
const minorThirdIntervals = intervalsFor(minorThirds);
const thirdIntervals = intervalsFor(thirds);
const fourthIntervals = intervalsFor(fourths);
const tritoneIntervals = intervalsFor(tritones);
const fifthIntervals = intervalsFor(fifths);
const minorSixthIntervals = intervalsFor(minorSixths);
const sixthIntervals = intervalsFor(sixths);
const minorSeventhIntervals = intervalsFor(minorSevenths);
const seventhIntervals = intervalsFor(sevenths);
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS. The `getScale` assertions from Task 1 are unchanged and must still produce `[3, 5, 8, 10, 12, 15, 17, 20, 22, 24]` — that is the proof the rewrite preserved behaviour.

- [ ] **Step 6: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/music-theory/intervals.ts src/components/MyString.vue tests/music-theory/intervals.test.ts
git commit -m "refactor: collapse twelve interval getters into a single table lookup"
```

---

### Task 4: Rewrite `MyString.vue` as a degree loop — **fixes two bugs**

This is the highest-value change in the plan. The component drops from 169 lines to roughly 90, does one lookup per fret instead of ~26, and both confirmed bugs disappear as a consequence of there being only one code path left.

**Behaviour changes, both intentional:**
1. Major sevenths now display the correct note name (`MyString.vue:53` passed `minorSevenths` where it meant `sevenths`).
2. Unchecking a string in the sidebar now actually hides that string's notes (`MyString.vue:75` compared a `ComputedRef` object, which is always truthy).

**Files:**
- Modify: `src/components/MyString.vue` (script and template; the `<style>` block is untouched)
- Create: `tests/components/MyString.test.ts`

**Interfaces:**
- Consumes: `getIntervals` (Task 3), `DEGREES` / `degreeCssClass` (Task 2), `isCAGED` from `@data/CAGED` (still the pre-Task-5 signature taking `stringName`), `getNoteName` from `@data/noteNames`.
- Produces: no exported API — props are unchanged, so `MyFretboard.vue` needs no edit.

- [ ] **Step 1: Write the failing test**

Create `tests/components/MyString.test.ts`. `noteAt` reads the rendered note name at a 0-based fret index, skipping the open-position element that `MyString` renders first.

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MyString from '@components/MyString.vue'
import { Accidental, Degree, Tonality } from '@data/constants'

const baseProps = {
  stringName: 'E',
  stringData: new Array(24).fill(false),
  fretAmount: 24,
  currentKey: 'C',
  currentTonality: Tonality.MAJOR,
  currentAccidental: Accidental.SHARP,
  currentHighlightNotes: Object.values(Degree) as string[],
  currentCAGED: { CShape: true, AShape: true, GShape: true, EShape: true, DShape: true },
  currentStrings: { E: true, A: true, D: true, G: true, B: true, e: true },
  chordPositions: [] as number[],
  barPositions: [] as number[],
  isChordFocused: false,
}

/** Rendered note names, indexed by 0-based fret; '' where no note is lit. */
const noteNames = (wrapper: ReturnType<typeof mount>): string[] =>
  wrapper.findAll('.fret').map(fret => fret.find('.note-names')?.text() ?? '')

describe('MyString', () => {
  it('names the major seventh correctly', () => {
    // Low E, key of C: the seventh (B) sits at fret 7. index 6 == fret 7.
    const wrapper = mount(MyString, { props: baseProps })
    expect(noteNames(wrapper)[6]).toBe('B')
  })

  it('names the minor seventh correctly', () => {
    // Low E, key of C: the minor seventh (A#) sits at fret 6. index 5 == fret 6.
    const wrapper = mount(MyString, { props: baseProps })
    expect(noteNames(wrapper)[5]).toBe('A♯')
  })

  it('lights the root at the expected frets', () => {
    const wrapper = mount(MyString, { props: baseProps })
    expect(wrapper.findAll('.root-note').length).toBeGreaterThan(0)
    expect(noteNames(wrapper)[7]).toBe('C') // fret 8 on low E
  })

  it('hides every note when the string is switched off', () => {
    const wrapper = mount(MyString, {
      props: {
        ...baseProps,
        currentStrings: { ...baseProps.currentStrings, E: false },
      },
    })
    expect(wrapper.findAll('.note-names')).toHaveLength(0)
  })

  it('shows only chord frets when a chord is focused', () => {
    const wrapper = mount(MyString, {
      props: { ...baseProps, isChordFocused: true, chordPositions: [8] },
    })
    const names = noteNames(wrapper).filter(Boolean)
    expect(names).toHaveLength(1)
    expect(noteNames(wrapper)[7]).toBe('C')
  })

  it('hides degrees the user has not highlighted', () => {
    const wrapper = mount(MyString, {
      props: { ...baseProps, currentHighlightNotes: [Degree.roots] },
    })
    expect(noteNames(wrapper)[7]).toBe('C')
    expect(noteNames(wrapper)[6]).toBe('')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/components/MyString.test.ts`
Expected: FAIL. Specifically: "names the major seventh correctly" fails with `'A♯'` received (bug 2), and "hides every note when the string is switched off" fails because notes are still rendered (bug 3).

- [ ] **Step 3: Rewrite the `<script setup>` block**

Replace everything between `<script setup lang="ts">` and `</script>` in `src/components/MyString.vue` with:

```ts
import { computed } from 'vue';
import { CurrentStrings, CurrentCAGED } from '@stores/usePatternStore';
import { isCAGED } from '@data/CAGED';
import { Accidental, DEGREES, Degree, Tonality, degreeCssClass } from '@data/constants';
import { getIntervals } from '@data/intervals';
import { getNoteName } from '@data/noteNames';

const props = defineProps<{
    stringName: string,
    stringData: string[],
    fretAmount: number,
    isLastString?: boolean,
    currentKey: string,
    currentTonality: Tonality,
    currentAccidental: Accidental,
    currentHighlightNotes: string[],
    currentCAGED: CurrentCAGED,
    currentStrings: CurrentStrings,
    chordPositions: number[],
    barPositions: number[],
    isChordFocused: boolean
}>();

/** Note name to print for each degree, in the current key and accidental. */
const noteNames = computed(() => {
    const names = {} as Record<Degree, string>;
    for (const degree of DEGREES) {
        names[degree] = getNoteName(degree, props.currentKey, props.currentAccidental);
    }
    return names;
});

const activeShapes = computed(() =>
    Object.keys(props.currentCAGED).filter(shape => props.currentCAGED[shape]));

/**
 * Which degree sounds at each fret on this string, keyed by 1-based fret number.
 * Every fret carries at most one degree, so a Map is enough.
 */
const degreeByFret = computed(() => {
    const frets = new Map<number, Degree>();
    if (!props.currentStrings[props.stringName]) return frets;

    for (const degree of DEGREES) {
        if (!props.currentHighlightNotes.includes(degree)) continue;
        for (const fret of getIntervals(degree, props.currentKey, props.stringName)) {
            frets.set(fret, degree);
        }
    }
    return frets;
});

/** The degree to render at a 0-based fret index, or undefined if nothing shows there. */
const degreeAt = (index: number): Degree | undefined => {
    const degree = degreeByFret.value.get(index + 1);
    if (!degree) return undefined;

    if (!isCAGED(index, props.stringName, props.currentKey, props.currentTonality, activeShapes.value))
        return undefined;

    if (props.isChordFocused && !props.chordPositions.includes(index + 1))
        return undefined;

    return degree;
};

const noteClassAt = (index: number): string | undefined => {
    const degree = degreeAt(index);
    return degree && degreeCssClass[degree];
};

const noteNameAt = (index: number): string | undefined => {
    const degree = degreeAt(index);
    return degree && noteNames.value[degree];
};

const openIndex = 11; // the fret index whose note equals the open string
```

- [ ] **Step 4: Rewrite the template**

Replace everything between `<template>` and `</template>` with:

```html
    <div class="d-inline-block open-position">
        <label class="notes open-note">
            <input type="checkbox" v-model="stringData[openIndex]"/>
            <div class="checkbox__checkmark" :class="noteClassAt(openIndex)"></div>
        </label>
    </div>
    <div v-for="(_, index) in stringData" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" :style="{ 'border-right': isLastString ? 'none' : '' }">
        <div v-if="barPositions.includes(index + 1) && isChordFocused" class="bar"></div>
        <label v-if="index < fretAmount" class="notes">
            <input type="checkbox" v-model="stringData[index]"/>
            <div class="checkbox__checkmark" :class="noteClassAt(index)">
                <span v-if="noteNameAt(index)" class="note-names">{{ noteNameAt(index) }}</span>
            </div>
        </label>
    </div>
```

Leave the `<style scoped lang="scss">` block exactly as it is.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, including both bug-fix assertions.

- [ ] **Step 6: Verify visually in the running app**

Run: `npm run dev`, open the app, and check three things:
1. Select the Diatonic scale in C major. Fret 7 on the low E string reads **B**, not A♯.
2. In the sidebar, uncheck the **e** string. The top string's notes disappear.
3. Re-check it. They come back.

- [ ] **Step 7: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/MyString.vue tests/components/MyString.test.ts
git commit -m "refactor: drive MyString from the degree table; fix seventh naming and string toggles"
```

---

### Task 5: Collapse `CAGED.ts`

Five shapes described by 30 table entries carrying 5 distinct arrays, plus three functions that each unroll the same five-way check by hand.

**Files:**
- Modify: `src/lib/music-theory/CAGED.ts` (whole file)
- Modify: `src/components/MyFretboard.vue:4, 174-183`
- Modify: `src/components/MyString.vue` (drop the now-unused `stringName` argument to `isCAGED`)
- Modify: `tests/music-theory/CAGED.test.ts`

**Interfaces:**
- Consumes: `CurrentCAGED` from `@stores/usePatternStore`, `majorKeyToNumber` / `minorKeyToNumber` / `Tonality` from `@data/constants`.
- Produces:
  - `type CagedShape = 'CShape' | 'AShape' | 'GShape' | 'EShape' | 'DShape'`
  - `CAGED_SHAPES: Record<CagedShape, { name: string; frets: number[]; anchors: number[] }>`
  - `isCAGED(index: number, currentKey: string, tonality: Tonality, activeShapes: string[]): boolean` — **the `stringName` parameter is gone.** All six strings mapped to the same array, so it never affected the result.
  - `getCAGEDName(index: number, currentCAGED: CurrentCAGED, currentKey: string, tonality: Tonality): string | undefined` — replaces both `GetCAGEDName` (renamed to camelCase) and `isCAGEDNameHere` (the template can test the returned string directly).

- [ ] **Step 1: Update the CAGED tests to the new API**

Rewrite `tests/music-theory/CAGED.test.ts`. Every expected value is carried over unchanged from Task 1 — only the call signatures move.

```ts
import { describe, expect, it } from 'vitest'
import { Tonality } from '@data/constants'
import { CAGED_SHAPES, getCAGEDName, isCAGED } from '@data/CAGED'
import type { CurrentCAGED } from '@stores/usePatternStore'

const allShapes: CurrentCAGED = {
  CShape: true, AShape: true, GShape: true, EShape: true, DShape: true,
}

describe('isCAGED', () => {
  it('matches a fret inside an active shape', () => {
    expect(isCAGED(0, 'C', Tonality.MAJOR, ['CShape'])).toBe(true)
    expect(isCAGED(12, 'C', Tonality.MAJOR, ['CShape'])).toBe(true)
  })

  it('returns false — not undefined — outside every active shape', () => {
    expect(isCAGED(5, 'C', Tonality.MAJOR, ['CShape'])).toBe(false)
  })

  it('ignores shapes that are not active', () => {
    expect(isCAGED(0, 'C', Tonality.MAJOR, ['GShape'])).toBe(false)
  })

  it('returns false when no shape is active', () => {
    expect(isCAGED(0, 'C', Tonality.MAJOR, [])).toBe(false)
  })

  it('shifts the window with the key', () => {
    expect(isCAGED(2, 'D', Tonality.MAJOR, ['CShape'])).toBe(true)
  })
})

describe('getCAGEDName', () => {
  it('names the shape at its anchor fret', () => {
    expect(getCAGEDName(1, allShapes, 'C', Tonality.MAJOR)).toBe('C Shape')
    expect(getCAGEDName(3, allShapes, 'C', Tonality.MAJOR)).toBe('A Shape')
    expect(getCAGEDName(5, allShapes, 'C', Tonality.MAJOR)).toBe('G Shape')
    expect(getCAGEDName(8, allShapes, 'C', Tonality.MAJOR)).toBe('E Shape')
    expect(getCAGEDName(10, allShapes, 'C', Tonality.MAJOR)).toBe('D Shape')
  })

  it('reports no name between anchors', () => {
    expect(getCAGEDName(2, allShapes, 'C', Tonality.MAJOR)).toBeUndefined()
  })

  it('skips shapes the user has switched off', () => {
    const onlyE: CurrentCAGED = {
      CShape: false, AShape: false, GShape: false, EShape: true, DShape: false,
    }
    expect(getCAGEDName(1, onlyE, 'C', Tonality.MAJOR)).toBeUndefined()
    expect(getCAGEDName(8, onlyE, 'C', Tonality.MAJOR)).toBe('E Shape')
  })
})

describe('CAGED_SHAPES', () => {
  it('describes all five shapes', () => {
    expect(Object.keys(CAGED_SHAPES)).toEqual(['CShape', 'AShape', 'GShape', 'EShape', 'DShape'])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/music-theory/CAGED.test.ts`
Expected: FAIL — `CAGED_SHAPES` and `getCAGEDName` are not exported.

- [ ] **Step 3: Rewrite `CAGED.ts`**

Replace the entire contents of `src/lib/music-theory/CAGED.ts` with:

```ts
import { CurrentCAGED } from '@stores/usePatternStore'
import { Tonality, majorKeyToNumber, minorKeyToNumber } from '@data/constants'

export type CagedShape = 'CShape' | 'AShape' | 'GShape' | 'EShape' | 'DShape'

/**
 * Each shape covers the same frets on all six strings, so `frets` is one list.
 * `anchors` are where the shape's label is printed. Positions are fret - 1,
 * relative to the key of C, and repeat every octave.
 */
export const CAGED_SHAPES: Record<CagedShape, { name: string; frets: number[]; anchors: number[] }> = {
  CShape: { name: 'C Shape', frets: [-1, 0, 1, 2, 11, 12, 13, 14],           anchors: [-11, 1, 12] },
  AShape: { name: 'A Shape', frets: [-11, -10, -9, -8, 1, 2, 3, 4, 13, 14, 15, 16], anchors: [-9, 3, 15] },
  GShape: { name: 'G Shape', frets: [-8, -7, -6, -5, 4, 5, 6, 7, 16, 17, 18, 19],   anchors: [-7, 5, 17] },
  EShape: { name: 'E Shape', frets: [-6, -5, -4, -3, 6, 7, 8, 9, 18, 19, 20, 21],   anchors: [-4, 8, 20] },
  DShape: { name: 'D Shape', frets: [-4, -3, -2, -1, 8, 9, 10, 11, 20, 21, 22, 23], anchors: [-2, 10, 22] },
}

const SHAPE_ORDER = Object.keys(CAGED_SHAPES) as CagedShape[]

/** Offset used when matching shape windows. */
const shapeOffset = (currentKey: string, tonality: Tonality): number =>
  (tonality === Tonality.MINOR ? minorKeyToNumber[currentKey] : majorKeyToNumber[currentKey]) ?? 0

/**
 * Offset used when placing shape labels. NOTE: this deliberately differs from
 * shapeOffset for minor keys — see "Open Questions" in the refactor plan. Do not
 * unify the two without deciding which is musically correct.
 */
const labelOffset = (currentKey: string, tonality: Tonality): number => {
  const major = majorKeyToNumber[currentKey] ?? 0
  return tonality === Tonality.MINOR ? major + 3 : major
}

export const isCAGED = (
  index: number,
  currentKey: string,
  tonality: Tonality,
  activeShapes: string[],
): boolean => {
  const position = index - shapeOffset(currentKey, tonality)
  return SHAPE_ORDER.some(
    shape => activeShapes.includes(shape) && CAGED_SHAPES[shape].frets.includes(position),
  )
}

export const getCAGEDName = (
  index: number,
  currentCAGED: CurrentCAGED,
  currentKey: string,
  tonality: Tonality,
): string | undefined => {
  const position = index - labelOffset(currentKey, tonality)
  const shape = SHAPE_ORDER.find(
    name => currentCAGED[name] && CAGED_SHAPES[name].anchors.includes(position),
  )
  return shape && CAGED_SHAPES[shape].name
}
```

- [ ] **Step 4: Update the two call sites**

In `src/components/MyString.vue`, drop the `stringName` argument inside `degreeAt`:

```ts
    if (!isCAGED(index, props.currentKey, props.currentTonality, activeShapes.value))
        return undefined;
```

In `src/components/MyFretboard.vue`, change the import on line 4:

```ts
import { getCAGEDName } from '@data/CAGED';
```

and replace the CAGED-name block (lines 174-183) with a single call instead of two:

```html
            <!-- CAGED Names -->
            <div v-if="!isChordFocused" class="CAGED-name-container text-start">
                <div v-for="(_, index) in e" :key="index" class="d-inline-block CAGED-box" :class="{'fret': index < fretAmount}" style="border-right: none;">
                    <span v-if="index < fretAmount && getCAGEDName(index, currentCAGED, currentKey, currentTonality)" class="CAGED-name text-yellow">
                        {{ getCAGEDName(index, currentCAGED, currentKey, currentTonality) }}
                    </span>
                </div>
            </div>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — including `tests/components/MyString.test.ts`, which exercises the new `isCAGED` signature through the component.

- [ ] **Step 6: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/music-theory/CAGED.ts src/components/MyString.vue src/components/MyFretboard.vue tests/music-theory/CAGED.test.ts
git commit -m "refactor: collapse CAGED shapes into one table and one name lookup"
```

---

### Task 6: `SideBar.vue` — loop the checkboxes, drop the DOM manipulation

**Behaviour change, intentional:** the sidebar's collapsed state stops being applied by `classList.toggle()` on a DOM node fetched by id and becomes a plain `:class` binding on `isSidebarActive`. The visual result is identical; the difference is that there is now one source of truth instead of two that can drift.

**Files:**
- Modify: `src/components/SideBar.vue` (script and template; `<style>` untouched)

**Interfaces:**
- Consumes: `DEGREES` / `degreeCssClass` from `@data/constants` (Task 2), `usePatternStore`.
- Produces: no exported API.

- [ ] **Step 1: Rewrite the `<script setup>` block**

Replace everything between `<script setup lang="ts">` and `</script>` in `src/components/SideBar.vue` with:

```ts
import { usePatternStore } from '@stores/usePatternStore';
import { storeToRefs } from 'pinia';
import { Accidental, degreeCssClass } from '@data/constants';

const patternStore = usePatternStore();
const { currentAccidental, currentHighlightNotes, currentCAGED, currentStrings, isSidebarActive } = storeToRefs(patternStore);

const CAGED_SHAPES = [
  { key: 'CShape', label: 'C' },
  { key: 'AShape', label: 'A' },
  { key: 'GShape', label: 'G' },
  { key: 'EShape', label: 'E' },
  { key: 'DShape', label: 'D' },
] as const;

const STRINGS = [
  { key: 'e', label: 'e' },
  { key: 'B', label: 'B' },
  { key: 'G', label: 'G' },
  { key: 'D', label: 'D' },
  { key: 'A', label: 'A' },
  { key: 'E', label: 'E' },
] as const;

const toggleSidebar = () => {
  isSidebarActive.value = !isSidebarActive.value;
};
</script>
```

Note the import path change on line 3: `'@/stores/usePatternStore'` becomes `'@stores/usePatternStore'`, per the alias convention.

- [ ] **Step 2: Rewrite the template**

Replace everything between `<template>` and `</template>` with:

```html
    <div id="sidebar" class="side-bar" :class="{ collapsed: !isSidebarActive }">
        <div class="hamburger text-start" @click="toggleSidebar()">☰</div>
        <Transition name="fade">
            <div v-show="isSidebarActive">
                <!-- Accidental -->
                <div class="d-flex mt-3 switch-radio">
                    <label>
                        <input type="radio" name="accidental" :value="Accidental.SHARP" v-model="currentAccidental" @change="patternStore.toggleSidebarStatus(); patternStore.updateToEqualAccidental()">
                            <div class="label text-nowrap"> Sharp ♯ </div>
                        </input>
                    </label>

                    <label>
                        <input type="radio" name="accidental" :value="Accidental.FLAT" v-model="currentAccidental" @change="patternStore.toggleSidebarStatus(); patternStore.updateToEqualAccidental()">
                            <div class="label text-nowrap"> Flat ♭ </div>
                        </input>
                    </label>
                </div>

                <!-- Notes -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">Notes</span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label v-for="degree in patternStore.highlightNotes" :key="degree" class="d-flex notes">
                        <input type="checkbox" :value="degree" v-model="currentHighlightNotes" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark"
                             :class="currentHighlightNotes.includes(degree) ? degreeCssClass[degree] : ''"></div>
                        <span class="ms-3">{{ degree }}</span>
                    </label>
                </div>

                <!-- Shapes (CAGED) -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">Shapes (CAGED)</span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label v-for="shape in CAGED_SHAPES" :key="shape.key" class="d-flex notes">
                        <input type="checkbox" v-model="currentCAGED[shape.key]" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{ yellow: currentCAGED[shape.key] }"></div>
                        <span class="ms-3">{{ shape.label }}</span>
                    </label>
                </div>

                <!-- Strings (EADGBe) -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">Strings (EADGBe)</span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label v-for="string in STRINGS" :key="string.key" class="d-flex notes">
                        <input type="checkbox" v-model="currentStrings[string.key]" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{ yellow: currentStrings[string.key] }"></div>
                        <span class="ms-3">{{ string.label }}</span>
                    </label>
                </div>

                <!-- Reset to Default -->
                <div class="mt-5" @click="patternStore.resetToDefault()">
                    <small class="reset-settings">Reset Settings</small>
                </div>
            </div>
        </Transition>
    </div>
```

The `:value` bindings on the CAGED and string checkboxes are dropped — they were set to the same expression as `v-model`, which does nothing for a boolean checkbox.

- [ ] **Step 3: Verify visually in the running app**

Run: `npm run dev` and confirm:
1. The hamburger still collapses and expands the sidebar, with the same animation.
2. Each of the five CAGED checkboxes toggles the matching shape on the fretboard.
3. Each of the six string checkboxes hides and shows the matching string (this works because of Task 4).
4. Toggling a note degree still recolours its dot.

- [ ] **Step 4: Run the tests and build**

Run: `npm test && npm run build`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/SideBar.vue
git commit -m "refactor: render sidebar checkboxes from config; bind collapsed state reactively"
```

---

### Task 7: One storage adapter interface

`customizerService.ts` hand-writes the same ternary seven times and returns `Promise<T> | T` unions. Making both adapters async and conforming to one interface reduces the file to a type, a selection and one destructuring line — with no call-site changes, because every caller already `await`s.

**Files:**
- Create: `src/services/storageAdapter.ts`
- Modify: `src/services/adapters/localStorageAdapter.ts`
- Modify: `src/services/adapters/apiAdapter.ts`
- Modify: `src/services/customizerService.ts` (whole file)
- Create: `tests/services/localStorageAdapter.test.ts`

**Interfaces:**
- Consumes: `Theme` from `@data/constants`, `FretboardData` / `defaultData` from `@stores/usePatternStore`.
- Produces:
  - `src/services/storageAdapter.ts` exports `interface StorageAdapter` (8 async methods) and `interface LibraryCard { id: string; name: string; data: FretboardData; createdAt: number }`. `LibraryCard` moves here from `localStorageAdapter.ts` — it is a domain type, not a localStorage detail.
  - `localStorageAdapter.ts` exports `const localStorageAdapter: StorageAdapter`, and re-exports `LibraryCard` so existing imports keep working.
  - `apiAdapter.ts` exports `const apiAdapter: StorageAdapter`.
  - `customizerService.ts` keeps all eight named exports, each now returning a real `Promise`.

- [ ] **Step 1: Write the failing test**

Create `tests/services/localStorageAdapter.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { Theme } from '@data/constants'
import { localStorageAdapter } from '@services/adapters/localStorageAdapter'
import { defaultData } from '@stores/usePatternStore'

describe('localStorageAdapter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('satisfies the StorageAdapter shape', () => {
    for (const method of [
      'fetchCurrentTheme', 'saveCurrentTheme',
      'fetchCurrentFretboard', 'saveCurrentFretboard',
      'fetchFretboards', 'saveFretboards',
      'fetchLibraryCards', 'saveLibraryCards',
    ]) {
      expect(typeof localStorageAdapter[method]).toBe('function')
    }
  })

  it('round-trips the theme', async () => {
    await localStorageAdapter.saveCurrentTheme(Theme.light)
    await expect(localStorageAdapter.fetchCurrentTheme()).resolves.toBe(Theme.light)
  })

  it('falls back to defaultData when no fretboard is stored', async () => {
    await expect(localStorageAdapter.fetchCurrentFretboard()).resolves.toEqual(defaultData)
  })

  it('round-trips the fretboard list', async () => {
    await localStorageAdapter.saveFretboards([defaultData])
    await expect(localStorageAdapter.fetchFretboards()).resolves.toEqual([defaultData])
  })

  it('returns undefined when no library cards are stored', async () => {
    await expect(localStorageAdapter.fetchLibraryCards()).resolves.toBeUndefined()
  })

  it('survives corrupt stored JSON', async () => {
    localStorage.setItem('fretboardList', 'not json')
    await expect(localStorageAdapter.fetchFretboards()).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/services/localStorageAdapter.test.ts`
Expected: FAIL — `localStorageAdapter` is not exported (the module exports loose functions).

- [ ] **Step 3: Create the interface**

Create `src/services/storageAdapter.ts`:

```ts
import { Theme } from '@data/constants'
import { FretboardData } from '@stores/usePatternStore'

export interface LibraryCard {
  id: string
  name: string
  data: FretboardData
  createdAt: number
}

/** Everything the app persists. Both the localStorage and HTTP backends implement this. */
export interface StorageAdapter {
  fetchCurrentTheme(): Promise<Theme | null>
  saveCurrentTheme(theme: Theme): Promise<void>
  fetchCurrentFretboard(): Promise<FretboardData | undefined>
  saveCurrentFretboard(fretboard: FretboardData): Promise<void>
  fetchFretboards(): Promise<FretboardData[] | undefined>
  saveFretboards(fretboards: FretboardData[]): Promise<void>
  fetchLibraryCards(): Promise<LibraryCard[] | undefined>
  saveLibraryCards(cards: LibraryCard[]): Promise<void>
}
```

- [ ] **Step 4: Rewrite `localStorageAdapter.ts`**

Replace the entire contents of `src/services/adapters/localStorageAdapter.ts` with:

```ts
import { Theme } from '@data/constants'
import { FretboardData, defaultData } from '@stores/usePatternStore'
import type { LibraryCard, StorageAdapter } from '@services/storageAdapter'

export type { LibraryCard }

const THEME_KEY = 'theme'
const FRETBOARD_KEY = 'currentFretboard'
const FRETBOARD_LIST_KEY = 'fretboardList'
const LIBRARY_CARDS_KEY = 'libraryCards'

const read = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch (error) {
    console.log(`read ${key}: `, error)
    return fallback
  }
}

const write = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.log(`write ${key}: `, error)
  }
}

export const localStorageAdapter: StorageAdapter = {
  async fetchCurrentTheme() {
    return localStorage.getItem(THEME_KEY) as Theme | null
  },
  async saveCurrentTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
  },
  async fetchCurrentFretboard() {
    return read<FretboardData | undefined>(FRETBOARD_KEY, defaultData)
  },
  async saveCurrentFretboard(fretboard) {
    write(FRETBOARD_KEY, fretboard)
  },
  async fetchFretboards() {
    return read<FretboardData[] | undefined>(FRETBOARD_LIST_KEY, undefined)
  },
  async saveFretboards(fretboards) {
    write(FRETBOARD_LIST_KEY, fretboards)
  },
  async fetchLibraryCards() {
    return read<LibraryCard[] | undefined>(LIBRARY_CARDS_KEY, undefined)
  },
  async saveLibraryCards(cards) {
    write(LIBRARY_CARDS_KEY, cards)
  },
}
```

The storage keys are unchanged strings — renaming them would orphan every existing user's saved state.

- [ ] **Step 5: Rewrite `apiAdapter.ts`**

Replace the entire contents of `src/services/adapters/apiAdapter.ts` with:

```ts
import { Theme } from '@data/constants'
import { FretboardData, defaultData } from '@stores/usePatternStore'
import type { LibraryCard, StorageAdapter } from '@services/storageAdapter'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

const get = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(`${BASE_URL}${path}`)
    if (!response.ok) return fallback
    return (await response.json()) as T
  } catch (error) {
    console.log(`GET ${path}: `, error)
    return fallback
  }
}

const post = async (path: string, body: unknown): Promise<void> => {
  try {
    await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (error) {
    console.log(`POST ${path}: `, error)
  }
}

export const apiAdapter: StorageAdapter = {
  async fetchCurrentTheme() {
    const data = await get<{ value: Theme } | null>('/theme', null)
    return data?.value ?? null
  },
  async saveCurrentTheme(theme) {
    await post('/theme', { value: theme })
  },
  async fetchCurrentFretboard() {
    return get<FretboardData | undefined>('/fretboard', defaultData)
  },
  async saveCurrentFretboard(fretboard) {
    await post('/fretboard', fretboard)
  },
  async fetchFretboards() {
    return get<FretboardData[] | undefined>('/fretboards', undefined)
  },
  async saveFretboards(fretboards) {
    await post('/fretboards', fretboards)
  },
  async fetchLibraryCards() {
    return get<LibraryCard[] | undefined>('/library-cards', undefined)
  },
  async saveLibraryCards(cards) {
    await post('/library-cards', cards)
  },
}
```

- [ ] **Step 6: Rewrite `customizerService.ts`**

Replace the entire contents of `src/services/customizerService.ts` with:

```ts
import { localStorageAdapter } from '@services/adapters/localStorageAdapter'
import { apiAdapter } from '@services/adapters/apiAdapter'
import type { StorageAdapter } from '@services/storageAdapter'

/** Set VITE_USE_API=true in a .env file to persist through the HTTP backend instead. */
const adapter: StorageAdapter =
  import.meta.env.VITE_USE_API === 'true' ? apiAdapter : localStorageAdapter

export const {
  fetchCurrentTheme,
  saveCurrentTheme,
  fetchCurrentFretboard,
  saveCurrentFretboard,
  fetchFretboards,
  saveFretboards,
  fetchLibraryCards,
  saveLibraryCards,
} = adapter
```

- [ ] **Step 7: Point `useLibraryStore.ts` at the new type location**

In `src/stores/useLibraryStore.ts`, change line 4:

```ts
import type { LibraryCard } from '@services/storageAdapter'
```

Leave the `export type { LibraryCard }` re-export on line 6 — `LibraryPage.vue` and `DefaultLayout.vue` import it from the store.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 9: Verify persistence still works in the running app**

Run: `npm run dev`. Change the theme, add a second fretboard, create a library card, then reload the page. All three must survive the reload.

- [ ] **Step 10: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 11: Commit**

```bash
git add src/services/ src/stores/useLibraryStore.ts tests/services/
git commit -m "refactor: define one StorageAdapter interface for both persistence backends"
```

---

### Task 8: Decompose `MainPage.vue`

485 lines holding fretboard-list state, persistence, drag-and-drop, four selector UIs and the fretboard render loop. This task pulls the state out into a composable and the selectors out into a component, deletes the three duplicated construction blocks, gives each fretboard a stable id, and removes the boolean-flag event bus.

**Files:**
- Create: `src/composables/useFretboards.ts`
- Create: `src/components/FretboardControls.vue`
- Modify: `src/components/MainPage.vue`
- Modify: `src/stores/usePatternStore.ts` (add `id` to `FretboardData`; delete the three flags and their toggles)
- Modify: `src/components/MyFretboard.vue:20-25` and `src/components/MyString.vue` (correct the string-row prop types)
- Create: `tests/composables/useFretboards.test.ts`
- Modify: `vite.config.ts` and `tsconfig.json` (add the `@composables` alias)

**Prerequisite:** `crypto.randomUUID()` needs Node 19+ (already used by `useLibraryStore.ts:19`). Check with `node --version` before starting; on an older Node the tests will fail in jsdom even though the browser is fine.

**Interfaces:**
- Consumes: `getScale` (Task 3), `currentFretboardData` and `loadFromFretboardData` (already on the store), `fetchFretboards` / `saveFretboards` / `fetchCurrentFretboard` / `saveCurrentFretboard` (Task 7).
- Produces:
  - `FretboardData` gains `id: string` (created with `crypto.randomUUID()`). Stored fretboards written before this change have no `id`, so `useFretboards` must backfill one on load.
  - `src/composables/useFretboards.ts` exports `useFretboards()` returning `{ fretboards, currentIndex, isEditing, load, addCurrent, updateCurrent, select, remove, reorder }`.
  - `FretboardControls.vue` takes no props and emits nothing — it binds straight to the store, exactly as the inline markup does today.
  - `usePatternStore` loses `hasSidebarUpdated`, `hasTonalityUpdated`, `hasReset`, `toggleSidebarStatus()`, `toggleTonalityStatus()`, `toggleResetStatus()`.

- [ ] **Step 1: Add the `@composables` alias**

In `vite.config.ts`, inside `resolve.alias`:

```ts
      '@composables': '/src/composables',
```

In `tsconfig.json`, inside `compilerOptions.paths`:

```json
      "@composables/*": ["src/composables/*"],
```

- [ ] **Step 2: Write the failing test**

Create `tests/composables/useFretboards.test.ts`:

```ts
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useFretboards } from '@composables/useFretboards'
import { usePatternStore } from '@stores/usePatternStore'

describe('useFretboards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('starts from the current store state when nothing is stored', async () => {
    const { fretboards, load } = useFretboards()
    await load()
    expect(fretboards.value).toHaveLength(1)
    expect(fretboards.value[0].currentKey).toBe(usePatternStore().currentKey)
  })

  it('gives every fretboard a unique id', async () => {
    const { fretboards, load, addCurrent } = useFretboards()
    await load()
    addCurrent()
    addCurrent()
    const ids = fretboards.value.map(board => board.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.every(Boolean)).toBe(true)
  })

  it('assigns ids even when two fretboards share a key', async () => {
    const { fretboards, load, addCurrent } = useFretboards()
    await load()
    addCurrent()
    expect(fretboards.value[0].currentKey).toBe(fretboards.value[1].currentKey)
    expect(fretboards.value[0].id).not.toBe(fretboards.value[1].id)
  })

  it('carries the rendered scale rows for each fretboard', async () => {
    const { fretboards, load } = useFretboards()
    await load()
    expect(fretboards.value[0].E).toHaveLength(24)
    expect(fretboards.value[0].e).toHaveLength(24)
  })

  it('loads the selected fretboard back into the store', async () => {
    const store = usePatternStore()
    const { load, addCurrent, select } = useFretboards()
    await load()
    store.currentKey = 'D'
    addCurrent()
    store.currentKey = 'G'
    select(0)
    expect(store.currentKey).toBe('C')
  })

  it('removes a fretboard by index', async () => {
    const { fretboards, load, addCurrent, remove } = useFretboards()
    await load()
    addCurrent()
    const survivingId = fretboards.value[1].id
    remove(0)
    expect(fretboards.value).toHaveLength(1)
    expect(fretboards.value[0].id).toBe(survivingId)
  })

  it('reorders without losing a fretboard', async () => {
    const { fretboards, load, addCurrent, reorder } = useFretboards()
    await load()
    addCurrent()
    const [first, second] = fretboards.value.map(board => board.id)
    reorder(0, 1)
    expect(fretboards.value.map(board => board.id)).toEqual([second, first])
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/composables/useFretboards.test.ts`
Expected: FAIL — `@composables/useFretboards` does not resolve.

- [ ] **Step 4: Add `id` to `FretboardData` and drop the flags**

In `src/stores/usePatternStore.ts`:

Add `id` as the first field of `FretboardData`:

```ts
export interface FretboardData {
  id: string;
  fretAmount: number;
  currentKey: string;
  currentSetup: Setup;
  currentPattern: Pattern;
  currentTonality: Tonality;
  currentAccidental: Accidental;
  currentHighlightNotes: string[];
  currentCAGED: CurrentCAGED;
  currentStrings: CurrentStrings;
  currentChordPosition: number;
}
```

Replace `interface State extends FretboardData { … }` with:

```ts
interface State extends FretboardData {
  isSidebarActive: boolean;
}
```

Add `id: ''` as the first field of `defaultData`, and change the state initialiser to drop the three flags:

```ts
  state: (): State => ({
    isSidebarActive: true,
    ...defaultData
  }),
```

Add `id: state.id` as the first field of the `currentFretboardData` getter's returned object.

Delete `toggleSidebarStatus()`, `toggleTonalityStatus()` and `toggleResetStatus()`, and delete the `this.toggleResetStatus()` calls at the end of `resetToDefault()` and `loadFromFretboardData()`. Add `this.id = data.id` to `loadFromFretboardData()`.

- [ ] **Step 5: Write the composable**

Create `src/composables/useFretboards.ts`:

```ts
import { ref } from 'vue'
import { getScale } from '@data/intervals'
import { fetchCurrentFretboard, fetchFretboards, saveCurrentFretboard, saveFretboards } from '@services/customizerService'
import { FretboardData, usePatternStore } from '@stores/usePatternStore'

/** A fretboard plus the boolean-per-fret rows the renderer needs. */
export interface RenderedFretboard extends FretboardData {
  E: boolean[]
  A: boolean[]
  D: boolean[]
  G: boolean[]
  B: boolean[]
  e: boolean[]
}

/** Attaches the rendered scale rows to a fretboard's settings. */
const render = (fretboard: FretboardData): RenderedFretboard => ({
  ...structuredClone(fretboard),
  ...getScale(fretboard.currentTonality, fretboard.currentPattern, fretboard.currentKey),
})

/** Drops the render rows, leaving only what gets persisted. */
const toStored = (fretboard: RenderedFretboard): FretboardData => {
  const { E, A, D, G, B, e, ...stored } = fretboard
  return structuredClone(stored)
}

export const useFretboards = () => {
  const store = usePatternStore()

  const fretboards = ref<RenderedFretboard[]>([])
  const currentIndex = ref(0)
  const isEditing = ref(true)

  const persist = () => {
    saveFretboards(fretboards.value.map(toStored))
  }

  const load = async () => {
    const current = await fetchCurrentFretboard()
    if (current) store.loadFromFretboardData({ ...current, id: current.id || crypto.randomUUID() })

    const stored = await fetchFretboards()
    if (stored && stored.length > 1) {
      // Fretboards saved before ids existed get one on the way in.
      fretboards.value = stored.map(board => render({ ...board, id: board.id || crypto.randomUUID() }))
      currentIndex.value = 0
      isEditing.value = false
      persist()
      return
    }

    fretboards.value = []
    addCurrent()
  }

  const addCurrent = () => {
    store.id = crypto.randomUUID()
    fretboards.value.push(render(store.currentFretboardData))
    currentIndex.value = fretboards.value.length - 1
    isEditing.value = true
    persist()
  }

  const updateCurrent = () => {
    if (fretboards.value.length === 0) return
    fretboards.value[currentIndex.value] = render(store.currentFretboardData)
    saveCurrentFretboard(store.currentFretboardData)
    persist()
  }

  const select = (index: number) => {
    currentIndex.value = index
    isEditing.value = true
    store.loadFromFretboardData(toStored(fretboards.value[index]))
  }

  const remove = (index: number) => {
    fretboards.value.splice(index, 1)
    if (currentIndex.value >= fretboards.value.length) {
      currentIndex.value = Math.max(0, fretboards.value.length - 1)
    }
    if (fretboards.value.length === 1) {
      currentIndex.value = 0
      isEditing.value = true
      select(0)
      saveCurrentFretboard(store.currentFretboardData)
    }
    persist()
  }

  const reorder = (oldIndex: number, newIndex: number) => {
    const [moved] = fretboards.value.splice(oldIndex, 1)
    fretboards.value.splice(newIndex, 0, moved)
    persist()
  }

  return { fretboards, currentIndex, isEditing, load, addCurrent, updateCurrent, select, remove, reorder }
}
```

- [ ] **Step 6: Run the composable tests to verify they pass**

Run: `npx vitest run tests/composables/useFretboards.test.ts`
Expected: PASS.

- [ ] **Step 7: Extract `FretboardControls.vue`**

Create `src/components/FretboardControls.vue` holding the setup, pattern, tonality and key selectors that currently live inline in `MainPage.vue:272-324`:

```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Setup, Tonality } from '@data/constants';
import { usePatternStore } from '@stores/usePatternStore';

const patternStore = usePatternStore();
const { allKeys, allPatterns, currentKey, currentSetup, currentPattern, currentTonality } = storeToRefs(patternStore);

const onChangeSetup = () => {
    patternStore.setDefaultPattern(currentSetup.value);
    patternStore.updateCurrentHighlightNotes();
};
</script>

<template>
    <div class="selector-wrapper mb-3">
        <div class="switch-setup switch-radio me-2 fw-bold">
            <label v-for="setup in [Setup.Scale, Setup.Chord]" :key="setup">
                <input type="radio" name="setup" :value="setup" v-model="currentSetup" @change="onChangeSetup()">
                    <div class="label px-2 py-1">{{ setup }}</div>
                </input>
            </label>
        </div>

        <div v-for="pattern in allPatterns" :key="pattern" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="scales" :value="pattern" v-model="currentPattern" @change="patternStore.updateCurrentHighlightNotes()">
                    <span class="label px-3">{{ pattern }}</span>
                </input>
            </label>
        </div>
    </div>

    <div class="selector-wrapper mb-3">
        <div class="switch-tonality switch-radio me-2 fw-bold">
            <label v-for="tonality in [Tonality.MAJOR, Tonality.MINOR]" :key="tonality">
                <input type="radio" name="tonality" :value="tonality" v-model="currentTonality" @change="patternStore.updateCurrentHighlightNotes()">
                    <div class="label px-2 py-1"> {{ tonality }} </div>
                </input>
            </label>
        </div>

        <div v-for="key in allKeys" :key="key" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="keys" :value="key" v-model="currentKey">
                    <span class="label"> {{ key }} </span>
                </input>
            </label>
        </div>
    </div>
</template>

<style scoped lang="scss">
.selector-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.switch-setup, .switch-tonality {
    display: flex;
    left: 0;
}

.custom-radio {
    min-width: 50px;
}

.custom-radio input {
    display: none;
}

.custom-radio input:checked + .label {
    border: 3px solid $yellow;
    border-radius: 9px;
    padding: 5px;
    color: $yellow;
    cursor: pointer;
}

.custom-radio span {
    cursor: pointer;
}
</style>
```

- [ ] **Step 8: Rewrite `MainPage.vue`'s script block**

Replace everything between `<script setup lang="ts">` and `</script>` in `src/components/MainPage.vue` with:

```ts
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Sortable from 'sortablejs';
import { Setup } from '@data/constants';
import { getBarPositions, getChordPositionIndexes, getChordPositions } from '@data/chords';
import { useFretboards } from '@composables/useFretboards';
import { usePatternStore } from '@stores/usePatternStore';
import MyFretboard from '@components/MyFretboard.vue';
import FretboardControls from '@components/FretboardControls.vue';
import Done from '@assets/icons/Done.vue';
import Edit from '@assets/icons/Edit.vue';
import Trash from '@assets/icons/Trash.vue';

const patternStore = usePatternStore();
const { fretAmount, currentChordPosition, isSidebarActive } = storeToRefs(patternStore);
const { fretboards, currentIndex, isEditing, load, addCurrent, updateCurrent, select, remove, reorder } = useFretboards();

const draggableList = ref<HTMLElement | null>(null);

// Replaces the old hasSidebarUpdated / hasTonalityUpdated / hasReset boolean
// flags: watch the state that actually changed instead of a toggle that stands
// in for it.
watch(
    () => patternStore.currentFretboardData,
    () => {
        updateCurrent();
        isEditing.value = true;
    },
    { deep: true },
);

onMounted(async () => {
    await load();

    if (draggableList.value) {
        Sortable.create(draggableList.value, {
            animation: 150,
            onEnd: ({ oldIndex, newIndex }) => {
                if (oldIndex === undefined || newIndex === undefined) return;
                reorder(oldIndex, newIndex);
            },
        });
    }
});
```

Two things to know about that watcher. It fires during `load()` and `select()` too, because both write to the store — which is why `updateCurrent()` guards on an empty list and why writing the freshly-selected fretboard back over itself is harmless. And `currentFretboardData` is a getter that builds a new object on every read, so `deep: true` makes the watcher fire whenever any field it reads changes. That is the intent; do not "optimise" it into a shallow watch.

- [ ] **Step 9: Rewrite `MainPage.vue`'s template**

Replace everything between `<template>` and `</template>` with:

```html
    <div class="my-guitar mt-4">
        <div ref="draggableList">
            <div v-for="(fretboard, index) in fretboards"
                class="mt-4 fretboard"
                :class="{ 'selected-fretboard': fretboards.length > 1 && index === currentIndex && isEditing }"
                :id="`fretboard-${fretboard.id}`"
                :key="fretboard.id"
            >
                <FretboardControls v-if="index === currentIndex && isEditing" />

                <div class="my-fretboard" :class="{ 'active-fretboard': index === currentIndex && !isEditing && isSidebarActive }">
                    <div class="d-flex flex-column justify-content-center align-items-center mx-4">
                        <h5 class="text-yellow">{{ fretboard.currentKey }} {{ fretboard.currentTonality }}</h5>
                        <small class="text-yellow">{{ fretboard.currentPattern }}</small>
                    </div>
                    <MyFretboard
                        :fretAmount="fretboard.fretAmount"
                        :currentPattern="fretboard.currentPattern"
                        :currentKey="fretboard.currentKey"
                        :currentTonality="fretboard.currentTonality"
                        :currentAccidental="fretboard.currentAccidental"
                        :currentHighlightNotes="fretboard.currentHighlightNotes"
                        :currentCAGED="fretboard.currentCAGED"
                        :currentStrings="fretboard.currentStrings"
                        :isChordFocused="fretboard.currentSetup === Setup.Chord"
                        :chordPositions="getChordPositions(fretboard.currentPattern, fretboard.currentKey, fretboard.currentChordPosition)"
                        :barPositions="getBarPositions(fretboard.currentPattern, fretboard.currentKey, fretboard.currentChordPosition)"
                        :E="fretboard.E"
                        :A="fretboard.A"
                        :D="fretboard.D"
                        :G="fretboard.G"
                        :B="fretboard.B"
                        :e="fretboard.e"
                    />
                    <template v-if="fretboards.length > 1 && (!isEditing || index !== currentIndex)">
                        <div class="action-icon edit-icon" @click="select(index)"><Edit/></div>
                        <div class="action-icon trash-icon" @click="remove(index)"><Trash/></div>
                    </template>
                    <div v-else class="mx-5"></div>
                </div>

                <div v-if="fretboards.length > 1 && isEditing && index === currentIndex"
                    class="finish-editing"
                    @click="isEditing = false"
                >
                    <Done/>
                </div>

                <!-- Chord Positions -->
                <div v-if="fretboard.currentSetup === Setup.Chord" class="mt-2">
                    <span class="me-1 text-yellow fw-bold">Chord Positions</span>
                    <div v-for="position in getChordPositionIndexes(fretboard.currentPattern, fretboard.currentKey)" :key="position" class="d-inline-block custom-radio">
                        <label class="d-flex flex-column">
                            <input type="radio" name="chordPositions" :value="position" v-model="currentChordPosition">
                                <span class="label px-3">{{ position + 1 }}</span>
                            </input>
                        </label>
                    </div>
                </div>

                <!-- Fret Amount Selector -->
                <div v-if="index === currentIndex && isEditing" class="mt-3">
                    <span class="me-3 text-yellow fw-bold">Number of Frets</span>
                    <input type="range" min="12" max="24" step="1" v-model.number="fretAmount">
                    <span class="ms-3 text-yellow fw-bold">{{ fretAmount }}</span>
                </div>
            </div>
        </div>

        <h2 @click="addCurrent" class="text-yellow"> + </h2>
    </div>
```

Delete the `.selector-wrapper`, `.switch-setup`, `.switch-tonality` and `.custom-radio` rules from `MainPage.vue`'s `<style>` block — they moved to `FretboardControls.vue`. Keep `.custom-radio` if the chord-position selector still needs it; if so, leave that one rule in place in both files.

- [ ] **Step 10: Update the other `toggleSidebarStatus` call sites**

`SideBar.vue` still calls `patternStore.toggleSidebarStatus()` in four places after Task 6. Delete every `patternStore.toggleSidebarStatus(); ` prefix from its `@change` handlers — the deep watcher in `MainPage.vue` now covers them. The accidental radio keeps `@change="patternStore.updateToEqualAccidental()"`.

Then confirm nothing references the removed API:

```bash
grep -rn "toggleSidebarStatus\|toggleTonalityStatus\|toggleResetStatus\|hasSidebarUpdated\|hasTonalityUpdated\|hasReset" src/
```
Expected: no output.

- [ ] **Step 11: Correct the string-row prop types**

The string rows have always been `boolean[]` — `getScale` returns booleans — but `MyFretboard.vue` and `MyString.vue` both declare them as `string[]`. `"strict": false` hid the mismatch; `RenderedFretboard` now types them honestly, so the props must agree or `vue-tsc` will reject the binding.

In `src/components/MyFretboard.vue`, change the six row props (lines 20-25):

```ts
    E: boolean[],
    A: boolean[],
    D: boolean[],
    G: boolean[],
    B: boolean[],
    e: boolean[],
```

In `src/components/MyString.vue`, change one prop:

```ts
    stringData: boolean[],
```

`stringData` is bound with `v-model` to a checkbox, so `boolean[]` is what it wanted all along. Then update `baseProps` in `tests/components/MyString.test.ts` — `new Array(24).fill(false)` is already `boolean[]`, so only the cast on `currentHighlightNotes` may need adjusting.

- [ ] **Step 12: Run the tests**

Run: `npm test`
Expected: PASS.

- [ ] **Step 13: Verify the whole flow in the running app**

Run: `npm run dev` and walk through:
1. Change key, pattern, tonality and fret count — the fretboard updates as before.
2. Add a second fretboard **in the same key** as the first. Both render correctly and independently (this is the `:key` bug from finding 14).
3. Drag to reorder. Reload. The order persists.
4. Delete one. Reload. It stays deleted.
5. Switch to Library, load a card, switch back.
6. Sidebar toggles (notes, CAGED, strings) still update the selected fretboard.

- [ ] **Step 14: Confirm the build passes**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 15: Commit**

```bash
git add src/composables src/components/MainPage.vue src/components/FretboardControls.vue src/components/SideBar.vue src/stores/usePatternStore.ts vite.config.ts tsconfig.json tests/composables/
git commit -m "refactor: extract useFretboards and FretboardControls from MainPage; give fretboards stable ids"
```

---

### Task 9: Dead configuration, strict TypeScript, and CLAUDE.md

**Files:**
- Modify: `package.json`
- Delete: `database/all-scales.json` (and the `database/` directory)
- Modify: `src/components/MyFretboard.vue:28-29`
- Modify: `tsconfig.json`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Confirm the dependencies really are unused**

```bash
grep -rn "axios" src/ ; grep -rn "lodash" src/ ; grep -rn "all-scales\|json-server" src/
```
Expected: after Tasks 3 and 8, no output at all. If `lodash` still appears, that call site was missed — fix it before continuing.

- [ ] **Step 2: Clean up `package.json`**

- Remove `axios` from `dependencies` — nothing imports it; `apiAdapter.ts` uses `fetch`.
- Remove `scss` (`^0.2.4`) from `dependencies` — it is an unrelated abandoned package. `sass` is what Vite actually uses.
- Remove `lodash` from `dependencies` — replaced by `structuredClone`.
- Move `gh-pages` from `dependencies` to `devDependencies`.
- Remove the `"json-server"` script.

Then:

```bash
npm install
```

- [ ] **Step 3: Delete the dead database**

```bash
git rm -r database/
```

Its contents (`currentScale`, `currentKey`) match no endpoint `apiAdapter.ts` requests.

- [ ] **Step 4: Fix the sparse counter array in `MyFretboard.vue`**

Replace lines 28-29:

```ts
const MAX_FRETS = 24;
const fretPositions = Array.from({ length: MAX_FRETS }, (_, index) => index);
const fretIndicatorIndexes = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
```

and in the template change `v-for="(_, index) in fretIndicator"` to `v-for="index in fretPositions"`.

- [ ] **Step 5: Turn on strict TypeScript**

In `tsconfig.json`, set:

```json
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
```

- [ ] **Step 6: Fix what strict mode surfaces**

Run: `npm run build`

Expect errors. Fix each one properly — do not add `any` or `@ts-ignore`. Known offenders:
- `degreeInPattern` in `constants.ts` returns `Degree[] | undefined` because several `case` branches fall through when neither tonality matches. Give it an explicit `default` return and a `Degree[]` return type.
- `allKeys` in `usePatternStore.ts` has the same shape — it returns `undefined` if the tonality is neither MAJOR nor MINOR. Make the minor branch the `else`.
- `findRelativeMajor` / `findRelativeMinor` return `string | undefined`. Return `currentKey` unchanged as the fallback.
- Index signatures like `props.currentStrings[props.stringName]` need `stringName` typed as `StringName` (exported by Task 2) rather than `string`.
- The unused `Pattern` import in `MainPage.vue:3` and the unused `tonality` parameters removed in Task 3 will now be flagged if any remain.

If a fix turns out to be larger than a few lines, revert `tsconfig.json` to `"strict": false`, commit Steps 1-4, and raise strict mode as its own follow-up task rather than blocking this one.

- [ ] **Step 7: Rewrite the stale sections of `CLAUDE.md`**

Four sections are wrong today and must be corrected:

1. **Development Commands** — delete the `npm run json-server` row, the "Typical workflow: open two terminals" paragraph, and the claim that "The app will fail silently if `npm run json-server` is not running." None of it is true; persistence is localStorage by default.
2. **Service Layer** — replace the `service.ts` (axios) entry with: `customizerService.ts` selects between `adapters/localStorageAdapter.ts` and `adapters/apiAdapter.ts` via `VITE_USE_API`, both implementing the `StorageAdapter` interface in `services/storageAdapter.ts`.
3. **Data Layer** — the path is `src/lib/music-theory/`, **not** `src/components/data/`. Update the file list: `constants.ts` (enums plus the `DEGREES`, `degreeToNumber`, `degreeCssClass` and `STRING_NAMES` tables), `intervals.ts` (`getIntervals`, `getScale`), `noteNames.ts`, `CAGED.ts` (`CAGED_SHAPES`, `isCAGED`, `getCAGEDName`), `chords.ts`.
4. **Component Hierarchy** and **State Management** — add `LibraryPage.vue`, `FretboardControls.vue`, `src/composables/useFretboards.ts` and `src/stores/useLibraryStore.ts`. Remove the "Pattern list from JSON server" bullet and the `hasSidebarUpdated`-era flags.

Also add a **Testing** section: `npm test` runs Vitest once, `npm run test:watch` watches. Tests live in `tests/`, mirroring `src/`.

- [ ] **Step 8: Run the full suite**

Run: `npm test && npm run build`
Expected: both exit 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: drop unused deps and dead json-server config; refresh CLAUDE.md"
```

---

## Open Questions

Raise these with the user rather than deciding unilaterally — each is a behaviour question, not a code-quality one.

1. **The CAGED minor offset disagreement.** `isCAGED` shifts by `minorKeyToNumber[key]`; `isCAGEDNameHere`/`GetCAGEDName` shift by `majorKeyToNumber[key] - 3`. These are consistently 6 semitones apart — a tritone — so in minor keys the shape *windows* and the shape *labels* cannot both be right. Task 5 preserves both offsets exactly and comments the discrepancy. Someone who plays guitar needs to say which one is correct.

2. **Chord voicings ignore the chord type** (finding 19). `getChordPositions` and `getBarPositions` in `chords.ts` accept a `chord: Pattern` argument and never read it, so a Seventh, Add9, Add11, Add13, Dominant and Power chord all render the same triad shapes. `getChordPositionIndexes` likewise ignores both arguments and hardcodes `[0, 1, 2]`. This is unfinished feature work, not duplication, so no task in this plan touches it — but the dead parameters are worth deleting or filling in.

3. **`currentChordPosition` is global, rendered per fretboard.** `MainPage.vue` binds the chord-position radios to the store-wide `currentChordPosition` while rendering one radio group per fretboard. With several chord fretboards on screen, changing one changes them all. Task 8 preserves this; fixing it means moving the field out of the shared store.

4. **`Pattern.Sixth` and `Pattern.Suspended`** are commented out in `constants.ts:28,34`. Delete them or implement them.

---

## Effort and sequencing

| Phase | Tasks | What it buys |
|-------|-------|--------------|
| 1 — Safety net | 1 | Nothing user-visible; makes everything after it verifiable |
| 2 — Music theory core | 2, 3, 4 | ~200 lines gone, 2 confirmed bugs fixed, the render loop gets ~26× cheaper per fret |
| 3 — Presentation | 5, 6 | ~150 lines gone, one source of truth for sidebar state |
| 4 — Structure | 7, 8 | `MainPage.vue` 485 → ~120 lines, stable fretboard identity, the flag event-bus removed |
| 5 — Hygiene | 9 | 4 dead dependencies gone, strict TS on, docs match reality |

Phases 1 and 2 are the ones that matter. If the work has to stop somewhere, stop after Task 4 — that is a coherent, shippable improvement on its own.
