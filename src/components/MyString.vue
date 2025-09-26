<script setup lang="ts">
import { computed } from 'vue';
import { PropType } from 'vue';
import { storeToRefs } from 'pinia';
import { usePatternStore } from '@/stores/usePatternStore';
import { isCAGED } from '@data/CAGED';
import { getRoots, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from '@data/intervals';
import { getRootNoteName, getSecondNoteName, getThirdNoteName, getFourthNoteName, getFifthNoteName, getSixthNoteName, getSeventhNoteName, getBlueNoteName } from '@data/noteNames';

const patternStore = usePatternStore();
const { currentHighlightNotes, currentStrings, currentCAGED, currentAccidental, currentTonality } = storeToRefs(patternStore);

const props = defineProps({
  stringName: String,
  stringData: {
    type: Array as PropType<string[]>,
    required: true 
  },
  fretAmount: Number,
  isLastString: Boolean,
  currentKey: String,
});

// x is a placeholder for string e.g. eRoots, eSeconds, etc.
const xRoots = computed(() => getRoots(currentTonality.value, props.currentKey, props.stringName));
const xSeconds = computed(() => getSeconds(currentTonality.value, props.currentKey, props.stringName));
const xThirds = computed(() => getThirds(currentTonality.value, props.currentKey, props.stringName));
const xFourths = computed(() => getFourths(currentTonality.value, props.currentKey, props.stringName));
const xFifths = computed(() => getFifths(currentTonality.value, props.currentKey, props.stringName));
const xSixths = computed(() => getSixths(currentTonality.value, props.currentKey, props.stringName));
const xSevenths = computed(() => getSevenths(currentTonality.value, props.currentKey, props.stringName));
const xBlues = computed(() => getBlues(currentTonality.value, props.currentKey, props.stringName));

// Note Names
const rootNoteName = computed(() => getRootNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const secondNoteName = computed(() => getSecondNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const thirdNoteName = computed(() => getThirdNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const fourthNoteName = computed(() => getFourthNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const fifthNoteName = computed(() => getFifthNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const sixthNoteName = computed(() => getSixthNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const seventhNoteName = computed(() => getSeventhNoteName(currentTonality.value, props.currentKey, currentAccidental.value));
const blueNoteName = computed(() => getBlueNoteName(currentTonality.value, props.currentKey, currentAccidental.value));

const isStringActive = computed(() => {
    return currentStrings.value[props.stringName];
})

//THE CAGED System
const currentHighlightCAGED = computed(() => {
    return Object.keys(currentCAGED.value).filter(key => currentCAGED.value[key]);
})

</script>

<template>
    <div v-for="(_, index) in stringData" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" :style="{ 'border-right': isLastString ? 'none' : '' }">
        <label v-if="index < fretAmount" class="notes">
            <input type="checkbox" v-model="stringData[index]"/>
            <div class="checkbox__checkmark" 
                :class="{
                    'root-note': currentHighlightNotes.includes('roots') ? xRoots?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '', 
                    'second': currentHighlightNotes.includes('seconds') ? xSeconds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'third': currentHighlightNotes.includes('thirds') ? xThirds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'fourth': currentHighlightNotes.includes('fourths') ? xFourths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'fifth': currentHighlightNotes.includes('fifths') ? xFifths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'sixth': currentHighlightNotes.includes('sixths') ? xSixths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'seventh': currentHighlightNotes.includes('sevenths') ? xSevenths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                    'blue': currentHighlightNotes.includes('blues') ? xBlues?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED): '',
                }">
                <span v-if="currentHighlightNotes.includes('roots') && xRoots?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ rootNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('seconds') && xSeconds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ secondNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('thirds') && xThirds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ thirdNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('fourths') && xFourths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ fourthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('fifths') && xFifths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ fifthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('sixths') && xSixths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ sixthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('sevenths') && xSevenths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ seventhNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('blues') && xBlues?.includes(index + 1) && isStringActive && isCAGED(index, stringName, props.currentKey, currentTonality, currentHighlightCAGED)" class="note-names">{{ blueNoteName }}</span>
            </div>
        </label>
    </div>
</template>


<style scoped lang="scss">
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

