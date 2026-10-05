<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
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
    setup: Setup,
    cardName?: string,
    isDirty: boolean
}>();

const symbolFor = (chord: FretboardData) => patternSymbol(chord.currentKey, chord.currentTonality, chord.currentPattern, props.setup == Setup.Scale);

const emit = defineEmits<{
    (e: 'select', index: number): void
    (e: 'remove', index: number): void
    (e: 'add'): void
    (e: 'reorder', oldIndex: number, newIndex: number): void
    (e: 'save'): void
    (e: 'save-as-new'): void
    (e: 'close-card'): void
}>();

const chipList = ref<HTMLElement | null>(null);

const saveLabel = computed(() => {
    if (!props.cardName) return 'Save to Library';
    return props.isDirty ? 'Save' : 'Saved';
});

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
        <!-- Folder tabs: the selected one joins the card below -->
        <div class="stack-tabs">
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
        </div>
        <div class="stack-actions">
            <span v-if="cardName" class="open-card" :title="cardName">
                <span class="open-card-name">{{ cardName }}</span>
                <button type="button" class="open-card-close" :aria-label="`Close ${cardName}`" @click="emit('close-card')">×</button>
            </span>
            <button v-if="cardName" type="button" class="stack-action save-as-new-action" @click="emit('save-as-new')">Save as new card</button>
            <button type="button" class="stack-action save-action" :disabled="!!cardName && !isDirty" @click="emit('save')">{{ saveLabel }}</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
// Sits directly on top of the fretboard card; tabs are bottom-aligned so they touch it
.stack-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    width: 100%;
}

// One row of tabs that scrolls sideways when full, so the tabs always stay on the card's edge
.stack-tabs {
    display: flex;
    flex: 1 1 auto;
    align-items: flex-end;
    gap: 0.25rem;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
}

.stack-chips {
    display: flex;
    gap: 0.25rem;
}

.stack-chip {
    display: flex;
    flex: none;
    align-items: center;
    border: 1px solid var(--stack-tab-border);
    border-bottom: none;
    border-radius: 12px 12px 0 0;
    background-color: var(--stack-tab-background);
    color: var(--muted-text-color);
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
        color: inherit;
    }
}

// The whole selected tab is yellow
.selected-chip,
.selected-chip:hover {
    border-color: $yellow;
    background-color: $yellow;
    color: $black;
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
        outline-offset: -2px;
    }
}

// Yellow focus ring would vanish on the yellow tab
.selected-chip button:focus-visible {
    outline-color: $black;
}

.chip-select {
    min-width: 56px;
    padding: 0 1.1rem;
    font-size: 1.05rem;
    font-weight: 500;
    white-space: nowrap;
}

.selected-chip .chip-select {
    font-weight: 600;
}

.chip-remove {
    width: 32px;
    margin-left: -0.6rem;
    font-size: 1.1rem;
    color: inherit;
    opacity: 0.7;

    &:hover {
        opacity: 1;
    }
}

// A standalone dashed button, centered on the tabs and clear of the card
.add-chord {
    flex: none;
    align-self: center;
    height: 36px;
    margin-left: 0.5rem;
    padding: 0 1rem;
    border: 1px dashed var(--card-border-color);
    border-radius: 10px;
    color: $gray-1;
    white-space: nowrap;

    &:hover {
        border-color: $yellow;
        color: inherit;
    }
}

.stack-actions {
    display: flex;
    flex: none;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.stack-action {
    padding: 0 1rem;
    border-radius: 9px;
    font-size: 0.9rem;
    font-weight: 600;

    &:hover {
        filter: brightness(1.1);
    }

    &:focus-visible {
        outline-offset: 2px;
    }
}

.save-action {
    background-color: $yellow;
    color: $black;
}

.save-action:disabled {
    opacity: 0.6;
    cursor: default;
    filter: none;
}

.save-as-new-action {
    background-color: var(--option-background-color);
}

.open-card {
    display: inline-flex;
    align-items: center;
    max-width: 220px;
    padding-left: 0.75rem;
    border: 1px solid var(--card-border-color);
    border-radius: 9px;
}

.open-card-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9rem;
    font-weight: 600;
}

.open-card-close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 42px;
    padding: 0;
    line-height: 1;
    border: none;
    background: none;
    color: var(--muted-text-color);
    font-size: 1.1rem;
    cursor: pointer;

    &:hover {
        color: inherit;
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

// Actions get their own row above the tabs
@media (max-width: $phone) {
    .stack-bar {
        flex-wrap: wrap;
    }

    .stack-actions {
        flex-wrap: wrap;
        order: -1;
        justify-content: flex-end;
        width: 100%;
        margin-bottom: 0;
    }
}
</style>
