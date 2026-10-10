<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import _ from 'lodash';
import Sortable from 'sortablejs';
import { Accidental, Degree, Pattern, Setup, Tonality, degreeInPattern, majorSharpAllNotes, majorFlatAllNotes } from '@data/constants';
import { isQualityLocked } from '@data/patternNames';
import { getChordPositionIndexes, fingeringAvailable } from '@data/chords';
import { fetchCurrentFretboard, fetchFretboards, saveCurrentFretboard, saveFretboards } from '@/services/customizerService';
import { defaultDataFor, isFingeringView, ChordView, CurrentCAGED, CurrentStrings, FretboardData } from '@/lib/fretboardData';
import { useLibraryStore } from '@stores/useLibraryStore';
import { cardWithUnsavedDraft, clearWorkspaceCardId, getWorkspaceCardId, resolveCardRoute, sameStack, setWorkspaceCardId } from '@/lib/cardSession';
import { getStackView, setStackView } from '@/lib/stackView';
import StackBar from '@components/StackBar.vue';
import StackRow from '@components/StackRow.vue';
import PatternSummary from '@components/PatternSummary.vue';
import PatternBuilder from '@components/PatternBuilder.vue';
import PatternBoard from '@components/PatternBoard.vue';
import RotatePhone from '@/assets/icons/RotatePhone.vue';
import { rotateHintDismissed } from '@/lib/rotateHint';

type Shape = keyof CurrentCAGED;
type LabelMode = 'notes' | 'intervals';

interface SortableEvent {
    item: HTMLElement;
    from: HTMLElement;
    oldIndex?: number;
    newIndex?: number;
}

const props = defineProps<{ setup: Setup, cardId?: string | null }>();

const emit = defineEmits<{
    (e: 'open-card', cardId: string, replace: boolean): void
    (e: 'close-card', replace: boolean): void
}>();

const shapes: Shape[] = ['CShape', 'AShape', 'GShape', 'EShape', 'DShape'];

const libraryStore = useLibraryStore();

const stack = ref<FretboardData[]>([]);
const selectedIndex = ref<number>(0);
const labelMode = ref<LabelMode>('notes');
// Stack View lists every fretboard collapsed; the Default view shows the selected one in full
const isStackView = ref<boolean>(getStackView(props.setup));
// In Stack View, whether the selected fretboard is opened into the editor in place of its row
const isEditing = ref<boolean>(false);
const isLoaded = ref<boolean>(false);
const stackList = ref<HTMLElement | null>(null);

const isScale = computed(() => props.setup == Setup.Scale);
const chord = computed(() => stack.value[selectedIndex.value]);

// The Library card named in the URL, once the library has loaded
const openCard = computed(() => props.cardId ? libraryStore.cards.find(c => c.id === props.cardId && c.setup === props.setup) : undefined);
const isDirty = computed(() => !!openCard.value && !sameStack(stack.value, openCard.value.fretboards));

const canFinger = computed(() => !isScale.value && fingeringAvailable(chord.value.currentPattern));
const isFingering = computed(() => isFingeringView(chord.value, props.setup));

const selectedShape = computed<Shape | 'All'>(() => {
    const active = shapes.filter(shape => chord.value.currentCAGED[shape]);
    return active.length === 1 ? active[0] : 'All';
});

const fingeringOptions = computed(() => getChordPositionIndexes(chord.value.currentPattern, chord.value.currentKey).map(position => ({
    position,
    label: String(position + 1),
})));

const dismissRotateHint = () => {
    rotateHintDismissed.value = true;
}

const updateChord = (patch: Partial<FretboardData>) => {
    Object.assign(stack.value[selectedIndex.value], patch);
}

const allTones = (pattern: Pattern, tonality: Tonality) => degreeInPattern(pattern, tonality) ?? [];

const onChangeRoot = (key: string) => {
    updateChord({ currentKey: key });
}

const onChangeTonality = (tonality: Tonality) => {
    updateChord({ currentTonality: tonality, currentHighlightNotes: allTones(chord.value.currentPattern, tonality) });
}

const onChangePattern = (pattern: Pattern) => {
    const tonality = isQualityLocked(pattern) ? Tonality.MAJOR : chord.value.currentTonality;
    const chordView: ChordView | undefined = fingeringAvailable(pattern) ? chord.value.chordView : 'shapes';
    updateChord({ currentPattern: pattern, currentTonality: tonality, currentHighlightNotes: allTones(pattern, tonality), chordView });
}

const onChangeAccidental = (accidental: Accidental) => {
    const from = accidental == Accidental.SHARP ? majorFlatAllNotes : majorSharpAllNotes;
    const to = accidental == Accidental.SHARP ? majorSharpAllNotes : majorFlatAllNotes;
    const index = from.indexOf(chord.value.currentKey);
    updateChord({ currentAccidental: accidental, currentKey: index > -1 ? to[index] : chord.value.currentKey });
}

const onToggleTone = (degree: Degree) => {
    const notes = chord.value.currentHighlightNotes;
    updateChord({ currentHighlightNotes: notes.includes(degree) ? notes.filter(note => note !== degree) : [...notes, degree] });
}

const onChangeShape = (selected: Shape | 'All') => {
    const currentCAGED = Object.fromEntries(shapes.map(shape => [shape, selected === 'All' || shape === selected])) as unknown as CurrentCAGED;
    updateChord({ currentCAGED });
}

const onToggleString = (stringName: keyof CurrentStrings) => {
    updateChord({ currentStrings: { ...chord.value.currentStrings, [stringName]: !chord.value.currentStrings[stringName] } });
}

const selectChord = (index: number) => {
    selectedIndex.value = index;
}

// The editor card: the selected fretboard in the Default view, the one being edited in Stack View
const isExpanded = (index: number) => index == selectedIndex.value && (!isStackView.value || isEditing.value);

// A short fade-and-rise as the list swaps views; skipped for anyone who asks for reduced motion
const playViewSwitch = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stackList.value?.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'ease-out' },
    );
}

const toggleStackView = () => {
    isStackView.value = !isStackView.value;
    isEditing.value = false;
    playViewSwitch();
}

// The editor is much taller than the row it replaces, so bring all of it on screen
const revealEditor = async () => {
    await nextTick();
    stackList.value?.querySelector('.fretboard-card')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Opens a Stack View row into the editor, in place
const editChord = (index: number) => {
    selectedIndex.value = index;
    isEditing.value = true;
    revealEditor();
}

const finishEditing = () => {
    isEditing.value = false;
}

// A new fretboard starts as a copy, so Stack View opens it for editing straight away
const addChord = () => {
    stack.value.push(_.cloneDeep(chord.value));
    selectedIndex.value = stack.value.length - 1;
    if (isStackView.value) {
        isEditing.value = true;
        revealEditor();
    }
}

// A tab's × or a Stack View row can remove any fretboard, so the selection follows the one it was on
const removeChord = (index: number) => {
    const selected = stack.value[selectedIndex.value];
    stack.value.splice(index, 1);
    const kept = stack.value.indexOf(selected);
    if (kept > -1) {
        selectedIndex.value = kept;
        return;
    }
    // The selected fretboard itself was removed: fall back to its neighbor, with nothing left open
    selectedIndex.value = Math.min(index, stack.value.length - 1);
    isEditing.value = false;
}

const reorderChords = (oldIndex: number, newIndex: number) => {
    const selected = stack.value[selectedIndex.value];
    const [moved] = stack.value.splice(oldIndex, 1);
    stack.value.splice(newIndex, 0, moved);
    selectedIndex.value = stack.value.indexOf(selected);
}

const resetChord = () => {
    stack.value[selectedIndex.value] = defaultDataFor(props.setup);
}

const restoreElementPosition = (list: HTMLElement, item: HTMLElement, index: number) => {
    item.remove();
    const next = list.children[index];
    if (next) {
        list.insertBefore(item, next);
    } else {
        list.children[index - 1].after(item);
    }
}

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
    isEditing.value = false;
    setWorkspaceCardId(props.setup, cardId);
}

const loadStack = async () => {
    const saved = await fetchFretboards(props.setup);
    if (saved && saved.length) {
        stack.value = saved;
    } else {
        stack.value = [(await fetchCurrentFretboard(props.setup)) ?? defaultDataFor(props.setup)];
    }
    stack.value.forEach(item => item.currentSetup = props.setup);
    isLoaded.value = true;
}

watch([stack, selectedIndex], () => {
    if (!isLoaded.value) return;
    saveFretboards(props.setup, stack.value);
    saveCurrentFretboard(props.setup, chord.value);
}, { deep: true });

watch(isStackView, value => setStackView(props.setup, value));

onMounted(async () => {
    await loadStack();

    // Stack View rows are dragged by their handle; the editor card has none, so it stays put
    await nextTick();
    if (stackList.value) {
        Sortable.create(stackList.value, {
            animation: 150,
            handle: '.drag-handle',
            onUpdate(evt: SortableEvent) {
                const { item, from, oldIndex, newIndex } = evt;
                if (oldIndex === undefined || newIndex === undefined) return;
                restoreElementPosition(from, item, oldIndex);
                reorderChords(oldIndex, newIndex);
            },
        });
    }

    await attachCard(props.cardId);
})

// Back/Forward between cards, or a card just saved, changes the id without remounting the page
watch(() => props.cardId, cardId => attachCard(cardId));
</script>

<template>
    <div v-if="chord" class="fretboard-page">
        <div v-if="!rotateHintDismissed" class="rotate-hint">
            <RotatePhone class="rotate-icon"/>
            <span>Rotate your phone for better viewing experience</span>
            <button type="button" class="rotate-hint-close" aria-label="Dismiss" @click="dismissRotateHint">×</button>
        </div>

        <!-- The stack tabs sit on the card like folder tabs -->
        <div class="stack-folder">
            <StackBar
                :chords="stack"
                :selected-index="selectedIndex"
                :setup="setup"
                :card-name="openCard?.name"
                :is-dirty="isDirty"
                :is-stack-view="isStackView"
                @select="selectChord"
                @add="addChord"
                @remove="removeChord"
                @reorder="reorderChords"
                @save="saveCard"
                @save-as-new="saveAsNewCard"
                @toggle-stack-view="toggleStackView"
            />

            <!-- One slot per fretboard. The Default view fills only the selected one, with the editor.
                 Stack View fills them all: collapsed rows, and the editor in place of the row being edited -->
            <div ref="stackList" class="stack-list" :class="{ 'is-stack-view': isStackView }">
                <template v-for="(item, index) in stack" :key="index">
                    <div v-if="isExpanded(index)" class="page-card fretboard-card">
                        <div class="pattern-editor">
                            <div class="editor-actions">
                                <button type="button" class="reset-button" title="Put this fretboard back to its defaults" @click="resetChord">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
                                    Reset
                                </button>
                                <button v-if="stack.length > 1" type="button" class="delete-button" aria-label="Remove this fretboard" title="Remove this fretboard from the stack" @click="removeChord(selectedIndex)">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                                </button>
                                <button v-if="isStackView" type="button" class="done-button" title="Collapse this fretboard back into the stack" @click="finishEditing">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                                    Done
                                </button>
                            </div>
                            <PatternSummary :chord="chord" :setup="setup" :label-mode="labelMode" @toggle-tone="onToggleTone"/>
                            <PatternBuilder
                                :chord="chord"
                                :setup="setup"
                                @change-root="onChangeRoot"
                                @change-tonality="onChangeTonality"
                                @change-pattern="onChangePattern"
                                @change-accidental="onChangeAccidental"
                            />
                        </div>

                        <div class="board-section">
                            <div class="board-scroll">
                                <PatternBoard
                                    class="board"
                                    :chord="chord"
                                    :setup="setup"
                                    :label-mode="labelMode"
                                    string-toggles
                                    @toggle-string="onToggleString"
                                />
                            </div>

                            <div class="board-toolbar">
                                <template v-if="!isScale">
                                    <div class="switch-radio view-switch fw-bold">
                                        <label>
                                            <input type="radio" name="chord-view" :checked="!isFingering" @change="updateChord({ chordView: 'shapes' })">
                                                <div class="label view-option">Shapes</div>
                                            </input>
                                        </label>
                                        <label :class="{ 'is-disabled': !canFinger }" :title="canFinger ? '' : 'Positions are for triads and power chords'">
                                            <input type="radio" name="chord-view" :disabled="!canFinger" :checked="isFingering" @change="updateChord({ chordView: 'fingering' })">
                                                <div class="label view-option">Position</div>
                                            </input>
                                        </label>
                                    </div>
                                </template>

                                <div v-if="isFingering" class="toolbar-group stacked">
                                    <span class="toolbar-label">Position</span>
                                    <div class="tile-radio">
                                        <label v-for="option in fingeringOptions" :key="option.position">
                                            <input type="radio" name="chord-fingering" :checked="chord.currentChordPosition === option.position" @change="updateChord({ currentChordPosition: option.position })">
                                                <div class="label toolbar-option fw-bold">{{ option.label }}</div>
                                            </input>
                                        </label>
                                    </div>
                                </div>

                                <div v-else class="toolbar-group stacked">
                                    <span class="toolbar-label">Shape</span>
                                    <div class="tile-radio">
                                        <label>
                                            <input type="radio" name="board-shape" :checked="selectedShape === 'All'" @change="onChangeShape('All')">
                                                <div class="label toolbar-option fw-bold">All</div>
                                            </input>
                                        </label>
                                        <label v-for="shape in shapes" :key="shape">
                                            <input type="radio" name="board-shape" :checked="selectedShape === shape" @change="onChangeShape(shape)">
                                                <div class="label toolbar-option fw-bold">{{ shape[0] }}</div>
                                            </input>
                                        </label>
                                    </div>
                                </div>

                                <small v-if="!isScale && !canFinger" class="toolbar-note">Positions are for triads and power chords</small>

                                <div class="toolbar-group stacked labels-group">
                                    <span class="toolbar-label">Labels</span>
                                    <div class="tile-radio fw-bold">
                                        <label>
                                            <input type="radio" name="board-labels" :checked="labelMode === 'notes'" @change="labelMode = 'notes'">
                                                <div class="label toolbar-option">Notes</div>
                                            </input>
                                        </label>
                                        <label>
                                            <input type="radio" name="board-labels" :checked="labelMode === 'intervals'" @change="labelMode = 'intervals'">
                                                <div class="label toolbar-option">Intervals</div>
                                            </input>
                                        </label>
                                    </div>
                                </div>

                                <div class="toolbar-group stacked">
                                    <label for="board-frets" class="toolbar-label">Frets</label>
                                    <div class="fret-range">
                                        <span class="fret-min fw-bold">12</span>
                                        <input
                                            id="board-frets"
                                            type="range"
                                            class="fret-slider"
                                            min="12"
                                            max="24"
                                            step="1"
                                            :value="chord.fretAmount"
                                            @input="updateChord({ fretAmount: Number(($event.target as HTMLInputElement).value) })"
                                        >
                                        <span class="fret-count fw-bold">{{ chord.fretAmount }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <StackRow
                        v-else-if="isStackView"
                        :chord="item"
                        :setup="setup"
                        :label-mode="labelMode"
                        :removable="stack.length > 1"
                        @edit="editChord(index)"
                        @remove="removeChord(index)"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.fretboard-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    padding: 1rem 2rem 3rem;
}

// Stack tabs and the card, with no gap so the selected tab joins the card
.stack-folder {
    display: flex;
    flex-direction: column;
}

// The first tab sits on the top-left corner, so that corner is square
.page-card {
    border-radius: 0 14px 14px 14px;
    background-color: var(--fretboard-background-color);
    box-shadow: var(--fretboard-shadow);
}

.stack-list {
    display: flex;
    flex-direction: column;
}

// Stack View: every fretboard, one above the other, clear of the bar
.stack-list.is-stack-view {
    gap: 0.75rem;
    margin-top: 0.75rem;
}

// No tab to join in Stack View; the outline marks the fretboard being edited
.is-stack-view .page-card {
    border-radius: 14px;
    box-shadow: 0 0 0 2px var(--accent-text-color);
}

.pattern-editor {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    // Extra top room keeps the Reset button above the builder's first headings
    padding: 2.75rem 2rem 1.75rem;
    text-align: start;
}

// Reset, Remove and Done act on one fretboard, so they live on the card that edits it
.editor-actions {
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    display: flex;
    gap: 0.25rem;
}

.reset-button,
.delete-button,
.done-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 36px;
    padding: 0 0.75rem;
    border: 1px solid transparent;
    border-radius: 9px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.reset-button {
    background: none;
    color: var(--muted-text-color);

    &:hover {
        border-color: transparent;
        background-color: var(--option-background-color);
        color: inherit;
    }
}

.delete-button {
    justify-content: center;
    width: 36px;
    padding: 0;
    background: none;
    color: var(--muted-text-color);

    &:hover {
        border-color: transparent;
        background-color: var(--option-background-color);
        color: var(--danger-color);
    }
}

.done-button {
    background-color: var(--accent-soft-color);
    color: var(--accent-strong-text-color);

    &:hover {
        border-color: var(--accent-text-color);
    }
}

// Fretboard with its controls underneath, divided from the editor above
.board-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid var(--card-border-color);
}

// Bottom-aligned so inline controls line up with the buttons under stacked headings
.board-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.75rem;
    width: 100%;
}

// A heading and its control wrap as one unit
.toolbar-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    min-height: 44px;
}

// Heading above its buttons
.toolbar-group.stacked {
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: flex-start;
    gap: 0.4rem;
}

// Scrolls the neck inside the card when it is wider than the screen.
// Auto margins center it when it fits and fall back to 0 when it doesn't.
.board-scroll {
    display: flex;
    width: 100%;
    overflow-x: auto;
    scrollbar-color: var(--card-border-color) transparent;
}

.board {
    flex: none;
    margin-inline: auto;
}

.rotate-hint {
    display: none;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    border: 2px dashed var(--card-border-color);
    border-radius: 12px;
    font-size: 0.85rem;
    text-align: start;
    color: $gray-1;
}

.rotate-icon {
    flex: none;
    width: 20px;
    height: 20px;
}

.rotate-hint-close {
    flex: none;
    width: 36px;
    height: 36px;
    margin-left: auto;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;

    &:hover {
        color: var(--accent-text-color);
    }

    &:focus-visible {
        outline: 2px solid $yellow;
    }
}

.toolbar-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $gray-1;
}

.toolbar-note {
    color: $gray-1;
}

input.fret-slider {
    width: 10rem;
}

// Slider range: minimum (gray) ── slider ── current count
.fret-range {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 44px;
}

.fret-min {
    color: $gray-1;
}

.fret-count {
    min-width: 1.5rem;
    color: var(--accent-text-color);
}

// Pushes Labels + Frets to the right, with extra space between the two
.labels-group {
    margin-left: auto;
    margin-right: 0.75rem;
}

.view-switch {
    display: flex;
}

.view-switch label {
    background-color: var(--option-background-color);
}

.view-switch input {
    display: inline;
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
}

.view-switch input:focus-visible + .label {
    outline: 2px solid $yellow;
    outline-offset: 2px;
}

.view-option {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 0.9rem;
}

.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.toolbar-option {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 0.7rem;
}

@media (max-width: $phone) {
    .fretboard-page {
        padding: 0.75rem 1rem 2rem;
    }

    .pattern-editor {
        flex-direction: column;
        gap: 1.25rem;
        padding: 1rem;
    }

    // Own row on phones so they never cover a long chord name
    .editor-actions {
        position: static;
        align-self: flex-end;
        margin-bottom: -0.75rem;
    }

    .board-section {
        padding: 1rem;
    }

    input.fret-slider {
        width: 7rem;
    }

    // Wrapped rows read better left-aligned
    .labels-group {
        margin-left: 0;
    }
}

@media (max-width: $phone) and (orientation: portrait) {
    .rotate-hint {
        display: flex;
    }
}
</style>
