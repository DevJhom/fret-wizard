<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import _ from 'lodash';
import { Accidental, Degree, Pattern, Setup, Tonality, degreeInPattern, majorSharpAllNotes, majorFlatAllNotes } from '@data/constants';
import { getScale } from '@data/intervals';
import { isQualityLocked } from '@data/patternNames';
import { getChordPositions, getBarPositions, getChordPositionIndexes, fingeringAvailable } from '@data/chords';
import { fetchCurrentFretboard, fetchFretboards, saveCurrentFretboard, saveFretboards } from '@/services/customizerService';
import { defaultData, defaultDataFor, ChordView, CurrentCAGED, CurrentStrings, FretboardData } from '@/lib/fretboardData';
import { useLibraryStore } from '@stores/useLibraryStore';
import StackBar from '@components/StackBar.vue';
import PatternSummary from '@components/PatternSummary.vue';
import PatternBuilder from '@components/PatternBuilder.vue';
import MyFretboard from '@components/MyFretboard.vue';

type Shape = keyof CurrentCAGED;
type LabelMode = 'notes' | 'intervals';

const props = defineProps<{ setup: Setup }>();

const shapes: Shape[] = ['CShape', 'AShape', 'GShape', 'EShape', 'DShape'];

const libraryStore = useLibraryStore();

const stack = ref<FretboardData[]>([]);
const selectedIndex = ref<number>(0);
const labelMode = ref<LabelMode>('notes');
const isLoaded = ref<boolean>(false);

const isScale = computed(() => props.setup == Setup.Scale);
const chord = computed(() => stack.value[selectedIndex.value]);

const board = computed(() => getScale(chord.value.currentTonality, chord.value.currentPattern, chord.value.currentKey));

const canFinger = computed(() => !isScale.value && fingeringAvailable(chord.value.currentPattern));
const isFingering = computed(() => canFinger.value && chord.value.chordView === 'fingering');

const selectedShape = computed<Shape | 'All'>(() => {
    const active = shapes.filter(shape => chord.value.currentCAGED[shape]);
    return active.length === 1 ? active[0] : 'All';
});

const fingeringOptions = computed(() => getChordPositionIndexes(chord.value.currentPattern, chord.value.currentKey).map(position => ({
    position,
    label: String(position + 1),
})));

const boardCAGED = computed(() => isFingering.value ? defaultData.currentCAGED : chord.value.currentCAGED);
const chordPositions = computed(() => isFingering.value ? getChordPositions(chord.value.currentPattern, chord.value.currentKey, chord.value.currentChordPosition, chord.value.currentTonality) : undefined);
const barPositions = computed(() => isFingering.value ? getBarPositions(chord.value.currentPattern, chord.value.currentKey, chord.value.currentChordPosition) : undefined);

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

const addChord = () => {
    stack.value.push(_.cloneDeep(chord.value));
    selectedIndex.value = stack.value.length - 1;
}

const removeChord = (index: number) => {
    stack.value.splice(index, 1);
    selectedIndex.value = Math.min(index, stack.value.length - 1);
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

const saveToLibrary = async () => {
    await libraryStore.ensureLoaded();
    const card = await libraryStore.createCard(`Card ${libraryStore.cards.length + 1}`, props.setup, stack.value);
    if (card) libraryStore.activeCardId = card.id;
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

onMounted(async () => {
    await loadStack();
})
</script>

<template>
    <div v-if="chord" class="fretboard-page">
        <StackBar
            :chords="stack"
            :selected-index="selectedIndex"
            :setup="setup"
            @select="selectChord"
            @remove="removeChord"
            @add="addChord"
            @reorder="reorderChords"
            @reset="resetChord"
            @save="saveToLibrary"
        />

        <div class="page-card pattern-editor">
            <PatternSummary :chord="chord" :setup="setup" @toggle-tone="onToggleTone"/>
            <PatternBuilder
                :chord="chord"
                :setup="setup"
                @change-root="onChangeRoot"
                @change-tonality="onChangeTonality"
                @change-pattern="onChangePattern"
                @change-accidental="onChangeAccidental"
            />
        </div>

        <div class="page-card board-card">
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

                <template v-if="isFingering">
                    <span class="toolbar-label">Position</span>
                    <div class="tile-radio">
                        <label v-for="option in fingeringOptions" :key="option.position">
                            <input type="radio" name="chord-fingering" :checked="chord.currentChordPosition === option.position" @change="updateChord({ currentChordPosition: option.position })">
                                <div class="label toolbar-option fw-bold">{{ option.label }}</div>
                            </input>
                        </label>
                    </div>
                </template>

                <template v-else>
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
                </template>

                <small v-if="!isScale && !canFinger" class="toolbar-note">Positions are for triads and power chords</small>

                <label for="board-frets" class="toolbar-label ms-auto">Frets</label>
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

            <MyFretboard
                :fretAmount="chord.fretAmount"
                :currentPattern="chord.currentPattern"
                :currentKey="chord.currentKey"
                :currentTonality="chord.currentTonality"
                :currentAccidental="chord.currentAccidental"
                :currentHighlightNotes="chord.currentHighlightNotes"
                :currentCAGED="boardCAGED"
                :currentStrings="chord.currentStrings"
                :E="board.E"
                :A="board.A"
                :D="board.D"
                :G="board.G"
                :B="board.B"
                :e="board.e"
                :chord-positions="chordPositions"
                :bar-positions="barPositions"
                fade-outside-shape
                :root-based-shapes="!isScale"
                string-toggles
                :label-mode="labelMode"
                @toggle-string="onToggleString"
            />
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

.page-card {
    border-radius: 14px;
    background-color: var(--fretboard-background-color);
    box-shadow: var(--fretboard-shadow);
}

.pattern-editor {
    display: flex;
    gap: 2.5rem;
    padding: 1.75rem 2rem;
    text-align: start;
}

.board-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem 1.5rem;
}

.board-toolbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
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

.fret-count {
    min-width: 1.5rem;
    margin-right: 0.75rem;
    color: var(--accent-text-color);
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
</style>
