<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Sortable from 'sortablejs';
import { Tonality } from '@data/constants';
import { diatonicChords, progressionKeys, relativeProgressionKey } from '@data/progressions';
import { fetchChordProgression, saveChordProgression } from '@/services/customizerService';
import type { ProgressionChord } from '@services/adapters/localStorageAdapter';
import ChordBlock from '@components/ChordBlock.vue';

interface SortableEvent {
    item: HTMLElement;
    clone: HTMLElement;
    from: HTMLElement;
    oldIndex?: number;
    newIndex?: number;
}

const currentKey = ref<string>('C');
const currentTonality = ref<Tonality>(Tonality.MAJOR);
const progression = ref<ProgressionChord[]>([]);
const isLoaded = ref<boolean>(false);

const paletteList = ref<HTMLElement | null>(null);
const progressionList = ref<HTMLElement | null>(null);

const keys = computed(() => progressionKeys(currentTonality.value));
const chords = computed(() => diatonicChords(currentKey.value, currentTonality.value));

const addChord = (degree: number, index = progression.value.length) => {
    progression.value.splice(index, 0, { id: crypto.randomUUID(), degree });
}

const removeChord = (index: number) => {
    progression.value.splice(index, 1);
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
    progression.value = data.progression;
    isLoaded.value = true;
}

watch([currentKey, currentTonality, progression], () => {
    if (!isLoaded.value) return;
    saveChordProgression({
        key: currentKey.value,
        tonality: currentTonality.value,
        progression: progression.value.map(({ id, degree }) => ({ id, degree })),
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
            evt.clone.replaceWith(evt.item);
            addChord(degree, evt.newIndex);
        },
        onUpdate(evt: SortableEvent) {
            const { item, from, oldIndex, newIndex } = evt;
            if (oldIndex === undefined || newIndex === undefined) return;
            restoreElementPosition(from, item, oldIndex);
            const [moved] = progression.value.splice(oldIndex, 1);
            progression.value.splice(newIndex, 0, moved);
        },
    });
})
</script>

<template>
    <div class="progression-page">
        <div class="selector-wrapper">
            <div class="switch-tonality tile-radio me-2 fw-bold">
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

            <div v-for="key in keys" :key="key" class="d-inline-block custom-radio">
                <label class="d-flex flex-column">
                    <input type="radio" name="progression-keys" v-model="currentKey" :value="key">
                        <span class="label"> {{ key }} </span>
                    </input>
                </label>
            </div>
        </div>

        <div ref="paletteList" class="chord-palette">
            <ChordBlock
                v-for="chord in chords"
                :key="chord.degree"
                :data-degree="chord.degree"
                :numeral="chord.numeral"
                :name="chord.name"
                @click="addChord(chord.degree)"
            />
        </div>

        <div class="progression-header">
            <span class="text-yellow fw-bold">Chord Progression</span>
            <button v-if="progression.length" class="clear-progression" @click="clearProgression()">Clear</button>
        </div>

        <div class="progression-area">
            <div ref="progressionList" class="progression-list">
                <ChordBlock
                    v-for="(item, index) in progression"
                    :key="item.id"
                    :data-degree="item.degree"
                    :numeral="chords[item.degree].numeral"
                    :name="chords[item.degree].name"
                    removable
                    @remove="removeChord(index)"
                />
            </div>
            <div v-if="!progression.length" class="progression-hint">
                Drag chords here or click them to add
            </div>
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
    padding: 3rem 2rem;
}

.selector-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 4px;
}

.switch-tonality .label,
.custom-radio .label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 5px;
}

.chord-palette {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
}

.progression-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
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
}

.progression-area {
    position: relative;
    width: min(100%, 1000px);
    min-height: 130px;
    border: 2px dashed var(--card-border-color);
    border-radius: 12px;
}

.progression-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    min-height: 130px;
    padding: 1.5rem;
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

@media (max-width: $phone) {
    .progression-page {
        padding: 1.5rem 1rem;
    }
}
</style>
