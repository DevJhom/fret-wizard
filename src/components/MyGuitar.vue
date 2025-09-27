<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Pattern, Tonality, getTonalityText, MAJOR_KEY_TO_NUMBER, MINOR_KEY_TO_NUMBER, Accidental } from '@data/constants';
import { fetchCurrentKey, saveCurrentKey, fetchScale, saveCurrentScale, saveScale } from '@/services/mockService';
import { usePatternStore, CurrentCAGED } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import _ from "lodash";
import MyFretboard from './MyFretboard.vue';

const patternStore = usePatternStore();
const { allKeys, allPatterns, currentKey, currentPattern, currentCAGED, currentTonality, currentHighlightNotes, currentAccidental } = storeToRefs(patternStore);

interface Fretboard {
    fretAmount: number,
    fretIndicator: number[],
    currentKey: string,
    currentTonality: Tonality, 
    currentAccidental: Accidental,
    E: string[],
    A: string[],
    D: string[],
    G: string[],
    B: string[],
    e: string[]
}

const fretAmount = ref(24);
const fretIndicator = new Array(24);

const fretboards = ref<Fretboard[]>([]);
const currentFretboard = ref(0);
const isEditing = ref(true);

const getCurrentKey = async () => {
    const data = await fetchCurrentKey();
    currentKey.value = data.key;
}

const getScale = async () => {
    // Fetch the default key "C" and shift the data based on "currentKeyToNumber"
    const data = await fetchScale(currentTonality.value, currentPattern.value, "C");
    const tempData = _.cloneDeep(data);

    let currentKeyToNumber = 0;

    if (currentTonality.value == Tonality.MAJOR) {
        currentKeyToNumber = MAJOR_KEY_TO_NUMBER[currentKey.value];
    }
    if (currentTonality.value == Tonality.MINOR) {
        currentKeyToNumber = MINOR_KEY_TO_NUMBER[currentKey.value];
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
        fretIndicator: fretIndicator,
        currentKey: currentKey.value,
        currentTonality: currentTonality.value,
        currentAccidental: currentAccidental.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value.push(_.cloneDeep(fretboard));
    currentFretboard.value = fretboards.value.length - 1;
    isEditing.value = true;
}

const updateFretboard = async () => {
    const data = await getScale();

    const fretboard: Fretboard = {
        fretAmount: fretAmount.value,
        fretIndicator: fretIndicator,
        currentKey: currentKey.value,
        currentTonality: currentTonality.value,
        currentAccidental: currentAccidental.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value[currentFretboard.value] = _.cloneDeep(fretboard);
}

const onChangeCurrentKey = () => {
    updateFretboard();
    saveCurrentKey(currentKey.value);
}

const onChangeCurrentPattern = () => {
    updateFretboard();
    saveCurrentScale(currentPattern.value);
    patternStore.updateCurrentHighlightNotes();
}

const onChangeFretAmount = () => {
    updateFretboard();
}

watch(currentTonality, () => {
    updateFretboard();
    patternStore.updateTonality();
    patternStore.updateCurrentHighlightNotes();
})

watch(currentAccidental, () => {
    updateFretboard();
})

/*
watch([E, A, D, G, B, e], (newValue) => {
    saveScale(currentPattern.value, currentKey.value, {
        // E: Object.assign([], newValue[0]), 
        // A: Object.assign([], newValue[1]), 
        // D: Object.assign([], newValue[2]), 
        // G: Object.assign([], newValue[3]),
        // B: Object.assign([], newValue[4]),
        // e: Object.assign([], newValue[5])
    })
}, { deep: true })
*/

const updateSideBar = () => {
    const selectedFretboard = _.cloneDeep(fretboards.value[currentFretboard.value]);

    currentTonality.value = selectedFretboard.currentTonality;
    currentAccidental.value = selectedFretboard.currentAccidental;
}

const selectFretboard = (index: number) => {
    currentFretboard.value = index;
    isEditing.value = true;
    updateSideBar();
}

const finishEditing = () => {
    isEditing.value = false;
}

onMounted(async () => {
    await getCurrentKey();
    await addFretboard();
})
</script>

<template>
    <div class="my-guitar mt-4">
        <!-- FRETBOARD -->
        <div v-for="(fretboard, index) in fretboards" 
            class="mt-4 fretboard"
            :class="{ 'selected-fretboard': (fretboards.length > 1 && index == currentFretboard && isEditing == true) }"
        >
            <div v-if="index == currentFretboard && isEditing == true">
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
                    <input type="range" min="12" max="24" step="1" v-model="fretAmount" @change="onChangeFretAmount()">
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
                    :fretIndicator="fretboard.fretIndicator"
                    :currentCAGED="currentCAGED"
                    :currentKey="fretboard.currentKey"
                    :currentTonality="fretboard.currentTonality"
                    :currentAccidental="fretboard.currentAccidental"
                    :E="fretboard.E"
                    :A="fretboard.A"
                    :D="fretboard.D"
                    :G="fretboard.G"
                    :B="fretboard.B"
                    :e="fretboard.e"
                />
                <div v-if="fretboards.length > 1 && isEditing == false" class="start-editing" @click="selectFretboard(index)"> ✏️ </div>
                <div v-else class="mx-5"></div>
            </div>

            <div v-if="fretboards.length > 1 && isEditing == true && index == currentFretboard" class="finish-editing" @click="finishEditing()"> ✅ </div>
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

.start-editing {
    display: flex;
    align-items: center;
    margin: 0 2rem;
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
