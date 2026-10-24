<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import Sortable from 'sortablejs';
import { Setup, Tonality } from '@data/constants';
import { diatonicChords, progressionKeys, relativeProgressionKey } from '@data/progressions';
import type { ChordType, DiatonicChord } from '@data/progressions';
import type { FretboardData } from '@/lib/fretboardData';
import { progressionChordView, progressionFretboard } from '@/lib/progressionStack';
import { fetchChordProgression, saveChordProgression } from '@/services/customizerService';
import type { ProgressionChord } from '@services/adapters/localStorageAdapter';
import ChordBlock from '@components/ChordBlock.vue';
import StackRow from '@components/StackRow.vue';
import FretboardEditor from '@components/FretboardEditor.vue';

type LabelMode = 'notes' | 'intervals';

interface SortableEvent {
    item: HTMLElement;
    clone: HTMLElement;
    from: HTMLElement;
    oldIndex?: number;
    newIndex?: number;
}

const chordTypes: { type: ChordType, label: string }[] = [
    { type: 'triad', label: 'Triad' },
    { type: 'seventh', label: '7th' },
    { type: 'power', label: 'Power' },
];

const currentKey = ref<string>('C');
const currentTonality = ref<Tonality>(Tonality.MAJOR);
// Picks the palette's chords; each chord in the progression keeps the type it was added with
const currentType = ref<ChordType>('triad');
const progression = ref<ProgressionChord[]>([]);
const isLoaded = ref<boolean>(false);
// The stack row opened into the editor, as on the Chord page's Stack View
const editingId = ref<string | null>(null);
const labelMode = ref<LabelMode>('notes');

const paletteList = ref<HTMLElement | null>(null);
const progressionList = ref<HTMLElement | null>(null);
const stackList = ref<HTMLElement | null>(null);

const keys = computed(() => progressionKeys(currentTonality.value));
const chordsByType = computed(() => Object.fromEntries(chordTypes.map(({ type }) =>
    [type, diatonicChords(currentKey.value, currentTonality.value, type)])) as Record<ChordType, DiatonicChord[]>);
const chords = computed(() => chordsByType.value[currentType.value]);
const progressionChord = (item: ProgressionChord) => chordsByType.value[item.type ?? 'triad'][item.degree];

// Every chord of the progression on the neck, in its order, as the Chord page's Stack View shows it
const progressionStack = computed(() => progression.value.map(item =>
    ({ id: item.id, fretboard: progressionFretboard(currentKey.value, currentTonality.value, item) })));

// The editor is much taller than the row it replaces, so bring all of it on screen
const editStackChord = async (id: string) => {
    editingId.value = id;
    await nextTick();
    stackList.value?.querySelector('.fretboard-card')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// The chord itself comes from the progression, so an edit only changes how it shows
const updateStackChord = (id: string, fretboard: FretboardData, patch: Partial<FretboardData>) => {
    const item = progression.value.find(chord => chord.id === id);
    if (item) item.view = progressionChordView({ ...fretboard, ...patch });
}

const resetStackChord = (id: string) => {
    const item = progression.value.find(chord => chord.id === id);
    if (item) delete item.view;
}

const addChord = (degree: number, index = progression.value.length, type = currentType.value) => {
    progression.value.splice(index, 0, { id: crypto.randomUUID(), degree, type });
}

const removeChord = (index: number) => {
    progression.value.splice(index, 1);
}

// The box and the stack below it show one progression, so dragging in either reorders both
const moveChord = (oldIndex: number, newIndex: number) => {
    const [moved] = progression.value.splice(oldIndex, 1);
    progression.value.splice(newIndex, 0, moved);
}

const clearProgression = () => {
    progression.value = [];
}

const onChangeTonality = (tonality: Tonality) => {
    currentKey.value = relativeProgressionKey(currentKey.value, currentTonality.value, tonality);
    currentTonality.value = tonality;
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

const loadProgression = async () => {
    const data = await fetchChordProgression();
    currentTonality.value = data.tonality;
    currentKey.value = progressionKeys(data.tonality).includes(data.key) ? data.key : progressionKeys(data.tonality)[0];
    // Chords saved before chord types (or with an unknown one) load as triads
    progression.value = data.progression.map(chord => ({
        ...chord,
        type: chordTypes.some(option => option.type === chord.type) ? chord.type : 'triad',
    }));
    isLoaded.value = true;
}

watch([currentKey, currentTonality, progression], () => {
    if (!isLoaded.value) return;
    saveChordProgression({
        key: currentKey.value,
        tonality: currentTonality.value,
        progression: progression.value.map(({ id, degree, type, view }) => ({ id, degree, type: type ?? 'triad', ...(view && { view }) })),
    });
}, { deep: true });

onMounted(async () => {
    await loadProgression();

    Sortable.create(paletteList.value!, {
        group: { name: 'progression', pull: 'clone', put: false },
        sort: false,
    });

    Sortable.create(progressionList.value!, {
        group: { name: 'progression', pull: false, put: true },
        animation: 150,
        ghostClass: 'chord-ghost',
        onAdd(evt: SortableEvent) {
            const degree = Number(evt.item.dataset.degree);
            const type = (evt.item.dataset.type as ChordType | undefined) ?? currentType.value;
            evt.clone.replaceWith(evt.item);
            addChord(degree, evt.newIndex, type);
        },
        onUpdate(evt: SortableEvent) {
            const { item, from, oldIndex, newIndex } = evt;
            if (oldIndex === undefined || newIndex === undefined) return;
            restoreElementPosition(from, item, oldIndex);
            moveChord(oldIndex, newIndex);
        },
    });

    // Rows are dragged by their handle, as on the Chord page; the editor card has none, so it stays put
    Sortable.create(stackList.value!, {
        animation: 150,
        handle: '.drag-handle',
        onUpdate(evt: SortableEvent) {
            const { item, from, oldIndex, newIndex } = evt;
            if (oldIndex === undefined || newIndex === undefined) return;
            restoreElementPosition(from, item, oldIndex);
            moveChord(oldIndex, newIndex);
        },
    });
})
</script>

<template>
    <div class="progression-page">
        <div class="page-card progression-editor">
            <div class="progression-summary">
                <div class="progression-title">{{ currentKey }} {{ currentTonality }}</div>
                <div class="progression-subtitle">Chord Progression</div>
            </div>

            <div class="progression-builder">
                <div class="builder-field">
                    <span class="builder-label">Key</span>
                    <div class="option-row">
                        <label v-for="key in keys" :key="key" class="custom-radio">
                            <input type="radio" name="progression-keys" v-model="currentKey" :value="key">
                                <span class="label">{{ key }}</span>
                            </input>
                        </label>
                    </div>
                </div>

                <div class="builder-field">
                    <span class="builder-label">Quality</span>
                    <div class="tile-radio fw-bold">
                        <label>
                            <input type="radio" name="progression-tonality" :value="Tonality.MAJOR" :checked="currentTonality == Tonality.MAJOR" @change="onChangeTonality(Tonality.MAJOR)">
                                <div class="label px-2 py-1"> Major </div>
                            </input>
                        </label>
                        <label>
                            <input type="radio" name="progression-tonality" :value="Tonality.MINOR" :checked="currentTonality == Tonality.MINOR" @change="onChangeTonality(Tonality.MINOR)">
                                <div class="label px-2 py-1"> Minor </div>
                            </input>
                        </label>
                    </div>
                </div>

                <div class="builder-field full-row">
                    <span class="builder-label">Chord</span>
                    <div class="option-row">
                        <label v-for="option in chordTypes" :key="option.type" class="custom-radio">
                            <input type="radio" name="progression-chord-type" v-model="currentType" :value="option.type">
                                <span class="label px-3">{{ option.label }}</span>
                            </input>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div ref="paletteList" class="chord-palette">
            <ChordBlock
                v-for="chord in chords"
                :key="chord.degree"
                :data-degree="chord.degree"
                :data-type="currentType"
                :numeral="chord.numeral"
                :name="chord.name"
                @click="addChord(chord.degree)"
            />
        </div>

        <div class="progression-row">
            <button class="clear-progression" :class="{ 'is-hidden': !progression.length }" @click="clearProgression()">Clear</button>
            <div class="progression-area">
                <div ref="progressionList" class="progression-list">
                    <ChordBlock
                        v-for="(item, index) in progression"
                        :key="item.id"
                        :data-degree="item.degree"
                        :numeral="progressionChord(item).numeral"
                        :name="progressionChord(item).name"
                        removable
                        @remove="removeChord(index)"
                    />
                </div>
                <div v-if="!progression.length" class="progression-hint">
                    Click or drag chords here
                </div>
            </div>
        </div>

        <!-- v-show, not v-if: SortableJS is attached to this list once, when the page mounts -->
        <div v-show="progressionStack.length" ref="stackList" class="progression-stack">
            <template v-for="(item, index) in progressionStack" :key="item.id">
                <FretboardEditor
                    v-if="item.id === editingId"
                    v-model:label-mode="labelMode"
                    class="page-card is-editing"
                    :chord="item.fretboard"
                    :setup="Setup.Chord"
                    removable
                    collapsible
                    @update="updateStackChord(item.id, item.fretboard, $event)"
                    @reset="resetStackChord(item.id)"
                    @remove="removeChord(index)"
                    @done="editingId = null"
                />
                <StackRow
                    v-else
                    :chord="item.fretboard"
                    :setup="Setup.Chord"
                    :label-mode="labelMode"
                    removable
                    @edit="editStackChord(item.id)"
                    @remove="removeChord(index)"
                />
            </template>
        </div>
    </div>
</template>

<style scoped lang="scss">
.progression-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    padding: 1rem 2rem 3rem;
}

// Matches the pattern editor card on the Scale and Chord pages
.page-card {
    border-radius: 14px;
    background-color: var(--fretboard-background-color);
    box-shadow: var(--fretboard-shadow);
}

// Title on the left, builder on the right, as on the Scale and Chord pages
.progression-editor {
    display: flex;
    flex-wrap: wrap;
    // Row gap only: it applies when the builder wraps below the title
    gap: 2.5rem 0;
    width: 100%;
    padding: 1.75rem 2rem;
    text-align: start;
}

// Fixed width (widest title, "G♯ Minor", is ~275px) so the builder doesn't shift when the key changes
.progression-summary {
    width: 300px;
    flex-shrink: 0;
    text-align: start;
}

.progression-title {
    font-size: 4rem;
    line-height: 1;
    font-weight: 700;
    color: var(--accent-text-color);
}

.progression-subtitle {
    margin-top: 0.4rem;
    color: var(--accent-text-color);
}

// Heading above its options: Key | Quality on one row, Chord below
.progression-builder {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: start;
    align-content: start;
    gap: 1.25rem 2.5rem;
    flex-grow: 1;
}

.builder-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    min-width: 0;

    &.full-row {
        grid-column: 1 / -1;
    }
}

.builder-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $gray-1;
}

.option-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.custom-radio .label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 5px;
}

.tile-radio .label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
}

.chord-palette {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

// Progression area centered on the page, Clear above its top-right corner
.progression-row {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    width: min(100%, 1000px);
}

.clear-progression {
    background-color: var(--reset-settings-background-color);
    color: $black;
    border: none;
    border-radius: 9px;
    padding: 0.15rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;

    &:hover {
        background-color: $yellow;
    }

    // Keeps its space while the progression is empty, so the area doesn't shift
    &.is-hidden {
        visibility: hidden;
    }
}

// The padding lives here, outside the Sortable list: in the list's own padding above the chords,
// SortableJS treats the pointer as "before the first chord" and flashes the drop placeholder there
.progression-area {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 130px;
    padding: 1.5rem;
    border: 2px dashed var(--card-border-color);
    border-radius: 12px;
}

// Fills the area, so an empty progression still accepts drops
.progression-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    flex-grow: 1;
}

.progression-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $gray-1;
    pointer-events: none;
}

.chord-ghost {
    opacity: 0.4;
}

// Follows the progression: adding, moving or removing a chord above changes its row here
.progression-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
}

// The outline marks the chord being edited, as in the Chord page's Stack View
.page-card.is-editing {
    box-shadow: 0 0 0 2px var(--accent-text-color);
}

@media (max-width: $phone) {
    .progression-page {
        padding: 0.75rem 1rem 2rem;
    }

    .progression-editor {
        flex-direction: column;
        gap: 1.25rem;
        padding: 1rem;
    }

    .progression-summary {
        width: 100%;
    }

    .progression-title {
        font-size: 2.5rem;
    }

    .progression-builder {
        grid-template-columns: 1fr;
        gap: 1.15rem;
    }
}
</style>
