<script setup lang="ts">
import { computed } from 'vue';
import { Degree, Setup } from '@data/constants';
import { chordVoicings, ChordVoicing } from '@data/chords';
import type { CurrentCAGED, CurrentStrings, FretboardData } from '@/lib/fretboardData';
import PatternSummary from '@components/PatternSummary.vue';
import PatternBoard from '@components/PatternBoard.vue';
import VerticalChord from '@components/VerticalChord.vue';

type Shape = keyof CurrentCAGED;
type LabelMode = 'notes' | 'intervals';

// The card that edits one fretboard: summary (plus the page's builder, if any), the neck and its
// toolbar, then the chord diagrams. Changes go back to the page as a patch; the page owns the data
const props = defineProps<{
    chord: FretboardData,
    setup: Setup,
    labelMode: LabelMode,
    removable?: boolean,
    // Stack View, where Done collapses the card back into its row
    collapsible?: boolean
}>();

const emit = defineEmits<{
    (e: 'update', patch: Partial<FretboardData>): void
    (e: 'update:labelMode', mode: LabelMode): void
    (e: 'reset'): void
    (e: 'remove'): void
    (e: 'done'): void
}>();

const shapes: Shape[] = ['CShape', 'AShape', 'GShape', 'EShape', 'DShape'];

const isScale = computed(() => props.setup == Setup.Scale);
const voicings = computed(() => chordVoicings(props.chord));

const selectedShape = computed<Shape | 'All'>(() => {
    const active = shapes.filter(shape => props.chord.currentCAGED[shape]);
    return active.length === 1 ? active[0] : 'All';
});

const diagramShape = (voicing: ChordVoicing) => `${voicing.shape}Shape` as Shape;

const onToggleTone = (degree: Degree) => {
    const notes = props.chord.currentHighlightNotes;
    emit('update', { currentHighlightNotes: notes.includes(degree) ? notes.filter(note => note !== degree) : [...notes, degree] });
}

const onChangeShape = (selected: Shape | 'All') => {
    const currentCAGED = Object.fromEntries(shapes.map(shape => [shape, selected === 'All' || shape === selected])) as unknown as CurrentCAGED;
    emit('update', { currentCAGED });
}

const onToggleString = (stringName: keyof CurrentStrings) => {
    emit('update', { currentStrings: { ...props.chord.currentStrings, [stringName]: !props.chord.currentStrings[stringName] } });
}
</script>

<template>
    <div class="fretboard-card">
        <div class="pattern-editor">
            <div class="editor-actions">
                <button type="button" class="reset-button" title="Put this fretboard back to its defaults" @click="emit('reset')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>
                    Reset
                </button>
                <button v-if="removable" type="button" class="delete-button" aria-label="Remove this fretboard" title="Remove this fretboard from the stack" @click="emit('remove')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                </button>
                <button v-if="collapsible" type="button" class="done-button" title="Collapse this fretboard back into the stack" @click="emit('done')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                    Done
                </button>
            </div>
            <PatternSummary :chord="chord" :setup="setup" :label-mode="labelMode" @toggle-tone="onToggleTone"/>
            <!-- The Scale and Chord pages put their Key / Quality / pattern builder here -->
            <slot name="builder"/>
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
                <div class="toolbar-group stacked">
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

                <div class="toolbar-group">
                    <div class="fret-range">
                        <span class="fret-min fw-bold">12</span>
                        <input
                            type="range"
                            class="fret-slider"
                            aria-label="Frets"
                            min="12"
                            max="24"
                            step="1"
                            :value="chord.fretAmount"
                            @input="emit('update', { fretAmount: Number(($event.target as HTMLInputElement).value) })"
                        >
                        <span class="fret-count fw-bold">{{ chord.fretAmount }}</span>
                    </div>
                </div>

                <div class="toolbar-group stacked labels-group">
                    <span class="toolbar-label">Labels</span>
                    <div class="tile-radio fw-bold">
                        <label>
                            <input type="radio" name="board-labels" :checked="labelMode === 'notes'" @change="emit('update:labelMode', 'notes')">
                                <div class="label toolbar-option">Notes</div>
                            </input>
                        </label>
                        <label>
                            <input type="radio" name="board-labels" :checked="labelMode === 'intervals'" @change="emit('update:labelMode', 'intervals')">
                                <div class="label toolbar-option">Intervals</div>
                            </input>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="!isScale" class="chord-section">
            <div v-if="voicings.length" class="chord-diagrams">
                <label v-for="voicing in voicings" :key="voicing.shape" class="chord-option" :title="`Show the ${voicing.shape} shape on the fretboard`">
                    <input type="radio" name="diagram-shape" :checked="selectedShape === diagramShape(voicing)" @change="onChangeShape(diagramShape(voicing))">
                    <VerticalChord :voicing="voicing" :chord="chord" :label-mode="labelMode"/>
                </label>
            </div>
            <p v-else class="chord-note">No chord diagrams for this pattern</p>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pattern-editor {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    // Row gap only: it applies when the builder wraps below the summary
    gap: 2.5rem 0;
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

// Equal side columns keep the Frets slider centred.
// Bottom-aligned so inline controls line up with the buttons under stacked headings
.board-toolbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: end;
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

.chord-section {
    padding: 1.5rem;
    border-top: 1px solid var(--card-border-color);
}

.chord-diagrams {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem 1.5rem;
}

.chord-option {
    cursor: pointer;

    input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
    }

    .vertical-chord {
        padding: 0.75rem 0.75rem 0.5rem;
        border: 3px solid transparent;
        border-radius: 12px;
        background-color: var(--option-background-color);
    }

    &:hover .vertical-chord,
    input:checked + .vertical-chord {
        border-color: $yellow;
    }

    input:checked + .vertical-chord :deep(.chord-caption) {
        color: var(--accent-text-color);
    }

    input:focus-visible + .vertical-chord {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.chord-note {
    margin: 0;
    color: $gray-1;
}

.toolbar-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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

.labels-group {
    justify-self: end;
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

    .board-section,
    .chord-section {
        padding: 1rem;
    }

    .chord-diagrams {
        column-gap: 1rem;
    }

    // A fixed half-row width, so a diagram alone on the last row matches the others
    .chord-option {
        flex: 0 0 calc(50% - 0.5rem);
        min-width: 9rem;
        max-width: 11.75rem;
    }

    .chord-option .vertical-chord {
        padding: 0.5rem 0.375rem 0.375rem;
    }

    // Too narrow for three columns, so the groups wrap
    .board-toolbar {
        display: flex;
        flex-wrap: wrap;
    }

    input.fret-slider {
        width: 7rem;
    }
}
</style>
