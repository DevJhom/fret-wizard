<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateCurrentScale, updateScale } from '@services/mock_service';
import { KEY_TO_NUMBER } from './data/noteNames';
import { isCAGEDNameHere, GetCAGEDName } from '@data/CAGED';
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import MyString from './MyString.vue';

const patternStore = usePatternStore();
const { allKeys, allPatterns, currentKey, currentPattern, currentCAGED } = storeToRefs(patternStore);

const fretAmount = ref(24);
const fretIndicator = new Array(24);

// Strings
const E = ref([]);
const A = ref([]);
const D = ref([]);
const G = ref([]);
const B = ref([]);
const e = ref([]);

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
    if(currentPattern.value == 'Triad')
        return 'triad';
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

onMounted(async () => {
    await fetchCurrentKey();
    await fetchScale();
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
        </div>

        <!-- FRETBOARD -->
        <div>
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

            <!-- Strings -->
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">e</div>
                <!-- Open Positions (To be implemented later) -->
                <!-- <div class="d-inline-block">
                    <label class="notes small">
                        <input type="checkbox" v-model="E[2]"/>
                            <div class="checkbox__checkmark">
                        </div>
                    </label>
                </div> -->
                <div class="fret-start string-e">
                    <MyString
                        :string-name="'e'"
                        :string-data="e"
                        :fret-amount="fretAmount"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">B</div>
                <div class="fret-start string-B">
                    <MyString
                        :string-name="'B'"
                        :string-data="B"
                        :fret-amount="fretAmount"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">G</div>
                <div class="fret-start string-G">
                    <MyString
                        :string-name="'G'"
                        :string-data="G"
                        :fret-amount="fretAmount"
                    />
                </div>
            </div>
            <!-- Fret Dots (To be implemented later) -->
            <!-- <div class="fret-dot d-flex text-nowrap w-75">
                <div class="d-inline-block string-name"></div>
                <div v-for="(_, index) in D" :key="index" class="d-inline-block border-0" :class="{'fret': index < fretAmount}">
                    <span v-if="[2,4,6,8,14,16,18,20].includes(index)">*</span>
                    <span v-else-if="[11,23].includes(index)">**</span>
                </div>
            </div> -->
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">D</div>
                <div class="fret-start string-D">
                    <MyString
                        :string-name="'D'"
                        :string-data="D"
                        :fret-amount="fretAmount"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">A</div>
                <div class="fret-start string-A">
                    <MyString
                        :string-name="'A'"
                        :string-data="A"
                        :fret-amount="fretAmount"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <div class="d-inline-block string-name">E</div>
                <div class="fret-start string-E last-string">
                    <MyString
                        :string-name="'E'"
                        :string-data="E"
                        :fret-amount="fretAmount"
                        :is-last-string="true"
                    />
                </div>
            </div>

            <!-- CAGED Names -->
            <div class="CAGED-name-container text-start">
                <div v-for="(_, index) in e" :key="index" class="d-inline-block CAGED-box" :class="{'fret': index < fretAmount}" style="border-right: none;">
                    <div v-if="index < fretAmount">
                        <span v-if="isCAGEDNameHere(index, currentCAGED, currentKey)" class="CAGED-name text-yellow">
                            {{ GetCAGEDName(index, currentCAGED, currentKey) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- NUMBER OF FRET -->
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 85vw;
    height: 100%;
    padding-bottom: 20%;
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
    min-width: 30px;
    max-width: 30px;
    margin-top: -13px;
}

.fret-start {
    border-left: 3px solid #8f8575;
}

.string-e {
    border-top: 1px solid #8f8575;
}

.string-B {
    border-top: 1.5px solid #8f8575;
}

.string-G {
    border-top: 2px solid #8f8575;
}

.string-D {
    border-top: 2.5px solid #8f8575;
}

.string-A {
    border-top: 3px solid #8f8575;
}

.string-E {
    border-top: 3.5px solid #8f8575;
}

.last-string {
    border-left-color: transparent;
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
