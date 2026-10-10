<script setup lang="ts">
import { computed } from 'vue';
import { Setup } from '@data/constants';
import { getScale } from '@data/intervals';
import { getChordPositions, getBarPositions } from '@data/chords';
import { defaultData, isFingeringView, CurrentStrings, FretboardData } from '@/lib/fretboardData';
import MyFretboard from '@components/MyFretboard.vue';

const props = defineProps<{
    chord: FretboardData,
    setup: Setup,
    labelMode?: 'notes' | 'intervals',
    stringToggles?: boolean
}>();

const emit = defineEmits<{
    (e: 'toggle-string', stringName: keyof CurrentStrings): void
}>();

const board = computed(() => getScale(props.chord.currentTonality, props.chord.currentPattern, props.chord.currentKey));

const isFingering = computed(() => isFingeringView(props.chord, props.setup));

const boardCAGED = computed(() => isFingering.value ? defaultData.currentCAGED : props.chord.currentCAGED);
const chordPositions = computed(() => isFingering.value ? getChordPositions(props.chord.currentPattern, props.chord.currentKey, props.chord.currentChordPosition, props.chord.currentTonality) : undefined);
const barPositions = computed(() => isFingering.value ? getBarPositions(props.chord.currentPattern, props.chord.currentKey, props.chord.currentChordPosition) : undefined);
</script>

<template>
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
        :root-based-shapes="setup != Setup.Scale"
        :string-toggles="stringToggles"
        :label-mode="labelMode"
        @toggle-string="emit('toggle-string', $event)"
    />
</template>
