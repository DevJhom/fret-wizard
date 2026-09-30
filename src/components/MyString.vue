<script setup lang="ts">
import { computed } from 'vue';
import { CurrentStrings, CurrentCAGED } from '@/lib/fretboardData';
import { isCAGED } from '@data/CAGED';
import { Accidental, Tonality, Degree, Pattern } from '@data/constants';
import { getRoots, getMinorSeconds, getSeconds, getMinorThirds, getThirds, getFourths, getTritones, getFifths, getSixths, getSevenths, getMinorSixths, getMinorSevenths } from '@data/intervals';
import { getNoteName } from '@data/noteNames';
import { degreeLabel } from '@data/patternNames';

const props = defineProps<{
    stringName: string,
    stringData: string[],
    fretAmount: number,
    isLastString?: boolean,
    currentKey: string,
    currentTonality: Tonality,
    currentAccidental: Accidental,
    currentHighlightNotes: string[],
    currentCAGED: CurrentCAGED,
    currentStrings: CurrentStrings,
    currentPattern?: Pattern,
    fadeOutsideShape?: boolean,
    rootBasedShapes?: boolean,
    labelMode?: 'notes' | 'intervals',
    chordPositions?: number[],
    barPositions?: number[]
}>();

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths } = Degree;

// Intervals for string
const rootIntervals = computed(() => getRoots(props.currentTonality, props.currentKey, props.stringName));
const minorSecondIntervals = computed(() => getMinorSeconds(props.currentTonality, props.currentKey, props.stringName));
const secondIntervals = computed(() => getSeconds(props.currentTonality, props.currentKey, props.stringName));
const minorThirdIntervals = computed(() => getMinorThirds(props.currentTonality, props.currentKey, props.stringName));
const thirdIntervals = computed(() => getThirds(props.currentTonality, props.currentKey, props.stringName));
const fourthIntervals = computed(() => getFourths(props.currentTonality, props.currentKey, props.stringName));
const tritoneIntervals = computed(() => getTritones(props.currentTonality, props.currentKey, props.stringName));
const fifthIntervals = computed(() => getFifths(props.currentTonality, props.currentKey, props.stringName));
const minorSixthIntervals = computed(() => getMinorSixths(props.currentTonality, props.currentKey, props.stringName));
const sixthIntervals = computed(() => getSixths(props.currentTonality, props.currentKey, props.stringName));
const minorSeventhIntervals = computed(() => getMinorSevenths(props.currentTonality, props.currentKey, props.stringName));
const seventhIntervals = computed(() => getSevenths(props.currentTonality, props.currentKey, props.stringName));

// Note Names
const rootNoteName = computed(() => getNoteName(roots, props.currentKey, props.currentAccidental));
const minorSecondNoteName = computed(() => getNoteName(minorSeconds, props.currentKey, props.currentAccidental));
const secondNoteName = computed(() => getNoteName(seconds, props.currentKey, props.currentAccidental));
const minorThirdNoteName = computed(() => getNoteName(minorThirds, props.currentKey, props.currentAccidental));
const thirdNoteName = computed(() => getNoteName(thirds, props.currentKey, props.currentAccidental));
const fourthNoteName = computed(() => getNoteName(fourths, props.currentKey, props.currentAccidental));
const tritoneNoteName = computed(() => getNoteName(tritones, props.currentKey, props.currentAccidental));
const fifthNoteName = computed(() => getNoteName(fifths, props.currentKey, props.currentAccidental));
const minorSixthNoteName = computed(() => getNoteName(minorSixths, props.currentKey, props.currentAccidental));
const sixthNoteName = computed(() => getNoteName(sixths, props.currentKey, props.currentAccidental));
const minorSeventhNoteName = computed(() => getNoteName(minorSevenths, props.currentKey, props.currentAccidental));
const seventhNoteName = computed(() => getNoteName(sevenths, props.currentKey, props.currentAccidental));

const isStringActive = computed(() => {
    return props.currentStrings[props.stringName];
})

//THE CAGED System
const currentHighlightCAGED = computed(() => {
    return Object.keys(props.currentCAGED).filter(key => props.currentCAGED[key]);
})

const isInShape = (index: number) => {
    const tonality = props.rootBasedShapes ? Tonality.MAJOR : props.currentTonality;
    return isCAGED(index, props.stringName, props.currentKey, tonality, currentHighlightCAGED.value);
}

const isOutsideShape = (index: number) => {
    return !!props.fadeOutsideShape && !isInShape(index);
}

const showShapeBand = computed(() => {
    return !!props.fadeOutsideShape && !props.isLastString && currentHighlightCAGED.value.length < Object.keys(props.currentCAGED).length;
})

const isNoteActive = (index: number, noteName: Degree, noteIntervals: number[]) => {
    const isNoteHighlighted = props.currentHighlightNotes.includes(noteName);
    const isInIntervals = noteIntervals?.includes(index + 1);

    return (
        isNoteHighlighted &&
        isInIntervals &&
        (props.fadeOutsideShape || isInShape(index)) &&
        (!props.chordPositions || props.chordPositions.includes(index + 1)) &&
        isStringActive.value
    );
}

const noteLabel = (degree: Degree, noteName: string) => {
    return props.labelMode === 'intervals' && props.currentPattern ? degreeLabel(degree, props.currentPattern) : noteName;
}

const openIndex = 11; //equivalent note to the open position
</script>

<template>
    <div class="d-inline-block open-position">
        <label class="notes open-note">
            <input type="checkbox" v-model="stringData[openIndex]"/>
            <div class="checkbox__checkmark"
                :class="{
                            'outside-shape': isOutsideShape(openIndex),
                            'root-note': isNoteActive(openIndex, roots, rootIntervals), 
                            'minor-second': isNoteActive(openIndex, minorSeconds, minorSecondIntervals),
                            'second': isNoteActive(openIndex, seconds, secondIntervals),
                            'minor-third': isNoteActive(openIndex, minorThirds, minorThirdIntervals),
                            'third': isNoteActive(openIndex, thirds, thirdIntervals),
                            'fourth': isNoteActive(openIndex, fourths, fourthIntervals),
                            'tritone': isNoteActive(openIndex, tritones, tritoneIntervals),
                            'fifth': isNoteActive(openIndex, fifths, fifthIntervals),
                            'minor-sixth': isNoteActive(openIndex, minorSixths, minorSixthIntervals),
                            'sixth': isNoteActive(openIndex, sixths, sixthIntervals),
                            'minor-seventh': isNoteActive(openIndex, minorSevenths, minorSeventhIntervals),
                            'seventh': isNoteActive(openIndex, sevenths, seventhIntervals)
                        }">
            </div>
        </label>
    </div>
    <div v-for="(_, index) in stringData" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount, 'shape-band': showShapeBand && index < fretAmount && isInShape(index)}" :style="{ 'border-right': isLastString ? 'none' : '' }">
        <div v-if="barPositions?.includes(index + 1) && index < fretAmount" class="bar"></div>
        <label v-if="index < fretAmount" class="notes">
            <input type="checkbox" v-model="stringData[index]"/>
            <div class="checkbox__checkmark" 
                :class="{
                    'outside-shape': isOutsideShape(index),
                    'root-note': isNoteActive(index, roots, rootIntervals), 
                    'minor-second': isNoteActive(index, minorSeconds, minorSecondIntervals),
                    'second': isNoteActive(index, seconds, secondIntervals),
                    'minor-third': isNoteActive(index, minorThirds, minorThirdIntervals),
                    'third': isNoteActive(index, thirds, thirdIntervals),
                    'fourth': isNoteActive(index, fourths, fourthIntervals),
                    'tritone': isNoteActive(index, tritones, tritoneIntervals),
                    'fifth': isNoteActive(index, fifths, fifthIntervals),
                    'minor-sixth': isNoteActive(index, minorSixths, minorSixthIntervals),
                    'sixth': isNoteActive(index, sixths, sixthIntervals),
                    'minor-seventh': isNoteActive(index, minorSevenths, minorSeventhIntervals),
                    'seventh': isNoteActive(index, sevenths, seventhIntervals)
                }">
                <span v-if="isNoteActive(index, roots, rootIntervals)" class="note-names">{{ noteLabel(roots, rootNoteName) }}</span>
                <span v-if="isNoteActive(index, minorSeconds, minorSecondIntervals)" class="note-names">{{ noteLabel(minorSeconds, minorSecondNoteName) }}</span>
                <span v-if="isNoteActive(index, seconds, secondIntervals)" class="note-names">{{ noteLabel(seconds, secondNoteName) }}</span>
                <span v-if="isNoteActive(index, minorThirds, minorThirdIntervals)" class="note-names">{{ noteLabel(minorThirds, minorThirdNoteName) }}</span>
                <span v-if="isNoteActive(index, thirds, thirdIntervals)" class="note-names">{{ noteLabel(thirds, thirdNoteName) }}</span>
                <span v-if="isNoteActive(index, fourths, fourthIntervals)" class="note-names">{{ noteLabel(fourths, fourthNoteName) }}</span>
                <span v-if="isNoteActive(index, tritones, tritoneIntervals)" class="note-names">{{ noteLabel(tritones, tritoneNoteName) }}</span>
                <span v-if="isNoteActive(index, fifths, fifthIntervals)" class="note-names">{{ noteLabel(fifths, fifthNoteName) }}</span>
                <span v-if="isNoteActive(index, minorSixths, minorSixthIntervals)" class="note-names">{{ noteLabel(minorSixths, minorSixthNoteName) }}</span>
                <span v-if="isNoteActive(index, sixths, sixthIntervals)" class="note-names">{{ noteLabel(sixths, sixthNoteName) }}</span>
                <span v-if="isNoteActive(index, minorSevenths, minorSeventhIntervals)" class="note-names">{{ noteLabel(minorSevenths, minorSeventhNoteName) }}</span>
                <span v-if="isNoteActive(index, sevenths, seventhIntervals)" class="note-names">{{ noteLabel(sevenths, seventhNoteName) }}</span>
            </div>
        </label>
    </div>
</template>

<style scoped lang="scss">
.open-position {
    position: absolute;
    margin-left: -15px;
}

.fret {
    position: relative;
    min-width: 2rem;
    max-width: 50px;
    border-right: 1px solid var(--fret-wire-color);
}

.shape-band {
    background-color: var(--shape-band-color);
}

.bar {
    position: absolute;
    height: 110%;
    width: 8px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--string-color);
}

.outside-shape {
    opacity: 0.25;
}

@media only screen and (max-width: 1024px) and (orientation: landscape) {
    .fret {
        min-width: 1.5rem;
    }
}
</style>

