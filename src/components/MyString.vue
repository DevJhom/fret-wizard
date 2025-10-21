<script setup lang="ts">
import { computed } from 'vue';
import { CurrentStrings, CurrentCAGED } from '@/stores/usePatternStore';
import { isCAGED } from '@data/CAGED';
import { Accidental, Tonality, Degree } from '@data/constants';
import { getRoots, getMinorSeconds, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from '@data/intervals';
import { getRootNoteName, getMinorSecondNoteName, getSecondNoteName, getThirdNoteName, getFourthNoteName, getFifthNoteName, getSixthNoteName, getSeventhNoteName, getBlueNoteName } from '@data/noteNames';

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
    currentStrings: CurrentStrings
}>();

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritone, fifths, minorSixths, sixths, minorSevenths, sevenths, blues } = Degree;

// x is a placeholder for string e.g. eRoots, eSeconds, etc.
const xRoots = computed(() => getRoots(props.currentTonality, props.currentKey, props.stringName));
const xMinorSeconds = computed(() => getMinorSeconds(props.currentTonality, props.currentKey, props.stringName));
const xSeconds = computed(() => getSeconds(props.currentTonality, props.currentKey, props.stringName));
const xThirds = computed(() => getThirds(props.currentTonality, props.currentKey, props.stringName));
const xFourths = computed(() => getFourths(props.currentTonality, props.currentKey, props.stringName));
const xFifths = computed(() => getFifths(props.currentTonality, props.currentKey, props.stringName));
const xSixths = computed(() => getSixths(props.currentTonality, props.currentKey, props.stringName));
const xSevenths = computed(() => getSevenths(props.currentTonality, props.currentKey, props.stringName));
const xBlues = computed(() => getBlues(props.currentTonality, props.currentKey, props.stringName));

// Note Names
const rootNoteName = computed(() => getRootNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const minorSecondNoteName = computed(() => getMinorSecondNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const secondNoteName = computed(() => getSecondNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const thirdNoteName = computed(() => getThirdNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const fourthNoteName = computed(() => getFourthNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const fifthNoteName = computed(() => getFifthNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const sixthNoteName = computed(() => getSixthNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const seventhNoteName = computed(() => getSeventhNoteName(props.currentTonality, props.currentKey, props.currentAccidental));
const blueNoteName = computed(() => getBlueNoteName(props.currentTonality, props.currentKey, props.currentAccidental));

const isStringActive = computed(() => {
    return props.currentStrings[props.stringName];
})

//THE CAGED System
const currentHighlightCAGED = computed(() => {
    return Object.keys(props.currentCAGED).filter(key => props.currentCAGED[key]);
})

const openIndex = 11; //equivalent note to the open position
</script>

<template>
    <div class="d-inline-block open-position">
        <label class="notes open-note">
            <input type="checkbox" v-model="stringData[openIndex]"/>
            <div class="checkbox__checkmark"
                :class="{
                            'root-note': props.currentHighlightNotes.includes(roots) ? xRoots?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '', 
                            'minor-second': props.currentHighlightNotes.includes(minorSeconds) ? xMinorSeconds?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'second': props.currentHighlightNotes.includes(seconds) ? xSeconds?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'third': props.currentHighlightNotes.includes(thirds) ? xThirds?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'fourth': props.currentHighlightNotes.includes(fourths) ? xFourths?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'fifth': props.currentHighlightNotes.includes(fifths) ? xFifths?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'sixth': props.currentHighlightNotes.includes(sixths) ? xSixths?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'seventh': props.currentHighlightNotes.includes(sevenths) ? xSevenths?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                            'blue': props.currentHighlightNotes.includes(blues) ? xBlues?.includes(openIndex + 1) && isStringActive && isCAGED(openIndex, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                        }">
            </div>
        </label>
    </div>
    <div v-for="(_, index) in stringData" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" :style="{ 'border-right': isLastString ? 'none' : '' }">
        <label v-if="index < fretAmount" class="notes">
            <input type="checkbox" v-model="stringData[index]"/>
            <div class="checkbox__checkmark" 
                :class="{
                    'root-note': props.currentHighlightNotes.includes(roots) ? xRoots?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '', 
                    'minor-second': props.currentHighlightNotes.includes(minorSeconds) ? xMinorSeconds?.includes(index + 1) && isStringActive && true: '',
                    'second': props.currentHighlightNotes.includes(seconds) ? xSeconds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'third': props.currentHighlightNotes.includes(thirds) ? xThirds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'fourth': props.currentHighlightNotes.includes(fourths) ? xFourths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'fifth': props.currentHighlightNotes.includes(fifths) ? xFifths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'sixth': props.currentHighlightNotes.includes(sixths) ? xSixths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'seventh': props.currentHighlightNotes.includes(sevenths) ? xSevenths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                    'blue': props.currentHighlightNotes.includes(blues) ? xBlues?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED): '',
                }">
                <span v-if="props.currentHighlightNotes.includes(roots) && xRoots?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ rootNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(minorSeconds) && xMinorSeconds?.includes(index + 1) && isStringActive && true" class="note-names">{{ minorSecondNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(seconds) && xSeconds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ secondNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(thirds) && xThirds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ thirdNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(fourths) && xFourths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ fourthNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(fifths) && xFifths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ fifthNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(sixths) && xSixths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ sixthNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(sevenths) && xSevenths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ seventhNoteName }}</span>
                <span v-if="props.currentHighlightNotes.includes(blues) && xBlues?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, props.currentTonality, currentHighlightCAGED)" class="note-names">{{ blueNoteName }}</span>
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
    min-width: 2rem;
    max-width: 50px;
    border-right: 1px solid gray;
}

@media only screen and (max-width: 1024px) and (orientation: landscape) {
    .fret {
        min-width: 1.5rem;
    }
}
</style>

