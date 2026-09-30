<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sortable from 'sortablejs';
import { Setup } from '@data/constants';
import { patternSymbol } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';

interface SortableEvent {
    item: HTMLElement;
    from: HTMLElement;
    oldIndex?: number;
    newIndex?: number;
}

const props = defineProps<{
    chords: FretboardData[],
    selectedIndex: number,
    setup: Setup
}>();

const symbolFor = (chord: FretboardData) => patternSymbol(chord.currentKey, chord.currentTonality, chord.currentPattern, props.setup == Setup.Scale);

const emit = defineEmits<{
    (e: 'select', index: number): void
    (e: 'remove', index: number): void
    (e: 'add'): void
    (e: 'reorder', oldIndex: number, newIndex: number): void
    (e: 'reset'): void
    (e: 'save'): void
}>();

const chipList = ref<HTMLElement | null>(null);
const hasSaved = ref<boolean>(false);

const save = () => {
    emit('save');
    hasSaved.value = true;
    setTimeout(() => hasSaved.value = false, 1500);
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

onMounted(() => {
    Sortable.create(chipList.value!, {
        animation: 150,
        onUpdate(evt: SortableEvent) {
            const { item, from, oldIndex, newIndex } = evt;
            if (oldIndex === undefined || newIndex === undefined) return;
            restoreElementPosition(from, item, oldIndex);
            emit('reorder', oldIndex, newIndex);
        },
    });
})
</script>

<template>
    <div class="stack-bar">
        <span class="stack-label">Stack</span>
        <div ref="chipList" class="stack-chips">
            <div
                v-for="(chord, index) in chords"
                :key="`${index}-${chord.currentKey}-${chord.currentTonality}-${chord.currentPattern}`"
                class="stack-chip"
                :class="{ 'selected-chip': index == props.selectedIndex }"
            >
                <button type="button" class="chip-select" :aria-pressed="index == props.selectedIndex" @click="emit('select', index)">
                    {{ symbolFor(chord) }}
                </button>
                <button
                    v-if="index == props.selectedIndex && chords.length > 1"
                    type="button"
                    class="chip-remove"
                    :aria-label="`Remove ${symbolFor(chord)}`"
                    @click="emit('remove', index)"
                >×</button>
            </div>
        </div>
        <button type="button" class="add-chord" @click="emit('add')">+ Add {{ setup == Setup.Scale ? 'scale' : 'chord' }}</button>
        <div class="stack-actions">
            <button type="button" class="stack-action" @click="emit('reset')">Reset</button>
            <button type="button" class="stack-action" @click="save()">{{ hasSaved ? 'Saved' : 'Save to Library' }}</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.stack-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
}

.stack-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $gray-1;
}

.stack-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.stack-chip {
    display: flex;
    align-items: center;
    border: 3px solid transparent;
    border-radius: 10px;
    background-color: var(--switch-input-background-color);
}

.selected-chip {
    border-color: $yellow;
    color: var(--accent-text-color);
}

.stack-chip .chip-select,
.stack-chip .chip-remove {
    height: 38px;
}

.chip-select,
.chip-remove,
.add-chord,
.stack-action {
    height: 44px;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.chip-select {
    min-width: 56px;
    padding: 0 1rem;
    font-size: 1.05rem;
    font-weight: 700;
}

.chip-remove {
    width: 32px;
    margin-left: -0.6rem;
    font-size: 1.1rem;
}

.add-chord {
    padding: 0 1rem;
    border: 1px dashed var(--card-border-color);
    border-radius: 10px;
    color: $gray-1;

    &:hover {
        border-color: $yellow;
    }
}

.stack-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
}

.stack-action {
    padding: 0 1rem;
    border-radius: 9px;
    background-color: var(--reset-settings-background-color);
    color: $black;
    font-size: 0.9rem;

    &:hover {
        background-color: $yellow;
    }
}
</style>
