# Note Spelling Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. The main session implements the plan inline, stopping after each phase with a short status.

**Goal:** Spell every note name from the root and the interval, so C minor shows E♭ (not D♯) and F major shows B♭ (not A♯). Then remove the Accidental selector from the Chord page: each black-key root gets one standard name chosen for the chord type, so no chord ever needs a double sharp or double flat.

**Architecture:** All spelling lives in `src/lib/music-theory/noteNames.ts`. The letter-and-offset speller already in `progressions.ts` (`spellNote`) moves there and both pages share it. `getNoteName()` spells from the key instead of looking the pitch up in the ♯ or ♭ list. A new chord-root table names the root on the Chord page. Components only change which names they show and which controls they render.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, Vitest.

## Global Constraints

- Saved data keeps its shape and meaning. `currentAccidental` stays on `FretboardData` (saved cards and the backend's validation carry it); the Chord page just stops reading or changing it. No localStorage key or backend change.
- `currentKey` stays a root name from `majorKeyToNumber`, so every existing pitch lookup (`majorKeyToNumber[currentKey]`) keeps working.
- Music theory stays in `src/lib/music-theory/`. Path aliases only. CRLF line endings (`unix2dos -q` on new or sed-edited files).
- `npm test` and `npm run build` pass after every task.

## Decisions (defaults used unless the user says otherwise)

1. **Chord root names.** Black-key roots on the Chord page are named by chord type:

   | Chord type | C♯/D♭ | D♯/E♭ | F♯/G♭ | G♯/A♭ | A♯/B♭ |
   |---|---|---|---|---|---|
   | Major-sounding: Triad, 6th, 7th, Add9, Add11 (Major); Dom7, Sus2, Sus4, Power | D♭ | E♭ | F♯ | A♭ | B♭ |
   | Minor: Triad, 6th, 7th, Add9, Add11 (Minor) | C♯ | E♭ | F♯ | G♯ | B♭ |
   | Dim, m7♭5 | C♯ | D♯ | F♯ | G♯ | A♯ |

   Known quirk: D♭7 is spelled D♭ F A♭ C♭. That's correct, but C♯7 is the more common name in sharp keys. Accept it for now.
2. **Scale page keeps its ♯/♭ toggle**, but the toggle now only names the root (C♯ or D♭); every other note follows from the root. In keys nobody writes in, names come out with double accidentals (D♯ major's 3rd is F𝄪). They're correct and only appear if someone picks that key.
3. **Chromatic scale** has no key to spell from, so it keeps following the toggle (♯ list or ♭ list), as today.
4. **Old saved chords** with a key like `A♯` (major) are respelled to the table name (`B♭`) when the Chord stack loads or a Chord card opens, and Chord card labels in the Library show the table name. The pitch never changes.

## Review Focus

1. C minor: C D E♭ F G A♭ B♭ on the neck, tone chips and chord diagrams.
2. Every chord type at all 12 roots: no 𝄪 or 𝄫 anywhere on the Chord page.
3. Switching Major ↔ Minor or chord type on a black-key root relabels the key buttons (D♭ ↔ C♯) and keeps the same pitch selected; the neck doesn't move.
4. The Chord Progression page shows exactly the same names as before (its tests pass unchanged).
5. A saved Chord card with `A♯` major opens as B♭, with the same frets lit.

---

## File map

| File | Change |
|---|---|
| `src/lib/music-theory/noteNames.ts` | Shared speller; `getNoteName` spells from the key; chord-root table and helpers |
| `src/lib/music-theory/progressions.ts` | Imports the speller instead of its private `spellNote` |
| `src/components/MyString.vue`, `PatternSummary.vue`, `VerticalChord.vue` | Pass the pattern to `getNoteName` (for the Chromatic fallback) |
| `src/components/PatternBuilder.vue` | No Accidental field on the Chord page; chord-root labels; checked by pitch |
| `src/components/FretboardPage.vue` | Respell the chord root on root, quality and type changes, and on load |
| `src/lib/libraryView.ts` | Chord card labels use the chord-root name |
| `tests/unit/noteNames.test.ts` (new), `progressions.test.ts`, `libraryView.test.ts` | Tests |
| `CLAUDE.md` | Describe the spelling rule and the Chord page without Accidental |

---

### Task 1: Shared speller

- [ ] In `noteNames.ts`, add `spellInterval(root: string, letterSteps: number, semitones: number)`: the letter is the root's letter moved `letterSteps` up, and the accidental (𝄫 ♭ natural ♯ 𝄪) closes the gap to `majorKeyToNumber[root] + semitones`. This is `progressions.ts`'s `spellNote` moved, with its `letters`, `letterPitches` and `accidentals` tables.
- [ ] Add `degreeLetterSteps: Record<Degree, number>`: roots 0; ♭2, 2: 1; ♭3, 3: 2; 4: 3; ♭5, 5: 4; ♭6, 6: 5; ♭7, 7: 6. The letter steps match the labels in `patternNames.ts` (the tritone is ♭5).
- [ ] `progressions.ts` imports `spellInterval` and drops its copy.
- [ ] Tests (`noteNames.test.ts`): C + ♭3 = E♭, F + 4 = B♭, D♭ + ♭5 = A𝄫, D♯ + 3 = F𝄪; every result's pitch matches root + semitones for all 17 root spellings and all 12 degrees. `progressions.test.ts` passes unchanged.

### Task 2: Note names from the key

- [ ] `getNoteName(degree, key, accidental, pattern?)`: spell with `spellInterval(key, degreeLetterSteps[degree], degreeToNumber[degree])`; for `Pattern.Chromatic`, keep today's lookup in the ♯ or ♭ list.
- [ ] Pass the pattern from `MyString.vue` (already has `currentPattern`), `PatternSummary.vue` and `VerticalChord.vue`.
- [ ] Tests: C minor diatonic is C D E♭ F G A♭ B♭; F major has B♭; C minor blues has G♭; C major blues has both E♭ and E; diatonic scales use each of the 7 letters once in all keys and both tonalities; Chromatic follows the toggle.

### Task 3: Chord root names

- [ ] In `noteNames.ts`, add `chordRoots(pattern, tonality): string[]` (12 names, C first) from the Decision 1 table, and `chordRootName(key, pattern, tonality)`, which returns the table name for that key's pitch.
- [ ] Tests: for every chord type, both tonalities and all 12 roots, the root and every chord tone spell without 𝄪 or 𝄫; spot checks: E♭m (E♭ G♭ B♭), D♯° (D♯ F♯ A), C♯m7♭5 (C♯ E G B), A♭6 (A♭ C E♭ F).

### Task 4: Chord page without Accidental

- [ ] `PatternBuilder.vue`: render the Accidental field only on the Scale page. On the Chord page, the key buttons come from `chordRoots(pattern, tonality)` and a button is checked when its pitch matches the current key's pitch, so a relabel never unchecks it.
- [ ] Re-check the builder grid (`Key | Accidental`, then `Chord | Quality`). With Accidental gone, Key spans the first row and Chord | Quality stay below. Check it at desktop and phone widths.
- [ ] `FretboardPage.vue`: on the Chord page, `onChangeRoot`, `onChangeTonality` and `onChangePattern` write `currentKey: chordRootName(...)` along with their own change. `onChangeAccidental` is only reachable from the Scale page.

### Task 5: Old saves and Library labels

- [ ] `FretboardPage.vue`: in `loadStack` and where a card's stack is copied in (`attachCard`), respell each Chord fretboard's `currentKey` with `chordRootName`. Scale stacks are untouched.
- [ ] `libraryView.ts`: `fretboardLabel` uses `chordRootName` for Chord cards, so search and chips read B♭ for an old `A♯` save.
- [ ] Tests (`libraryView.test.ts`): an `A♯` major Chord fretboard is labelled `B♭`; a Scale fretboard keeps its stored key.

### Task 6: Docs and verification

- [ ] `CLAUDE.md`: note names are spelled from the root and interval (`noteNames.ts`); the Chord page has no Accidental field and names roots by chord type; Chromatic follows the toggle.
- [ ] `npm test`, `npm run build`.
- [ ] Browser check on a fresh `[::1]:<port> --strictPort` origin: C minor on the Scale page shows E♭; the Chord page has no Accidental; switching C♯m to major relabels it D♭ and keeps the frets; Dim on a black key shows sharps; phone width has no sideways scroll. Stop the dev server and its leftover node process afterwards.
