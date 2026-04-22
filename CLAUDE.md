# CLAUDE.md

## Project Overview

**FretWizard** is an interactive web-based guitar fretboard visualization tool built with Vue 3, TypeScript, and Vite. It enables musicians to explore scales, chords, patterns (including CAGED system), and transpose them across different keys and tonalities.

**Key Goals:**
- Simplify learning music theory through interactive visualization
- Provide responsive fretboard rendering across devices
- Maintain persistence of user customizations (theme, visible strings, layout)

**Demo:** https://devjhom.github.io/fret-wizard/

**Tech Stack:** Vue 3, TypeScript, Vite 5, Pinia, Bootstrap 5, SCSS, Axios, SortableJS, JSON Server, GitHub Pages

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (hot reload enabled) |
| `npm run build` | TypeScript type check with `vue-tsc` + Vite production build (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run json-server` | Start JSON server for music database (listens on `http://localhost:3000`) |
| `npm run deploy` | Deploy to GitHub Pages (`/fret-wizard/` base path) |

**Typical workflow:** Open two terminals:
1. Terminal 1: `npm run json-server` (required for data fetching)
2. Terminal 2: `npm run dev`

The app will fail silently if `npm run json-server` is not running. Always start it before `npm run dev`.

## Architecture & Component Structure

### Component Hierarchy
```
DefaultLayout.vue (theme toggle, orientation detection)
├── MainPage.vue (sidebar + fretboard controller)
│   ├── SideBar.vue (pattern/key selection, controls)
│   ├── MyFretboard.vue (renders single fretboard)
│   │   └── MyString.vue (renders individual strings)
│   └── RotateMessage.vue (portrait mode notice)
```

### Service Layer
- **`customizerService.ts`** — LocalStorage persistence (theme, fretboard state, visible strings)
- **`service.ts`** — Axios HTTP client for JSON server (fetches scales/chords from `database/all-scales.json`)

### Data Layer (Music Theory)
Located in `src/components/data/`:
- **`constants.ts`** — Enums (Pattern, Tonality, Setup, Accidental, Degree), note arrays for all key/tonality/accidental combos, degree-to-pattern lookup tables, key-to-number mappings
- **`intervals.ts`** — Fret positions for each interval/degree on each string, accounts for 3 octaves per string. Functions: `getRoots()`, `getSeconds()`, `getThirds()`, etc.
- **`noteNames.ts`** — Note naming and enharmonic equivalents (C♯ vs D♭). Functions: `getNoteName()`, `findRelativeMajor()`, `findRelativeMinor()`
- **`CAGED.ts`** — CAGED system shape definitions with pre-defined fret ranges. Function: `isCAGED()` checks if fret matches active shapes
- **`chords.ts`** — Chord voicing positions (root position, inversions). Functions: `getChordPositions()`, `getBarPositions()`

### State Management (Pinia Store)
Single store in `src/stores/usePatternStore.ts` — source of truth for:
- Current pattern, key, tonality, accidental selection
- Fretboard visibility state (visible strings, active frets, fret amount 0-24)
- CAGED shape toggles (C, A, G, E, D)
- Chord position/voicing variant
- Pattern list from JSON server

**Store usage pattern:**
```typescript
import { usePatternStore } from '@stores/usePatternStore'
import { storeToRefs } from 'pinia'

const store = usePatternStore()
const { currentKey, currentPattern } = storeToRefs(store)  // Reactive refs
store.updatePattern('Pentatonic')  // Action call
```

**Key getters:** `allPatterns` (patterns for current setup), `allKeys` (keys based on tonality/accidental), `highlightNotes` (degrees in current pattern)

**Key actions:** `updateTonality()`, `updateToEqualAccidental()`, `updateCurrentHighlightNotes()`, `resetToDefault()`

## Key Files & Their Purposes

| File | Purpose |
|------|---------|
| `src/main.ts` | Vue app initialization, Pinia store setup |
| `src/App.vue` | Root component, imports DefaultLayout |
| `vite.config.ts` | Path aliases, GitHub Pages base path (`/fret-wizard/`), SCSS auto-import, Vite plugins |
| `tsconfig.json` | CompilerOptions for path aliases and Vue 3 |
| `database/all-scales.json` | Central music theory database (served by json-server) |
| `src/assets/scss/variables.scss` | Global color, spacing, font variables (interval-specific colors) |
| `src/assets/scss/main.scss` | Root styles, dark/light theme definitions |

## Conventions & Patterns

### Path Aliases
Configured in `vite.config.ts` and `tsconfig.json`. **Always use aliases in imports:**
- `@/` → `src/`
- `@components/` → `src/components/`
- `@data/` → `src/components/data/`
- `@stores/` → `src/stores/`
- `@services/` → `src/services/`
- `@assets/` → `src/assets/`
- `@scss/` → `src/assets/scss/`
- `@images/` → `src/assets/images/`

✅ `import { MAJOR_SCALE } from '@data/intervals'`
❌ `import { MAJOR_SCALE } from '../../components/data/intervals'`

### Composition API & `<script setup>`
All components use Vue 3 Composition API with `<script setup lang="ts">` syntax. **Do not use Options API.**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

### Global SCSS
Variables from `src/assets/scss/variables.scss` are **auto-imported** in all components via Vite configuration. **No explicit `@import` needed** in component `<style>` blocks.

### Styling
- Use `<style scoped lang="scss">` in components
- Bootstrap utility classes combined with custom SCSS
- BEM-like selectors for custom elements
- Color palette: Dark theme (blacks, grays, bright accents) and light theme (light grays, darker text)
- Interval-specific colors defined in `variables.scss` (reds, oranges, greens, cyans, blues)

### Naming Conventions
- **Components:** PascalCase (`MainPage.vue`, `MyFretboard.vue`)
- **Functions:** camelCase (`getBasePattern()`, `updateTonality()`)
- **Variables/Constants:** camelCase for variables, UPPER_CASE for true constants
- **Store actions:** action verbs (`updatePattern()`, `toggleSidebarStatus()`)
- **Props:** typed via `defineProps<T>()`

### Responsive Design
- App detects portrait mode via `window.matchMedia("(orientation: landscape)")` and shows `RotateMessage.vue`
- Requires landscape orientation for full fretboard functionality
- Uses Bootstrap breakpoints with custom SCSS variables
- Test both orientations during development

### Persistence Strategy
- **UI State** → LocalStorage via `customizerService` (theme, visible strings, fretboard list)
- **Music Data** → JSON server (scales, chords, intervals) — read-only from client
- Theme preference persisted and applied via class binding on root element

### Drag-and-Drop
SortableJS is used for reordering multiple fretboards. When modifying fretboard list handling, ensure `MyFretboard` components maintain stable `key` bindings in `v-for` loops.

### Music Theory Implementation
- Key transposition via array rotation (shifting notes based on key number)
- Base patterns stored for C major / A minor, then shifted
- 6 strings (E, A, D, G, B, e) with standard tuning, up to 24 frets
- Fret indicators at positions 3, 5, 7, 9, 12, 15, 17, 19, 21, 24
- Notes rendered as colored dots based on interval type
- Accidental support for both sharp (♯) and flat (♭) notation

## Common Development Patterns

### Adding a New Pattern Type
1. Define the pattern in `src/components/data/intervals.ts` or `chords.ts`
2. Add enum value in `constants.ts` if needed
3. Update the music database `database/all-scales.json`
4. Add pattern option to `SideBar.vue` dropdown
5. Ensure `MainPage.vue` fetches and displays it via the store
6. Test with both single and multiple fretboards

### Customizing the Fretboard
1. Edit fretboard rendering in `MyFretboard.vue` (DOM structure)
2. Style with component `<style scoped>` or relevant SCSS files
3. Update `customizerService` if persisting new settings

### Working with the Store
```typescript
import { usePatternStore } from '@stores/usePatternStore'

const store = usePatternStore()
const currentKey = computed(() => store.selectedKey)
store.updatePattern('Major Pentatonic')
```

## Potential Pitfalls

1. **Missing json-server** — The app will fail silently if `npm run json-server` is not running. Always start it before `npm run dev`.

2. **Breaking TypeScript checks** — `npm run build` includes `vue-tsc` which is strict. Ensure all `.ts` and `.vue` files have proper type annotations.

3. **Path aliases not working** — If imports fail, verify both `vite.config.ts` and `tsconfig.json` are in sync.

4. **LocalStorage pollution** — The `customizerService` uses hardcoded keys. Changing key names breaks backward compatibility. Add migration logic if renaming.

5. **Fretboard re-rendering** — Vue's reactivity requires proper key binding in `v-for` loops. SortableJS modifications need stable component IDs.

6. **GitHub Pages base path** — The app is deployed to `/fret-wizard/`, not root. Relative asset paths must account for this. Vite config already handles this.

7. **Data layer separation** — Keep music theory logic in `src/components/data/`. Don't mix interval/chord calculations with UI rendering code.

## Guidelines for AI Assistance

- Always run `npm run build` before assuming changes work (catches TypeScript errors)
- Use path aliases consistently — never relative paths
- Test responsiveness — check portrait mode alongside landscape
- Update LocalStorage keys carefully — breaking changes affect existing users
- Preserve the data layer abstraction — music theory logic stays in `src/components/data/`
- When adding new patterns/chords, follow the full flow: data definition → constants → store → sidebar → fretboard
- Multiple fretboards can exist simultaneously — test changes with both single and multiple fretboards
