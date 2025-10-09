<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Tonality, getTonalityText, majorKeyToNumber, minorKeyToNumber } from '@data/constants';
import { fetchScalePattern } from '@/services/patternService';
import { fetchCurrentFretboard, saveCurrentFretboard } from '@/services/customizerService';
import { usePatternStore, CurrentFretboard } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import _ from "lodash";
import MyFretboard from '@components/MyFretboard.vue';
import Done from '@/assets/icons/Done.vue';
import Edit from '@/assets/icons/Edit.vue';
import Trash from '@/assets/icons/Trash.vue';

const patternStore = usePatternStore();
const { allKeys, allPatterns, fretAmount, currentKey, currentPattern, currentTonality, currentAccidental, currentHighlightNotes, currentCAGED, currentStrings, hasSidebarUpdated, hasTonalityUpdate } = storeToRefs(patternStore);

interface Fretboard extends CurrentFretboard {
    E: string[];
    A: string[];
    D: string[];
    G: string[];
    B: string[];
    e: string[];
}

const fretboards = ref<Fretboard[]>([]);
const currentFretboardIndex = ref(0);
const isEditing = ref(true);

const getCurrentFretboard = async () => {
    const data = await fetchCurrentFretboard();
    
    fretAmount.value = data.fretAmount;
    currentKey.value = data.currentKey;
    currentPattern.value = data.currentPattern;
    currentTonality.value = data.currentTonality;
    currentAccidental.value = data.currentAccidental;
    currentHighlightNotes.value = data.currentHighlightNotes;
    currentCAGED.value = data.currentCAGED;
    currentStrings.value = data.currentStrings;
}

const handleSaveCurrentFretboard = async (fretboard: Fretboard) => {
    const currentFretboard: CurrentFretboard = {
        fretAmount: fretboard.fretAmount,
        currentKey: fretboard.currentKey,
        currentPattern: fretboard.currentPattern,
        currentTonality: fretboard.currentTonality,
        currentAccidental: fretboard.currentAccidental,
        currentHighlightNotes: fretboard.currentHighlightNotes, 
        currentCAGED: fretboard.currentCAGED,
        currentStrings: fretboard.currentStrings
    }

    saveCurrentFretboard(currentFretboard);
}

const getScale = async () => {
    // Fetch the default key "C" and shift the data based on "currentKeyToNumber"
    const data = await fetchScalePattern(currentTonality.value, currentPattern.value, "C");
    const tempData = _.cloneDeep(data);

    let currentKeyToNumber = 0;

    if (currentTonality.value == Tonality.MAJOR) {
        currentKeyToNumber = majorKeyToNumber[currentKey.value];
    }
    if (currentTonality.value == Tonality.MINOR) {
        currentKeyToNumber = minorKeyToNumber[currentKey.value];
    }

    for (let i = 0; i < currentKeyToNumber; i++) {
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

    return {
        E: tempData.E,
        A: tempData.A,
        D: tempData.D,
        G: tempData.G,
        B: tempData.B,
        e: tempData.e,
    }
}

const addFretboard = async () => {
    const data = await getScale();

    const fretboard: Fretboard = {
        fretAmount: fretAmount.value,
        currentKey: currentKey.value,
        currentPattern: currentPattern.value,
        currentTonality: currentTonality.value,
        currentAccidental: currentAccidental.value,
        currentHighlightNotes: currentHighlightNotes.value,
        currentCAGED: currentCAGED.value,
        currentStrings: currentStrings.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value.push(_.cloneDeep(fretboard));
    currentFretboardIndex.value = fretboards.value.length - 1;
    isEditing.value = true;
}

const updateFretboard = async () => {
    const data = await getScale();

    const fretboard: Fretboard = {
        fretAmount: fretAmount.value,
        currentKey: currentKey.value,
        currentPattern: currentPattern.value,
        currentTonality: currentTonality.value,
        currentAccidental: currentAccidental.value,
        currentHighlightNotes: currentHighlightNotes.value,
        currentCAGED: currentCAGED.value,
        currentStrings: currentStrings.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value[currentFretboardIndex.value] = _.cloneDeep(fretboard);
    handleSaveCurrentFretboard(fretboard);
}

const onChangeCurrentKey = () => {
    updateFretboard();
}

const onChangeCurrentPattern = () => {
    updateFretboard();
    patternStore.updateCurrentHighlightNotes();
}

const onChangeFretAmount = () => {
    updateFretboard();
}

watch(hasSidebarUpdated, () => {
    updateFretboard();
})

watch(hasTonalityUpdate, () => {
    // patternStore.updateTonality();
    patternStore.updateCurrentHighlightNotes();
})

const updateCustomizers = () => {
    const selectedFretboard = _.cloneDeep(fretboards.value[currentFretboardIndex.value]);

    fretAmount.value = selectedFretboard.fretAmount;
    currentKey.value = selectedFretboard.currentKey;
    currentPattern.value = selectedFretboard.currentPattern;

    currentTonality.value = selectedFretboard.currentTonality;
    currentAccidental.value = selectedFretboard.currentAccidental;
    currentHighlightNotes.value = selectedFretboard.currentHighlightNotes;
    currentCAGED.value = selectedFretboard.currentCAGED;
    currentStrings.value = selectedFretboard.currentStrings;
}

const selectFretboard = (index: number) => {
    currentFretboardIndex.value = index;
    isEditing.value = true;
    updateCustomizers();
}

const finishEditing = () => {
    isEditing.value = false;
}

const deleteFretboard = (index: number) => {
    fretboards.value.splice(index, 1);

    if (fretboards.value.length == 1) {
        currentFretboardIndex.value = 0;
        isEditing.value = true;
        updateCustomizers();
    }
}

onMounted(async () => {
    await getCurrentFretboard();
    await addFretboard();
})
</script>

<template>
    <div class="my-guitar mt-4">
        <!-- FRETBOARD -->
        <div v-for="(fretboard, index) in fretboards" 
            class="mt-4 fretboard"
            :class="{ 'selected-fretboard': (fretboards.length > 1 && index == currentFretboardIndex && isEditing == true) }"
        >
            <div v-if="index == currentFretboardIndex && isEditing == true">
                <!-- Key Selector -->
                <div class="d-flex justify-content-center align-items-center mb-3">
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
                    <span class="me-2 text-yellow fw-bold">
                        ({{ getTonalityText(fretboard.currentTonality) }})
                    </span>
                </div>

                <!-- Pattern Selector -->
                <div class="d-flex justify-content-center align-items-center mb-3">
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

                <!-- Fret Amount Selector -->
                <div class="mb-3">
                    <span class="me-3 text-yellow fw-bold">
                        Number of Frets
                    </span>
                    <input type="range" min="12" max="24" step="1" v-model.number="fretAmount" @change="onChangeFretAmount()">
                    <span class="ms-3 text-yellow fw-bold">
                        {{ fretAmount }}
                    </span>
                </div>
            </div>

            <div class="d-flex">
                <h5 class="d-flex align-items-center text-yellow mx-4">
                    {{ fretboard.currentKey }} {{ getTonalityText(fretboard.currentTonality) }}
                </h5>
                <MyFretboard
                    :fretAmount="fretboard.fretAmount"
                    :currentPattern="fretboard.currentPattern"
                    :currentKey="fretboard.currentKey"
                    :currentTonality="fretboard.currentTonality"
                    :currentAccidental="fretboard.currentAccidental"
                    :currentHighlightNotes="fretboard.currentHighlightNotes"
                    :currentCAGED="fretboard.currentCAGED"
                    :currentStrings="fretboard.currentStrings"
                    :E="fretboard.E"
                    :A="fretboard.A"
                    :D="fretboard.D"
                    :G="fretboard.G"
                    :B="fretboard.B"
                    :e="fretboard.e"
                />
                <div v-if="fretboards.length > 1 && (isEditing == false || index != currentFretboardIndex)" class="action-icon edit-icon" @click="selectFretboard(index)"> 
                    <Edit/>      
                </div>
                <div v-else class="mx-5"></div>
                <div v-if="fretboards.length > 1 && (isEditing == false || index != currentFretboardIndex)" class="action-icon trash-icon" @click="deleteFretboard(index)"> 
                    <Trash/>
                </div>
            </div>

            <div v-if="fretboards.length > 1 && isEditing == true && index == currentFretboardIndex" 
                class="finish-editing" 
                @click="finishEditing()"
            > 
                <Done/>
            </div>
        </div>

        <h2 @click="addFretboard" class="text-yellow"> + </h2>
    </div>
</template>

<style scoped lang="scss">
.my-guitar {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: 85vw;
    height: 100%;
    padding-bottom: 10%;
}

.fretboard {
    position: relative;
    display: flex;
    flex-direction: column;
}

.selected-fretboard {
    border: 3px solid $yellow;
    border-radius: 9px;
    padding: 1rem;
}

.action-icon {
    display: flex;
    align-items: center;
}

.edit-icon {
    margin: 0 0.5rem 0 2rem;
}

.trash-icon {
    margin: 0 2rem 0 0.5rem;
}

.finish-editing {
    position: absolute;
    top: -14px;
    right: -14px;
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
</style>
