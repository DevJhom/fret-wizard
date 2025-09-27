<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Tonality, MAJOR_KEY_TO_NUMBER, Pattern, MINOR_KEY_TO_NUMBER } from '@data/constants';
import { getCurrentKey, updateCurrentKey, getScale, updateCurrentScale, updateScale } from '@services/mock_service';
import { usePatternStore, CurrentCAGED } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import MyFretboard from './MyFretboard.vue';

const patternStore = usePatternStore();
const { allKeys, allPatterns, currentKey, currentPattern, currentCAGED, currentTonality, currentHighlightNotes } = storeToRefs(patternStore);

interface FretBoard {
    fretAmount: number,
    fretIndicator: number[],
    // currentCAGED: CurrentCAGED, 
    currentKey: string,
    // currentTonality: Tonality, 
    E: string[],
    A: string[],
    D: string[],
    G: string[],
    B: string[],
    e: string[]
}

const fretAmount = ref(24);
const fretIndicator = new Array(24);

const fretboards = ref<FretBoard[]>([]);
const currentFretboard = ref(0);

const fetchCurrentKey = async () => {
    const data = await getCurrentKey();
    currentKey.value = data.key;
}

const fetchScale = async () => {
    // Fetch the default key "C" and shift the data based on "currentKeyToNumber"
    const data = await getScale(currentTonality.value, currentPattern.value, "C");
    const tempData = JSON.parse(JSON.stringify(data))

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
    const data = await fetchScale();

    const fretboard: FretBoard = {
        fretAmount: fretAmount.value,
        fretIndicator: fretIndicator,
        currentKey: currentKey.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value.push(JSON.parse(JSON.stringify(fretboard)));
    currentFretboard.value = fretboards.value.length - 1;
}

const updateFretboard = async () => {
    const data = await fetchScale();

    const fretboard: FretBoard = {
        fretAmount: fretAmount.value,
        fretIndicator: fretIndicator,
        currentKey: currentKey.value,
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value[currentFretboard.value] = JSON.parse(JSON.stringify(fretboard));
}

const selectFretboard = (index: number) => {
    currentFretboard.value = index;
}

const onChangeCurrentKey = () => {
    updateFretboard();
    //fetchScale(); 
    updateCurrentKey(currentKey.value);
}

const onChangeCurrentPattern = () => {
    //fetchScale(); 
    updateCurrentScale(currentPattern.value);
    patternStore.updateCurrentHighlightNotes();
}

const getTonalityText = (tonality: Tonality) => {
    if (tonality == Tonality.MAJOR) {
        return "Major";
    }

    if (tonality == Tonality.MINOR) {
        return "Minor";
    }
}

/*
watch([E, A, D, G, B, e], (newValue) => {
    console.log("new Value", newValue)
    updateScale(currentPattern.value, currentKey.value, {
        // E: Object.assign([], newValue[0]), 
        // A: Object.assign([], newValue[1]), 
        // D: Object.assign([], newValue[2]), 
        // G: Object.assign([], newValue[3]),
        // B: Object.assign([], newValue[4]),
        // e: Object.assign([], newValue[5])
    })
}, { deep: true })
*/

watch(currentTonality, () => {
    patternStore.updateTonality();
    patternStore.updateCurrentHighlightNotes();

    if (currentPattern.value == Pattern.Triad) {
        //fetchScale();
    }
})

onMounted(async () => {
    await fetchCurrentKey();
    await addFretboard();
})
</script>

<template>
    <div class="my-guitar mt-4">
        <!-- SELECTOR -->
        <div>
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
                <span class="me-2 text-yellow fw-bold">
                    ({{ getTonalityText(currentTonality) }})
                </span>
            </div>
            <!-- Pattern Selector -->
            <div class="d-flex justify-content-center align-items-center mt-3">
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
        </div>

        <!-- NUMBER OF FRET -->
        <div class="mt-3">
            <span class="me-3 text-yellow fw-bold">
                Number of Frets
            </span>
            <input type="range" min="12" max="24" step="1" v-model="fretAmount">
            <span class="ms-3 text-yellow fw-bold">
                {{ fretAmount }}
            </span>
        </div>

        <div v-for="(fretboard, index) in fretboards" 
            class="mt-4 d-flex"
            :class="{ 'selected-fretboard': (index == currentFretboard && fretboards.length > 1) }"
            @click="selectFretboard(index)" 
        >
            <h5 class="d-flex align-items-center text-yellow mx-4">
                {{ fretboard.currentKey }} {{ getTonalityText(currentTonality) }}
            </h5>
            <MyFretboard
                :fretAmount="fretboard.fretAmount"
                :fretIndicator="fretboard.fretIndicator"
                :currentCAGED="currentCAGED"
                :currentKey="fretboard.currentKey"
                :currentTonality="currentTonality"
                :E="fretboard.E"
                :A="fretboard.A"
                :D="fretboard.D"
                :G="fretboard.G"
                :B="fretboard.B"
                :e="fretboard.e"
            />

            <div class="d-flex align-items-center mx-4"> ✅ </div>
        </div>

        <h3 @click="addFretboard" class="text-yellow"> + </h3>
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

.selected-fretboard {
    border: 3px solid $yellow;
    border-radius: 9px;
    padding: 1rem;
}
</style>
