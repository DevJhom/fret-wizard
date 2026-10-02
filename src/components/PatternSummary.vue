<script setup lang="ts">
import { computed } from 'vue';
import { Degree, Setup, degreeInPattern } from '@data/constants';
import { getNoteName } from '@data/noteNames';
import { patternTitle, patternSubtitle, degreeLabel } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';

const props = defineProps<{
    chord: FretboardData,
    setup: Setup
}>();

const emit = defineEmits<{
    (e: 'toggle-tone', degree: Degree): void
}>();

const degreeClasses: Record<Degree, string> = {
    [Degree.roots]: 'root-note',
    [Degree.minorSeconds]: 'minor-second',
    [Degree.seconds]: 'second',
    [Degree.minorThirds]: 'minor-third',
    [Degree.thirds]: 'third',
    [Degree.fourths]: 'fourth',
    [Degree.tritones]: 'tritone',
    [Degree.fifths]: 'fifth',
    [Degree.minorSixths]: 'minor-sixth',
    [Degree.sixths]: 'sixth',
    [Degree.minorSevenths]: 'minor-seventh',
    [Degree.sevenths]: 'seventh',
};

const isScale = computed(() => props.setup == Setup.Scale);
const symbol = computed(() => patternTitle(props.chord.currentKey, props.chord.currentTonality, props.chord.currentPattern, isScale.value));
const fullName = computed(() => patternSubtitle(props.chord.currentKey, props.chord.currentTonality, props.chord.currentPattern, isScale.value));

const tones = computed(() => {
    const degrees = degreeInPattern(props.chord.currentPattern, props.chord.currentTonality) ?? [];
    return degrees.map(degree => ({
        degree,
        name: getNoteName(degree, props.chord.currentKey, props.chord.currentAccidental),
        label: degreeLabel(degree, props.chord.currentPattern),
        className: degreeClasses[degree],
        isVisible: props.chord.currentHighlightNotes.includes(degree),
    }));
});
</script>

<template>
    <div class="pattern-summary">
        <div class="chord-symbol">{{ symbol }}</div>
        <div class="chord-full-name">{{ fullName }}</div>
        <div class="tone-list">
            <button
                v-for="tone in tones"
                :key="tone.degree"
                type="button"
                class="tone-chip"
                :class="{ 'tone-hidden': !tone.isVisible }"
                :aria-pressed="tone.isVisible"
                :title="tone.isVisible ? 'Hide on the fretboard' : 'Show on the fretboard'"
                @click="emit('toggle-tone', tone.degree)"
            >
                <span class="degree-dot" :class="tone.isVisible ? tone.className : ''">{{ tone.label }}</span>
                <span class="tone-name">{{ tone.name }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pattern-summary {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 300px;
    flex-shrink: 0;
}

.chord-symbol {
    font-size: 4rem;
    line-height: 1;
    font-weight: 700;
    color: var(--accent-text-color);
}

.chord-full-name {
    margin: 0.4rem 0 1rem;
    color: $gray-1;
}

.tone-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tone-chip {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    height: 44px;
    padding: 0 0.8rem 0 0.4rem;
    border: 1px solid transparent;
    border-radius: 22px;
    background-color: var(--option-background-color);
    color: inherit;
    cursor: pointer;

    &:hover {
        border-color: $yellow;
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.degree-dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    font-size: 0.75rem;
    line-height: 1;
    font-weight: 700;
    color: #141414;
    box-shadow: var(--note-ring);

    &.minor-second,
    &.minor-third {
        color: #ffffff;
    }
}

.tone-name {
    font-weight: 700;
}

.tone-hidden {
    opacity: 0.5;

    .degree-dot {
        color: inherit;
        box-shadow: inset 0 0 0 2px $gray-1;
    }
}

@media (max-width: $phone) {
    .pattern-summary {
        width: 100%;
    }

    .chord-symbol {
        font-size: 2.5rem;
    }
}
</style>
