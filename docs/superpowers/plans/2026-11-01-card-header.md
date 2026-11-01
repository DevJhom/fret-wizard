# Card Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, inline, stopping after each phase. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show on the Scale and Chord pages which Library card is open (or that the page is a draft) and whether its edits are saved, so users no longer need the card GUID in the URL to know.

**Architecture:** A new `CardHeader.vue` row sits above `StackBar` inside `.stack-folder` in `FretboardPage.vue`. It takes the open card, its status and a "detached" flag as props and emits rename / close / open-library / save-as-new / dismiss. The status rules and the Save button wording live as small pure helpers in `src/lib/cardSession.ts`, so they can be unit-tested. The repo has no component-test setup, so components are verified by `npm run build` (vue-tsc) and the manual checks listed at the end.

**Tech Stack:** Vue 3 `<script setup>` + TypeScript, Pinia, SCSS, Vitest (happy-dom).

**Spec:** Artifact "Which Card Is Open?" — https://claude.ai/artifact/NChSUyNnm3Qp1YAsxuro2m (state table and copy). Decisions made after it: Close card leaves a **blank draft**, and asks first if there are unsaved changes.

## Global Constraints

- Branch: `card-header` off `master`. No `Co-Authored-By` trailer on commits.
- Copy, exactly:
  - Draft header: `Draft`. Draft chip: `Not in Library`.
  - Linked header: `Library` / `<card name>`. Chips: `Saved`, `Unsaved changes`.
  - Close button: `Close card` (title: `Close this card and start a new draft`).
  - Save button: `Save to Library` (draft), `Saved` (linked, clean, disabled), `Save changes` (linked, dirty).
  - Detached banner: `This card isn't in your Library anymore. Your fretboards are still here as a draft.` Buttons: `Save as New Card`, `Dismiss`.
  - Close confirm: `"<name>" has unsaved changes. Discard them and close this card?`
- Card names: trimmed, `maxlength="80"`, empty or unchanged means no rename. This matches `LibraryCardItem.vue`.
- Phone (`@media (max-width: $phone)`): hide the `Library` crumb label, the separator, the `Close card` label, and the labels on the `Saved` / `Unsaved changes` chips. Keep each one available to screen readers with `.visually-hidden` or `aria-label`. The `Not in Library` chip keeps its label.
- Use the theme tokens from `main.scss` (`--muted-text-color`, `--accent-soft-color`, `--accent-text-color`, `--card-border-color`, `--option-background-color`, `--danger-color`). Don't add literal colors.
- Verification is `npm test` plus `npm run build`. No Playwright or dev-server checks unless the owner asks.

## Review Focus

1. **Card deleted while its page is the remembered workspace card.** Clicking the Scale tab opens `/scale/<deleted id>`, which should land on the detached banner, not a silent draft. Test in Task 4 (`resolveCardRoute` already returns `detach`; add an assertion that the banner flag is set by `detachNotice`).
2. **Renaming to whitespace or the same name.** This should make no store call and put the old name back. Test in Task 2 (`renamedTo`).
3. **Close card with unsaved changes, then Cancel.** The card should stay open with its edits and the URL unchanged. This is a manual check in Task 3, because the confirm happens in the component.
4. **A chord card id in a Scale URL.** It detaches and shows the same banner. That's acceptable; the copy doesn't claim the card was deleted. Covered by the existing `resolveCardRoute` setup-mismatch test, so nothing new.
5. **Save as New from the dropdown while a card is open.** The new card opens with its name field active, and the old card is not renamed. Manual check in Task 5.

---

## Phase 1 — Status helpers, Save wording, header display + rename

### Task 1: Status helpers and Save button wording

**Files:**
- Modify: `src/lib/cardSession.ts` (append)
- Modify: `src/components/SaveMenu.vue`
- Test: `tests/unit/cardSession.test.ts` (append)

**Interfaces:**
- Produces:
  - `export type CardStatus = 'draft' | 'saved' | 'unsaved'`
  - `export const cardStatus = (hasCard: boolean, isDirty: boolean): CardStatus`
  - `export const saveLabel = (status: CardStatus): string`
  - `export const renamedTo = (draft: string, current: string): string | null`, which returns the trimmed name, or `null` when it's empty or equal to `current`

- [ ] **Step 1: Write the failing tests**

```ts
describe('cardStatus', () => {
  it('is a draft with no card, whatever the stack', () => {
    expect(cardStatus(false, false)).toBe('draft')
    expect(cardStatus(false, true)).toBe('draft')
  })
  it('follows isDirty when a card is open', () => {
    expect(cardStatus(true, false)).toBe('saved')
    expect(cardStatus(true, true)).toBe('unsaved')
  })
})

describe('saveLabel', () => {
  it('names what Save will do', () => {
    expect(saveLabel('draft')).toBe('Save to Library')
    expect(saveLabel('saved')).toBe('Saved')
    expect(saveLabel('unsaved')).toBe('Save changes')
  })
})

describe('renamedTo', () => {
  it('trims the new name', () => expect(renamedTo('  Blues  ', 'Card 5')).toBe('Blues'))
  it('ignores an empty or blank name', () => {
    expect(renamedTo('', 'Card 5')).toBeNull()
    expect(renamedTo('   ', 'Card 5')).toBeNull()
  })
  it('ignores an unchanged name', () => expect(renamedTo(' Card 5 ', 'Card 5')).toBeNull())
})
```

- [ ] **Step 2: Run to confirm they fail.** Run `npx vitest run tests/unit/cardSession.test.ts`. Expect FAIL because the imports aren't exported yet.
- [ ] **Step 3: Implement the three helpers** in `cardSession.ts`, next to `sameStack`, each with a one-line comment in the file's style.
- [ ] **Step 4: Use them in `SaveMenu.vue`.** Compute `status = cardStatus(!!props.cardName, props.isDirty)` and replace `isSaved` with `status === 'saved'`. Render three stacked `.save-label` spans in the existing grid cell: `Save to Library`, `✓ Saved`, `Save changes`. Show only the one for the current status, so the button width doesn't change. The dropdown's first item uses `saveLabel(status)` too, falling back to `Save to Library` when the status is `saved` and the item is disabled. Keep `saveTitle`.
- [ ] **Step 5: Use `renamedTo` in `LibraryCardItem.vue`** in place of its inline `trim()` / compare (lines ~51–52).
- [ ] **Step 6: Run `npm test` and `npm run build`.** Expect all tests to pass and the build to finish with no type errors.
- [ ] **Step 7: Commit.** `git commit -m "feat: name what Save does and share card status helpers"`

### Task 2: `CardHeader.vue` with draft / saved / unsaved states and inline rename

**Files:**
- Create: `src/components/CardHeader.vue`
- Modify: `src/components/FretboardPage.vue` (render it, wire events, new `open-library` emit)
- Modify: `src/layout/DefaultLayout.vue:177` (handle `open-library`)

**Interfaces:**
- Consumes: `CardStatus`, `cardStatus`, `renamedTo` from Task 1.
- Produces, used by Tasks 3–5:
  - Props: `cardName?: string`, `status: CardStatus`, `isDetached: boolean`
  - Emits: `rename(name: string)`, `close()`, `open-library()`, `save-as-new()`, `dismiss()`
  - `defineExpose({ startRename })`, where `startRename(): void` opens the name field with all text selected

- [ ] **Step 1: Build the component.** This task covers the non-detached markup only. Use a `<div class="card-header">` holding:
  - `status === 'draft'`: `<span class="draft-name">Draft</span>` plus `<span class="status-chip is-draft">Not in Library</span>`.
  - Otherwise: a crumb `<button class="crumb">` with the library icon and `<span class="crumb-label">Library</span>` that emits `open-library`, a `/` separator, then the name. At rest the name is `<button class="card-name" title="Rename card" :aria-label="`Rename ${cardName}`">` with a pencil that shows on hover/focus. While editing it's `<input class="card-name-input" maxlength="80">`, where Enter or blur commits through `renamedTo(draft, cardName)` and emits `rename` only when the result isn't `null`, and Esc cancels. After the name comes the status chip (`is-saved` with a check plus `Saved`, or `is-unsaved` with a dot plus `Unsaved changes`). `Close card` is a ghost button on the right that emits `close`.
  - Icons are inline SVG, 16px, `stroke="currentColor"`, same as `SaveMenu.vue`. The header is at least 44px tall, which is also the touch-target height.
- [ ] **Step 2: Render it in `FretboardPage.vue`.** Add `const status = computed(() => cardStatus(!!openCard.value, isDirty.value))` next to `isDirty`. Put the header as the first child of `.stack-folder` with `ref="cardHeader"`, `:card-name="openCard?.name"`, `:status="status"`, and `:is-detached="false"` (Task 4 replaces this). Handle events like this: `@rename="name => libraryStore.renameCard(openCard!.id, name)"`, `@open-library="emit('open-library')"`, `@save-as-new="saveAsNewCard"`. Leave `close` and `dismiss` as no-ops until Tasks 3–4. Add `(e: 'open-library'): void` to `defineEmits`. Give the header `margin-bottom: 0.75rem` so the folder tabs still join the card below.
- [ ] **Step 3: In `DefaultLayout.vue`,** add `@open-library="switchView('library')"` to `<FretboardPage>`.
- [ ] **Step 4: Update `CLAUDE.md`.** Add `CardHeader.vue` to the component hierarchy above `StackBar.vue` ("the open card's name, rename, save status, Close card; the draft and detached states"). Update the `SaveMenu.vue` line to list its three labels. Replace "The bar does not name the open card (the Save button's tooltip does)" with a sentence saying the header names it.
- [ ] **Step 5: Run `npm test` and `npm run build`.** Expect both to pass.
- [ ] **Step 6: Commit.** `git commit -m "feat: show the open card and its save state above the stack"`

**Stop here: end of Phase 1.** Report status, then the owner checks the page manually: draft vs linked, renaming, phone width, light/dark.

---

## Phase 2 — Close card and detached banner

### Task 3: Close card returns to a blank draft

**Files:**
- Modify: `src/components/FretboardPage.vue`

**Interfaces:**
- Consumes: the `close` emit from Task 2, plus the existing `clearWorkspaceCardId` and `defaultDataFor`.

- [ ] **Step 1: Add `closeCard(): void`** in `FretboardPage.vue`. If `isDirty` is true and `window.confirm` with the Close confirm copy returns false, return. Otherwise call `clearWorkspaceCardId(props.setup)`, set `stack.value = [defaultDataFor(props.setup)]`, `selectedIndex.value = 0` and `isEditing.value = false`, then `emit('close-card', false)` so Back reopens the card. Wire `@close="closeCard"`. The `cardId` watcher calls `attachCard(null)`, which already returns early, so the blank stack stays.
- [ ] **Step 2: Run `npm run build`.** Expect it to pass.
- [ ] **Step 3: Commit.** `git commit -m "feat: close the open card into a blank draft"`

### Task 4: Banner when the URL's card isn't in the Library

**Files:**
- Modify: `src/lib/cardSession.ts`, `src/components/CardHeader.vue`, `src/components/FretboardPage.vue`
- Test: `tests/unit/cardSession.test.ts`

**Interfaces:**
- Produces: `export const detachNotice = (action: CardRouteAction): boolean`, which is `true` only for `'detach'`. It's a named seam so the banner rule has a test next to `resolveCardRoute`.

- [ ] **Step 1: Write the failing test.**

```ts
describe('detachNotice', () => {
  it('flags a card the Library no longer has, including the remembered workspace card', () => {
    expect(detachNotice(resolveCardRoute('gone', Setup.Scale, cards, 'gone'))).toBe(true)
    expect(detachNotice(resolveCardRoute('c1', Setup.Scale, cards, null))).toBe(true)
    expect(detachNotice(resolveCardRoute('s1', Setup.Scale, cards, 's1'))).toBe(false)
    expect(detachNotice(resolveCardRoute('s2', Setup.Scale, cards, 's1'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run to confirm it fails, then implement `detachNotice`, then run again to confirm it passes.** Use `npx vitest run tests/unit/cardSession.test.ts`.
- [ ] **Step 3: Track the detached state in `FretboardPage.vue`.** Add `isDetached = ref(false)`. In `attachCard`, set `isDetached.value = detachNotice(action)` before the existing detach branch runs. Clear it when a card attaches (the `load`/`keep` path), in `saveAsNewCard` after the card is created, and on `dismiss`. Pass `:is-detached="isDetached"` and wire `@dismiss="isDetached = false"`.
- [ ] **Step 4: Add the banner to `CardHeader.vue`.** When `isDetached`, render the banner in place of the header row: a warning icon in `--danger-color`, the detached copy, a primary `Save as New Card` button that emits `save-as-new`, and `Dismiss`, which emits `dismiss`. The background is `color-mix(in srgb, var(--danger-color) 8%, transparent)` and the buttons wrap below the text on phones. After Dismiss, the draft header shows.
- [ ] **Step 5: Update `CLAUDE.md`.** Replace "and has no way to close it: the page stays on its card until another card is opened or the card is deleted" with a description of Close card (a blank draft, which asks first over unsaved edits) and the detached banner.
- [ ] **Step 6: Run `npm test` and `npm run build`.** Expect both to pass.
- [ ] **Step 7: Commit.** `git commit -m "feat: explain when the linked card is no longer in the Library"`

**Stop here: end of Phase 2.** Owner checks: Close with and without edits (and Cancel), deleting the open card on the Library page and then clicking the Scale tab, Back after Close.

---

## Phase 3 — Naming new cards, tab title

### Task 5: A new card opens with its name field active

**Files:**
- Modify: `src/components/FretboardPage.vue`

**Interfaces:**
- Consumes: `startRename()` exposed by `CardHeader` (Task 2).

- [ ] **Step 1: Add `pendingRenameId = ref<string | null>(null)`** and set it to `card.id` in `saveAsNewCard` right after `createCard`. This covers Save on a draft, Save as a New Card, and the banner button.
- [ ] **Step 2: Add a watcher.** `watch(() => openCard.value?.id, id => { if (id && id === pendingRenameId.value) { pendingRenameId.value = null; nextTick(() => cardHeader.value?.startRename()) } })`. The id changes only after `DefaultLayout.navigate` updates `cardId`, so the header is already showing the new card when this runs.
- [ ] **Step 3: Run `npm run build`.** Expect it to pass.
- [ ] **Step 4: Commit.** `git commit -m "feat: ask for a name right after saving a new card"`

### Task 6: Browser tab title names the card (optional; skip if the owner declines)

**Files:**
- Modify: `src/lib/cardSession.ts`, `src/components/FretboardPage.vue`
- Test: `tests/unit/cardSession.test.ts`

**Interfaces:**
- Produces: `export const pageTitle = (pageName: string, cardName: string | undefined, status: CardStatus): string`

- [ ] **Step 1: Write the failing test.**

```ts
describe('pageTitle', () => {
  it('names the page, and the card when one is open', () => {
    expect(pageTitle('Scale', undefined, 'draft')).toBe('Scale · FretWizard')
    expect(pageTitle('Scale', 'Blues', 'saved')).toBe('Blues · Scale · FretWizard')
    expect(pageTitle('Chord', 'Blues', 'unsaved')).toBe('• Blues · Chord · FretWizard')
  })
})
```

- [ ] **Step 2: Run to confirm it fails, then implement `pageTitle`, then run again to confirm it passes.**
- [ ] **Step 3: Set the title from `FretboardPage.vue`.** Add `watchEffect(() => document.title = pageTitle(props.setup === Setup.Scale ? 'Scale' : 'Chord', openCard.value?.name, status.value))` and reset it to `FretWizard` in `onBeforeUnmount`, so the Library and Progression pages keep the plain title.
- [ ] **Step 4: Run `npm test` and `npm run build`, then commit.** `git commit -m "feat: show the open card in the browser tab title"`

**Stop here: end of Phase 3.** Owner checks: the name field after each of the three Save-as-new paths, the tab title. Then the branch is ready for review.

---

## Out of scope

- Naming the deleted card in the banner. The card is already gone from `libraryStore.cards` when the page detaches, and the workspace keeps only its id.
- Replacing `window.confirm` with an in-page dialog. The page already uses `confirm` for the switch-card guard, and Close card follows that.
