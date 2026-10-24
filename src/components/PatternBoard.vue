<script setup lang="ts">
import { computed } from 'vue';
import { Setup } from '@data/constants';
import { getScale } from '@data/intervals';
import { CurrentStrings, FretboardData } from '@/lib/fretboardData';
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
</script>

<template>
    <MyFretboard
        :fretAmount="chord.fretAmount"
        :currentPattern="chord.currentPattern"
        :currentKey="chord.currentKey"
        :currentTonality="chord.currentTonality"
        :currentHighlightNotes="chord.currentHighlightNotes"
        :currentCAGED="chord.currentCAGED"
        :currentStrings="chord.currentStrings"
        :E="board.E"
        :A="board.A"
        :D="board.D"
        :G="board.G"
        :B="board.B"
        :e="board.e"
        fade-outside-shape
        :root-based-shapes="setup != Setup.Scale"
        :string-toggles="stringToggles"
        :label-mode="labelMode"
        @toggle-string="emit('toggle-string', $event)"
    />
</template>
