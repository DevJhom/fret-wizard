<script setup lang="ts">
import { computed } from 'vue';
import { DIAGRAM_FRETS, diagramStrings, ChordNote, ChordVoicing } from '@data/chords';
import { getNoteName } from '@data/noteNames';
import { degreeLabel } from '@data/patternNames';
import { degreeClasses } from '@/lib/degreeClasses';
import { FRET_MARKERS, DOUBLE_INLAY_FRETS, SINGLE_INLAY_FRETS } from '@/lib/fretMarkers';
import type { FretboardData } from '@/lib/fretboardData';

type StringName = ChordNote['string'];

const props = defineProps<{
    voicing: ChordVoicing,
    chord: FretboardData,
    labelMode?: 'notes' | 'intervals'
}>();

// The horizontal neck's sizes and colors (MyFretboard, MyString, notes-input.scss), so the two look alike
const STRING_GAP = 25;
const FRET_GAP = 32;
const NOTE_RADIUS = 9;
const OPEN_RADIUS = 6;
const NUT_WIDTH = 3;
// Room for the fret numbers, on both sides so the grid stays centred under the caption
const SIDE = 22;
// Room above the nut for the open and muted markers
const TOP = 18;

const stringWidths: Record<StringName, number> = { E: 3.5, A: 3, D: 2.5, G: 2, B: 1.5, e: 1 };

const gridWidth = STRING_GAP * (diagramStrings.length - 1);
const gridHeight = FRET_GAP * DIAGRAM_FRETS;
const width = SIDE * 2 + gridWidth;
const height = TOP + gridHeight + 2;
const markerY = TOP - NUT_WIDTH - OPEN_RADIUS;

const stringX = (string: StringName) => SIDE + diagramStrings.indexOf(string) * STRING_GAP;
const betweenX = (low: StringName, high: StringName) => (stringX(low) + stringX(high)) / 2;
const fretY = (fret: number) => TOP + (fret - props.voicing.firstFret + 0.5) * FRET_GAP;

const frets = computed(() => Array.from({ length: DIAGRAM_FRETS }, (_, row) => props.voicing.firstFret + row));
const markedFrets = computed(() => frets.value.filter(fret => FRET_MARKERS.includes(fret)));
const inlays = computed(() => frets.value.flatMap(fret => {
    if (SINGLE_INLAY_FRETS.includes(fret)) return [{ fret, x: betweenX('D', 'G') }];
    if (DOUBLE_INLAY_FRETS.includes(fret)) return [{ fret, x: betweenX('A', 'D') }, { fret, x: betweenX('G', 'B') }];
    return [];
}));

const noteOn = (string: StringName) => props.voicing.notes.find(note => note.string == string);
const fretted = computed(() => props.voicing.notes.filter(note => note.fret > 0));
const opened = computed(() => props.voicing.notes.filter(note => note.fret == 0));
const muted = computed(() => diagramStrings.filter(string => !noteOn(string)));

const label = (note: ChordNote) => props.labelMode === 'intervals'
    ? degreeLabel(note.degree, props.chord.currentPattern)
    : getNoteName(note.degree, props.chord.currentKey, props.chord.currentPattern);

const description = computed(() => `${props.voicing.shape} shape: ${diagramStrings.map(string => noteOn(string)?.fret ?? 'x').join(' ')}`);
</script>

<template>
    <figure class="vertical-chord">
        <svg class="diagram" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="description">
            <rect class="neck" :x="stringX('E')" :y="TOP" :width="gridWidth" :height="gridHeight"/>
            <circle v-for="inlay in inlays" :key="`inlay-${inlay.fret}-${inlay.x}`" class="inlay" :cx="inlay.x" :cy="fretY(inlay.fret)" r="3.5"/>
            <line v-for="row in DIAGRAM_FRETS + 1" :key="`fret-${row}`" class="fret" :x1="stringX('E')" :x2="stringX('e')" :y1="TOP + (row - 1) * FRET_GAP" :y2="TOP + (row - 1) * FRET_GAP"/>
            <line v-for="string in diagramStrings" :key="string" class="string" :x1="stringX(string)" :x2="stringX(string)" :y1="TOP" :y2="TOP + gridHeight" :stroke-width="stringWidths[string]"/>
            <rect v-if="voicing.firstFret == 1" class="nut" :x="stringX('E') - stringWidths.E / 2" :y="TOP - NUT_WIDTH" :width="gridWidth + (stringWidths.E + stringWidths.e) / 2" :height="NUT_WIDTH"/>

            <text v-for="fret in markedFrets" :key="`number-${fret}`" class="fret-number" :x="SIDE - 8" :y="fretY(fret)">{{ fret }}</text>

            <path v-for="string in muted" :key="`muted-${string}`" class="muted-mark" :d="`M${stringX(string) - 4} ${markerY - 4}l8 8m0 -8l-8 8`"/>
            <g v-for="note in opened" :key="`open-${note.string}`" :class="degreeClasses[note.degree]">
                <circle class="note" :cx="stringX(note.string)" :cy="markerY" :r="OPEN_RADIUS"/>
                <circle class="note-ring" :cx="stringX(note.string)" :cy="markerY" :r="OPEN_RADIUS - 0.5"/>
            </g>

            <!-- Before the notes, so they draw over it -->
            <rect
                v-if="voicing.barre"
                class="barre"
                :x="stringX(voicing.barre.from) - 4"
                :y="fretY(voicing.barre.fret) - 4"
                :width="stringX(voicing.barre.to) - stringX(voicing.barre.from) + 8"
                height="8"
            />
            <g v-for="note in fretted" :key="`note-${note.string}`" :class="degreeClasses[note.degree]">
                <circle class="note" :cx="stringX(note.string)" :cy="fretY(note.fret)" :r="NOTE_RADIUS"/>
                <circle class="note-ring" :cx="stringX(note.string)" :cy="fretY(note.fret)" :r="NOTE_RADIUS - 0.5"/>
                <text class="note-name" :x="stringX(note.string)" :y="fretY(note.fret)">{{ label(note) }}</text>
            </g>
        </svg>
        <figcaption class="chord-caption">{{ voicing.shape }} shape</figcaption>
    </figure>
</template>

<style scoped lang="scss">
.vertical-chord {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    margin: 0;
}

// Fret numbers may run past the side margin rather than be clipped
.diagram {
    display: block;
    overflow: visible;
}

.neck {
    fill: var(--neck-background-color);
}

.inlay {
    fill: var(--inlay-color);
}

.fret {
    stroke: var(--fret-wire-color);
    stroke-width: 1;
}

.string {
    stroke: var(--string-color);
}

.nut {
    fill: var(--nut-color);
}

.fret-number {
    fill: currentColor;
    opacity: 0.75;
    font-size: 10.5px;
    text-anchor: end;
    dominant-baseline: central;
}

.muted-mark {
    fill: none;
    stroke: var(--muted-text-color);
    stroke-width: 1.6;
    stroke-linecap: round;
}

.barre {
    fill: var(--string-color);
}

@each $name, $color in $degree-colors {
    .#{$name} .note {
        fill: $color;
    }
}

// The light theme's ring; transparent in the dark theme
.note-ring {
    fill: none;
    stroke: var(--note-ring-color);
    stroke-width: 1;
}

.note-name {
    fill: currentColor;
    font-size: 0.75rem;
    text-anchor: middle;
    dominant-baseline: central;
}

.chord-caption {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--muted-text-color);
}

@media (max-width: $phone) {
    .diagram {
        width: 100%;
        height: auto;
    }
}
</style>
