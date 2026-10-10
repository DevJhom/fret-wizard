<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Sortable from 'sortablejs';
import { Setup } from '@data/constants';
import { patternSymbol } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';
import SaveMenu from '@components/SaveMenu.vue';

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
    isDirty: boolean,
    isStackView: boolean
}>();

const symbolFor = (chord: FretboardData) => patternSymbol(chord.currentKey, chord.currentTonality, chord.currentPattern, props.setup == Setup.Scale);

const emit = defineEmits<{
    (e: 'select', index: number): void
    (e: 'add'): void
    (e: 'remove', index: number): void
    (e: 'reorder', oldIndex: number, newIndex: number): void
    (e: 'save'): void
    (e: 'save-as-new'): void
    (e: 'toggle-stack-view'): void
}>();

const chipList = ref<HTMLElement | null>(null);

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
    <div class="stack-bar" :class="{ 'is-stack-view': isStackView }">
        <!-- Folder tabs: the selected one joins the card below. Stack View lists every fretboard instead -->
        <div class="stack-tabs">
            <div v-show="!isStackView" ref="chipList" class="stack-chips">
                <div
                    v-for="(chord, index) in chords"
                    :key="`${index}-${chord.currentKey}-${chord.currentTonality}-${chord.currentPattern}`"
                    class="stack-chip"
                    :class="{ 'selected-chip': index == props.selectedIndex }"
                >
                    <button type="button" class="chip-select" :aria-pressed="index == props.selectedIndex" @click="emit('select', index)">
                        {{ symbolFor(chord) }}
                    </button>
                    <!-- The last fretboard can't be removed -->
                    <button v-if="chords.length > 1" type="button" class="chip-remove" :aria-label="`Remove ${symbolFor(chord)}`" title="Remove from the stack" @click="emit('remove', index)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
                    </button>
                </div>
            </div>
            <button type="button" class="add-chord" @click="emit('add')">+ Add {{ setup == Setup.Scale ? 'Scale' : 'Chord' }}</button>
        </div>
        <div class="stack-actions">
            <!-- Names the view a click switches to, so it is never shown as pressed -->
            <button v-if="isStackView" type="button" class="stack-action view-action" title="Show one fretboard at a time, picked by its tab" @click="emit('toggle-stack-view')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9V7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                Default View
            </button>
            <button v-else type="button" class="stack-action view-action" title="Show every fretboard in the stack, collapsed" @click="emit('toggle-stack-view')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></svg>
                Stack View
            </button>
            <SaveMenu :card-name="cardName" :is-dirty="isDirty" @save="emit('save')" @save-as-new="emit('save-as-new')"/>
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

// Less room on the right when the × follows the name
.chip-select:not(:last-child) {
    padding-right: 0.3rem;
}

// Quiet until hovered, so the name stays the main thing on the tab
.chip-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    padding: 0;
    opacity: 0.6;

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

.view-action {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background-color: var(--option-background-color);
}

// No tabs to join a card: the bar is a plain row above the list
.is-stack-view {
    align-items: center;

    .add-chord {
        margin-left: 0;
    }

    .stack-actions {
        margin-bottom: 0;
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
