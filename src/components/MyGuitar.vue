<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateCurrentScale, updateScale } from '@services/mock_service';
import { getRoots, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from './intervals';
import { KEY_TO_NUMBER, getRootNoteName, getSecondNoteName, getThirdNoteName, getFourthNoteName, getFifthNoteName, getSixthNoteName, getSeventhNoteName, getBlueNoteName } from './noteNames';
import { isCAGED, isCAGEDNameHere, GetCAGEDName } from './CAGED';
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';

const patternStore = usePatternStore();
const { allKeys, allPatterns, currentKey, currentPattern, currentHighlightNotes, currentStrings, currentCAGED } = storeToRefs(patternStore);

const fretAmount = ref(24);
const fretIndicator = new Array(24);

// Strings
const E = ref();
const A = ref();
const D = ref();
const G = ref();
const B = ref();
const e = ref();

// Roots
const ERoots = computed(() => getRoots(currentKey.value, "E"));
const ARoots = computed(() => getRoots(currentKey.value, "A"));
const DRoots = computed(() => getRoots(currentKey.value, "D"));
const GRoots = computed(() => getRoots(currentKey.value, "G"));
const BRoots = computed(() => getRoots(currentKey.value, "B"));
const eRoots = computed(() => getRoots(currentKey.value, "e"));

// Seconds
const ESeconds = computed(() => getSeconds(currentKey.value, "E"));
const ASeconds = computed(() => getSeconds(currentKey.value, "A"));
const DSeconds = computed(() => getSeconds(currentKey.value, "D"));
const GSeconds = computed(() => getSeconds(currentKey.value, "G"));
const BSeconds = computed(() => getSeconds(currentKey.value, "B"));
const eSeconds = computed(() => getSeconds(currentKey.value, "e"));

// Thirds
const EThirds = computed(() => getThirds(currentKey.value, "E"));
const AThirds = computed(() => getThirds(currentKey.value, "A"));
const DThirds = computed(() => getThirds(currentKey.value, "D"));
const GThirds = computed(() => getThirds(currentKey.value, "G"));
const BThirds = computed(() => getThirds(currentKey.value, "B"));
const eThirds = computed(() => getThirds(currentKey.value, "e"));

// Fourths
const EFourths = computed(() => getFourths(currentKey.value, "E"));
const AFourths = computed(() => getFourths(currentKey.value, "A"));
const DFourths = computed(() => getFourths(currentKey.value, "D"));
const GFourths = computed(() => getFourths(currentKey.value, "G"));
const BFourths = computed(() => getFourths(currentKey.value, "B"));
const eFourths = computed(() => getFourths(currentKey.value, "e"));

// Fifths
const EFifths = computed(() => getFifths(currentKey.value, "E"));
const AFifths = computed(() => getFifths(currentKey.value, "A"));
const DFifths = computed(() => getFifths(currentKey.value, "D"));
const GFifths = computed(() => getFifths(currentKey.value, "G"));
const BFifths = computed(() => getFifths(currentKey.value, "B"));
const eFifths = computed(() => getFifths(currentKey.value, "e"));

// Sixths
const ESixths = computed(() => getSixths(currentKey.value, "E"));
const ASixths = computed(() => getSixths(currentKey.value, "A"));
const DSixths = computed(() => getSixths(currentKey.value, "D"));
const GSixths = computed(() => getSixths(currentKey.value, "G"));
const BSixths = computed(() => getSixths(currentKey.value, "B"));
const eSixths = computed(() => getSixths(currentKey.value, "e"));

// Sevenths
const ESevenths = computed(() => getSevenths(currentKey.value, "E"));
const ASevenths = computed(() => getSevenths(currentKey.value, "A"));
const DSevenths = computed(() => getSevenths(currentKey.value, "D"));
const GSevenths = computed(() => getSevenths(currentKey.value, "G"));
const BSevenths = computed(() => getSevenths(currentKey.value, "B"));
const eSevenths = computed(() => getSevenths(currentKey.value, "e"));

// Blues
const EBlues = computed(() => getBlues(currentKey.value, "E"));
const ABlues = computed(() => getBlues(currentKey.value, "A"));
const DBlues = computed(() => getBlues(currentKey.value, "D"));
const GBlues = computed(() => getBlues(currentKey.value, "G"));
const BBlues = computed(() => getBlues(currentKey.value, "B"));
const eBlues = computed(() => getBlues(currentKey.value, "e"));

// Note Names
const rootNoteName = computed(() => getRootNoteName(currentKey.value));
const secondNoteName = computed(() => getSecondNoteName(currentKey.value));
const thirdNoteName = computed(() => getThirdNoteName(currentKey.value));
const fourthNoteName = computed(() => getFourthNoteName(currentKey.value));
const fifthNoteName = computed(() => getFifthNoteName(currentKey.value));
const sixthNoteName = computed(() => getSixthNoteName(currentKey.value));
const seventhNoteName = computed(() => getSeventhNoteName(currentKey.value));
const blueNoteName = computed(() => getBlueNoteName(currentKey.value));

const fetchCurrentKey = async () => {
    const data = await getCurrentKey();
    currentKey.value = data.key;
}

const fetchScale = async () => {
    const data = await getScale(mapScaleName(), "C");
    const tempData = JSON.parse(JSON.stringify(data))

    for (let i = 0; i < mapCurrentKeyToNumber.value; i++) {
        const lastValueOfE = tempData.E.pop(); 
        tempData.E.unshift(lastValueOfE);

        const lastValueOfA = tempData.A.pop(); 
        tempData.A.unshift(lastValueOfA);

        const lastValueOfD = tempData.D.pop(); 
        tempData.D.unshift(lastValueOfD);

        const lastValueOfG = tempData.G.pop(); 
        tempData.G.unshift(lastValueOfG);

        const lastValueOfB = tempData.B.pop(); 
        tempData.B.unshift(lastValueOfB);

        const lastValueOfe = tempData.e.pop(); 
        tempData.e.unshift(lastValueOfe);
    }

    E.value = tempData.E;
    A.value = tempData.A;
    D.value = tempData.D;
    G.value = tempData.G;
    B.value = tempData.B;
    e.value = tempData.e;
}

const mapScaleName: () => string = () => {
    if(currentPattern.value == 'Pentatonic Scale')
        return 'pentatonic_scale';
    if(currentPattern.value == 'Blue Scale')
        return 'blue_scale';
    if(currentPattern.value == 'Diatonic Scale')
        return 'diatonic_scale';
    if(currentPattern.value == 'Triad Arpeggio')
        return 'triad_arpeggio';
    if(currentPattern.value == 'Custom')
        return 'custom';

    return '';
};

const onChangeCurrentKey = () => {
    fetchScale();
    updateCurrentKey(currentKey.value);
}

const onChangeCurrentPattern = () => {
    fetchScale();
    updateCurrentScale(currentPattern.value);
    patternStore.updateCurrentHighlightNotes();
}

watch([E, A, D, G, B, e], (newValue) => {
    updateScale(mapScaleName(), currentKey.value, {
        E: Object.assign([], newValue[0]), 
        A: Object.assign([], newValue[1]), 
        D: Object.assign([], newValue[2]), 
        G: Object.assign([], newValue[3]),
        B: Object.assign([], newValue[4]),
        e: Object.assign([], newValue[5])
    })
}, { deep: true })

const mapCurrentKeyToNumber = computed(() => {
  const number = KEY_TO_NUMBER[currentKey.value];
  return number;
});

//THE CAGED System
const currentHighlightCAGED = computed(() => {
    return Object.keys(currentCAGED.value).filter(key => currentCAGED.value[key]);
})

onMounted(async () => {
    await fetchCurrentKey();
    await fetchScale();
})
</script>

<template>
    <div class="my-guitar d-flex flex-column align-items-center mt-4">
        <!-- Key Selector -->
        <div class="d-flex justify-content-center align-items-center">
            <span class="me-2 text-yellow fw-bold">
                Key
            </span>
            <div v-for="(key, index) in allKeys" :key="key" class="d-inline-block custom-radio">
                <label class="d-flex flex-column">
                    <input type="radio" name="keys" v-model="currentKey" :value="allKeys[index]" @change="onChangeCurrentKey()">
                        <span class="label"> {{ key }} </span>
                    </input>
                </label>
            </div>
        </div>
        <!-- Pattern Selector -->
        <div class="d-flex justify-content-center align-items-center mt-4">
            <span class="me-2 text-yellow fw-bold">
                Pattern
            </span>
            <div v-for="(scale, index) in allPatterns" :key="scale" class="d-inline-block custom-radio">
                <label class="d-flex flex-column">
                    <input type="radio" name="scales" v-model="currentPattern" :value="allPatterns[index]" @change="onChangeCurrentPattern()">
                        <span class="label px-3">{{ scale }}</span>
                    </input>
                </label>
            </div>
        </div>
        <!-- Fret Indicator -->
        <div class="d-flex mt-5 w-75">
            <div class="d-inline-block string-name"></div>
            <div v-for="(_, index) in fretIndicator" :key="index" class="d-inline-block" :class="{'fret-indicator': index < fretAmount}">
                <div v-if="index < fretAmount">
                    <small v-if="[3,5,7,9,12,15,17,19,21,24].includes(index + 1)" class="opacity-75">
                        {{ index + 1 }}
                    </small>
                </div>
            </div>
        </div>
        <!-- Fretboard -->
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">e</div>
            <!-- Open positions (To be implemented later) -->
            <!-- <div class="d-inline-block">
                <label class="notes small">
                    <input type="checkbox" v-model="E[2]"/>
                        <div class="checkbox__checkmark">
                    </div>
                </label>
            </div> -->
            <div class="fret-start string-E">
                <div v-for="(_, index) in E" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="E[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? ERoots?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? ESeconds?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? EThirds?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? EFourths?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? EFifths?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? ESixths?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? ESevenths?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? EBlues?.includes(index + 1) && currentStrings.E && isCAGED(index, 'E', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && ERoots?.includes(index + 1) && currentStrings.E" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && ESeconds?.includes(index + 1) && currentStrings.E" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && EThirds?.includes(index + 1) && currentStrings.E" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && EFourths?.includes(index + 1) && currentStrings.E" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && EFifths?.includes(index + 1) && currentStrings.E" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && ESixths?.includes(index + 1) && currentStrings.E" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && ESevenths?.includes(index + 1) && currentStrings.E" class="note-names">{{ seventhNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && EBlues?.includes(index + 1) && currentStrings.E" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">B</div>
            <div class="fret-start string-A">
                <div v-for="(_, index) in A" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="A[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? ARoots?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? ASeconds?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? AThirds?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? AFourths?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? AFifths?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? ASixths?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? ASevenths?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? ABlues?.includes(index + 1) && currentStrings.A && isCAGED(index, 'A', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && ARoots?.includes(index + 1) && currentStrings.A" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && ASeconds?.includes(index + 1) && currentStrings.A" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && AThirds?.includes(index + 1) && currentStrings.A" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && AFourths?.includes(index + 1) && currentStrings.A" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && AFifths?.includes(index + 1) && currentStrings.A" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && ASixths?.includes(index + 1) && currentStrings.A" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && ASevenths?.includes(index + 1) && currentStrings.A" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && ABlues?.includes(index + 1) && currentStrings.A" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">G</div>
            <div class="fret-start string-D">
                <div v-for="(_, index) in D" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="D[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? DRoots?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? DSeconds?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? DThirds?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? DFourths?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? DFifths?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? DSixths?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? DSevenths?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? DBlues?.includes(index + 1) && currentStrings.D && isCAGED(index, 'D', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && DRoots?.includes(index + 1) && currentStrings.D" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && DSeconds?.includes(index + 1) && currentStrings.D" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && DThirds?.includes(index + 1) && currentStrings.D" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && DFourths?.includes(index + 1) && currentStrings.D" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && DFifths?.includes(index + 1) && currentStrings.D" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && DSixths?.includes(index + 1) && currentStrings.D" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && DSevenths?.includes(index + 1) && currentStrings.D" class="note-names">{{ seventhNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && DBlues?.includes(index + 1) && currentStrings.D" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <!-- <div class="fret-dot d-flex text-nowrap w-75">
            <div class="d-inline-block string-name"></div>
            <div v-for="(_, index) in D" :key="index" class="d-inline-block border-0" :class="{'fret': index < fretAmount}">
                <span v-if="[2,4,6,8,14,16,18,20].includes(index)">*</span>
                <span v-else-if="[11,23].includes(index)">**</span>
            </div>
        </div> -->
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">D</div>
            <div class="fret-start string-G">
                <div v-for="(_, index) in G" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="G[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? GRoots?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? GSeconds?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? GThirds?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? GFourths?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? GFifths?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? GSixths?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? GSevenths?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? GBlues?.includes(index + 1) && currentStrings.G && isCAGED(index, 'G', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && GRoots?.includes(index + 1) && currentStrings.G" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && GSeconds?.includes(index + 1) && currentStrings.G" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && GThirds?.includes(index + 1) && currentStrings.G" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && GFourths?.includes(index + 1) && currentStrings.G" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && GFifths?.includes(index + 1) && currentStrings.G" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && GSixths?.includes(index + 1) && currentStrings.G" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && GSevenths?.includes(index + 1) && currentStrings.G" class="note-names">{{ seventhNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && GBlues?.includes(index + 1) && currentStrings.G" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">A</div>
            <div class="fret-start string-B">
                <div v-for="(_, index) in B" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="B[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? BRoots?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? BSeconds?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? BThirds?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? BFourths?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? BFifths?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? BSixths?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? BSevenths?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? BBlues?.includes(index + 1) && currentStrings.B && isCAGED(index, 'B', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && BRoots?.includes(index + 1) && currentStrings.B" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && BSeconds?.includes(index + 1) && currentStrings.B" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && BThirds?.includes(index + 1) && currentStrings.B" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && BFourths?.includes(index + 1) && currentStrings.B" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && BFifths?.includes(index + 1) && currentStrings.B" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && BSixths?.includes(index + 1) && currentStrings.B" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && BSevenths?.includes(index + 1) && currentStrings.B" class="note-names">{{ seventhNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && BBlues?.includes(index + 1) && currentStrings.B" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <div class="d-flex text-nowrap w-75">
            <div class="d-inline-block string-name">E</div>
            <div class="fret-start string-e last-string">
                <div v-for="(_, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none">
                    <label v-if="index < fretAmount" class="notes">
                        <input type="checkbox" v-model="e[index]"/>
                        <div class="checkbox__checkmark" 
                            :class="{
                                'root-note': currentHighlightNotes.includes('roots') ? eRoots?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '', 
                                'second': currentHighlightNotes.includes('seconds') ? eSeconds?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'third': currentHighlightNotes.includes('thirds') ? eThirds?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'fourth': currentHighlightNotes.includes('fourths') ? eFourths?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'fifth': currentHighlightNotes.includes('fifths') ? eFifths?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'sixth': currentHighlightNotes.includes('sixths') ? eSixths?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'seventh': currentHighlightNotes.includes('sevenths') ? eSevenths?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                                'blue': currentHighlightNotes.includes('blues') ? eBlues?.includes(index + 1) && currentStrings.e && isCAGED(index, 'e', currentKey, currentHighlightCAGED): '',
                            }">
                            <span v-if="currentHighlightNotes.includes('roots') && eRoots?.includes(index + 1) && currentStrings.e" class="note-names">{{ rootNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('seconds') && eSeconds?.includes(index + 1) && currentStrings.e" class="note-names">{{ secondNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('thirds') && eThirds?.includes(index + 1) && currentStrings.e" class="note-names">{{ thirdNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fourths') && eFourths?.includes(index + 1) && currentStrings.e" class="note-names">{{ fourthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('fifths') && eFifths?.includes(index + 1) && currentStrings.e" class="note-names">{{ fifthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sixths') && eSixths?.includes(index + 1) && currentStrings.e" class="note-names">{{ sixthNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('sevenths') && eSevenths?.includes(index + 1) && currentStrings.e" class="note-names">{{ seventhNoteName }}</span>
                            <span v-if="currentHighlightNotes.includes('blues') && eBlues?.includes(index + 1) && currentStrings.e" class="note-names">{{ blueNoteName }}</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
        <!-- THE CAGED SYSTEM -->
        <div class="w-75 text-start CAGED-name-container">
            <div v-for="(_, index) in e" :key="index" class="d-inline-block CAGED-box" :class="{'fret': index < fretAmount}" style="border-right: none;">
                <div v-if="index < fretAmount">
                    <span v-if="isCAGEDNameHere(index, currentCAGED)" class="CAGED-name text-yellow">
                        {{ GetCAGEDName(index, currentCAGED) }}
                    </span>
                </div>
            </div>
        </div>
        <div class="mt-5">
            <span class="me-3 text-yellow fw-bold">
                Number of Frets
            </span>
            <input type="range" min="12" max="24" step="1" v-model="fretAmount">
            <span class="ms-3 text-yellow fw-bold">
                {{ fretAmount }}
            </span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.my-guitar {
    width: 85vw;
    height: 100%;
}

.custom-radio {
    min-width: 50px;
}

.custom-radio input {
    display: none;
}

.custom-radio input:checked + .label {
    border: 3px solid $yellow;
    border-radius: 9px;
    padding: 5px;
    color: $yellow;
    cursor: pointer;
}

.custom-radio span {
    cursor: pointer;
}

/* FRETBOARD */
.fret-indicator {
    min-width: 2rem;
    height: 40px;
}

.string-name {
    width: 30px;
    margin-top: -13px;
}

.fret-start {
    border-left: 3px solid #8f8575;
}

.string-E {
    border-top: 1px solid #8f8575;
}

.string-A {
    border-top: 1.5px solid #8f8575;
}

.string-D {
    border-top: 2px solid #8f8575;
}

.string-G {
    border-top: 2.5px solid #8f8575;
}

.string-B {
    border-top: 3px solid #8f8575;
}

.string-e {
    border-top: 3.5px solid #8f8575;
}

.last-string {
    border-left-color: transparent;
}

.fret {
    min-width: 2rem;
    max-width: 50px;
    border-right: 1px solid gray;
}

.CAGED-name-container {
    padding-left: 2rem;
}

.CAGED-box {
    min-width: 2rem;
    max-width: 2rem;
    min-height: 10px;
}

.CAGED-name {
    white-space: nowrap;
    text-overflow: string;
    font-size: 12px;
}

// .fret-dot {
//     position: absolute;
//     justify-content: center;
//     align-items: center;
//     width: 100%;
//     margin-top: 70px;
// }
</style>
