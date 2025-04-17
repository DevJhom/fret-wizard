<script setup lang="ts">
import { computed } from 'vue';
import { PropType } from 'vue';
import { storeToRefs } from 'pinia';
import { usePatternStore } from '@/stores/usePatternStore';
import { isCAGED } from '@data/CAGED';
import { getRoots, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from '@data/intervals';
import { getRootNoteName, getSecondNoteName, getThirdNoteName, getFourthNoteName, getFifthNoteName, getSixthNoteName, getSeventhNoteName, getBlueNoteName } from './data/noteNames';

const patternStore = usePatternStore();
const { currentKey, currentHighlightNotes, currentStrings, currentCAGED } = storeToRefs(patternStore);

const props = defineProps({
  stringName: String,
  stringData: {
    type: Array as PropType<string[]>,
    required: true 
  },
  fretAmount: Number,
  isLastString: Boolean
});

// x is a placeholder for string e.g. eRoots, eSeconds, etc.
const xRoots = computed(() => getRoots(currentKey.value, props.stringName));
const xSeconds = computed(() => getSeconds(currentKey.value, props.stringName));
const xThirds = computed(() => getThirds(currentKey.value, props.stringName));
const xFourths = computed(() => getFourths(currentKey.value, props.stringName));
const xFifths = computed(() => getFifths(currentKey.value, props.stringName));
const xSixths = computed(() => getSixths(currentKey.value, props.stringName));
const xSevenths = computed(() => getSevenths(currentKey.value, props.stringName));
const xBlues = computed(() => getBlues(currentKey.value, props.stringName));

// Note Names
const rootNoteName = computed(() => getRootNoteName(currentKey.value));
const secondNoteName = computed(() => getSecondNoteName(currentKey.value));
const thirdNoteName = computed(() => getThirdNoteName(currentKey.value));
const fourthNoteName = computed(() => getFourthNoteName(currentKey.value));
const fifthNoteName = computed(() => getFifthNoteName(currentKey.value));
const sixthNoteName = computed(() => getSixthNoteName(currentKey.value));
const seventhNoteName = computed(() => getSeventhNoteName(currentKey.value));
const blueNoteName = computed(() => getBlueNoteName(currentKey.value));

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
                    'root-note': currentHighlightNotes.includes('roots') ? xRoots?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '', 
                    'second': currentHighlightNotes.includes('seconds') ? xSeconds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'third': currentHighlightNotes.includes('thirds') ? xThirds?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'fourth': currentHighlightNotes.includes('fourths') ? xFourths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'fifth': currentHighlightNotes.includes('fifths') ? xFifths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'sixth': currentHighlightNotes.includes('sixths') ? xSixths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'seventh': currentHighlightNotes.includes('sevenths') ? xSevenths?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                    'blue': currentHighlightNotes.includes('blues') ? xBlues?.includes(index + 1) && isStringActive && isCAGED(index, stringName, currentKey, currentHighlightCAGED): '',
                }">
                <span v-if="currentHighlightNotes.includes('roots') && xRoots?.includes(index + 1) && isStringActive" class="note-names">{{ rootNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('seconds') && xSeconds?.includes(index + 1) && isStringActive" class="note-names">{{ secondNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('thirds') && xThirds?.includes(index + 1) && isStringActive" class="note-names">{{ thirdNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('fourths') && xFourths?.includes(index + 1) && isStringActive" class="note-names">{{ fourthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('fifths') && xFifths?.includes(index + 1) && isStringActive" class="note-names">{{ fifthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('sixths') && xSixths?.includes(index + 1) && isStringActive" class="note-names">{{ sixthNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('sevenths') && xSevenths?.includes(index + 1) && isStringActive" class="note-names">{{ seventhNoteName }}</span>
                <span v-if="currentHighlightNotes.includes('blues') && xBlues?.includes(index + 1) && isStringActive" class="note-names">{{ blueNoteName }}</span>
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
</style>

