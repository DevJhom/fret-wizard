<script setup lang="ts">
import { computed } from 'vue';
import { Setup } from '@data/constants';
import { patternTitle, patternSubtitle } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';
import PatternBoard from '@components/PatternBoard.vue';

const props = defineProps<{
    chord: FretboardData,
    setup: Setup,
    labelMode?: 'notes' | 'intervals',
    removable: boolean
}>();

const emit = defineEmits<{
    (e: 'edit'): void
    (e: 'remove'): void
}>();

const isScale = computed(() => props.setup == Setup.Scale);
const title = computed(() => patternTitle(props.chord.currentKey, props.chord.currentTonality, props.chord.currentPattern, isScale.value));
const subtitle = computed(() => patternSubtitle(props.chord.currentKey, props.chord.currentTonality, props.chord.currentPattern, isScale.value));

// A chord's subtitle already spells out its symbol: "C major seventh"
const fullName = computed(() => isScale.value ? `${title.value} ${subtitle.value}` : subtitle.value);
</script>

<template>
    <article class="stack-row">
        <!-- The page's SortableJS list drags rows by this handle -->
        <span class="drag-handle" title="Drag to reorder" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
        </span>

        <div class="row-name">
            <div class="row-title">{{ title }}</div>
            <div class="row-subtitle">{{ subtitle }}</div>
        </div>

        <div class="board-scroll">
            <PatternBoard class="board" :chord="chord" :setup="setup" :label-mode="labelMode"/>
        </div>

        <div class="row-actions">
            <button type="button" class="row-action" :aria-label="`Edit ${fullName}`" @click="emit('edit')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>
                Edit
            </button>
            <button v-if="removable" type="button" class="row-action remove-action" :aria-label="`Remove ${fullName}`" title="Remove from the stack" @click="emit('remove')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
            </button>
        </div>
    </article>
</template>

<style scoped lang="scss">
// One fretboard of the stack, collapsed: a drag handle, its name, its neck, then Edit and Remove
.stack-row {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.75rem 1rem 0.75rem 0.5rem;
    border-radius: 14px;
    background-color: var(--fretboard-background-color);
    box-shadow: var(--fretboard-shadow);
    text-align: start;
}

// Where the row will land while it is being dragged
.stack-row.sortable-ghost {
    opacity: 0.4;
}

// The only part that drags, so the neck can still be scrolled and the buttons pressed
.drag-handle {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    align-self: stretch;
    width: 28px;
    margin-right: -0.75rem;
    border-radius: 8px;
    color: var(--muted-text-color);
    cursor: grab;
    touch-action: none;

    &:hover {
        background-color: var(--option-background-color);
        color: inherit;
    }

    &:active {
        cursor: grabbing;
    }
}

// Fixed width so the necks line up from row to row
.row-name {
    flex: none;
    width: 11rem;
}

.row-title {
    font-size: 1.5rem;
    line-height: 1.15;
    font-weight: 700;
    color: var(--accent-text-color);
}

.row-subtitle {
    margin-top: 0.2rem;
    color: $gray-1;
}

// Scrolls the neck inside the row when it is wider than the space left for it
.board-scroll {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    scrollbar-color: var(--card-border-color) transparent;
}

.board {
    flex: none;
}

// Sits at the top of the row instead of centring against the neck
.row-actions {
    display: flex;
    flex: none;
    align-self: flex-start;
    gap: 2px;
}

.row-action {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 44px;
    padding: 0 0.75rem;
    border: 1px solid transparent;
    border-radius: 9px;
    background: none;
    color: var(--muted-text-color);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        border-color: transparent;
        background-color: var(--option-background-color);
        color: inherit;
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.remove-action {
    justify-content: center;
    width: 44px;
    padding: 0;

    &:hover {
        color: var(--danger-color);
    }
}

// Handle, name and buttons share the first line; the neck gets the full width underneath
@media (max-width: $phone) {
    .stack-row {
        flex-wrap: wrap;
        gap: 0.25rem 1rem;
        padding: 0.5rem 0.5rem 0.75rem 0.25rem;
    }

    .drag-handle {
        margin-right: -0.5rem;
    }

    .row-name {
        display: flex;
        flex: 1 1 0;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0 0.6rem;
        width: auto;
        min-width: 0;
    }

    .row-title {
        font-size: 1.25rem;
    }

    .row-subtitle {
        margin-top: 0;
    }

    .board-scroll {
        order: 1;
        flex-basis: 100%;
    }
}
</style>
