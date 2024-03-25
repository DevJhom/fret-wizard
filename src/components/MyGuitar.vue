<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateCurrentScale, updateScale } from '@services/service';
import { getRoots, getSeconds, getThirds, getFourths, getFifths, getSixths, getSevenths, getBlues } from './intervals';

const fretAmount = ref(24);
const fretIndicator = new Array(24);
const keys = ref(["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
const scales = ref(["Pentatonic Scale", "Blue Scale", "Diatonic Scale", "Triad Arpeggio", "None"]);
const currentKey = ref<string>("C");
const currentScale = ref<string>("Pentatonic Scale");

const E = ref();
const A = ref();
const D = ref();
const G = ref();
const B = ref();
const e = ref();

const currentHighlightNotes = ref<string[]>(["roots"]);
const highlightNotes = computed(() => {
    if(currentScale.value == "Pentatonic Scale")
        return ["roots", "seconds", "thirds", "fifths", "sixths"];
    if(currentScale.value == "Blue Scale")
        return ["roots", "seconds", "thirds", "fifths", "sixths", "blues"];
    if(currentScale.value == "Diatonic Scale")
        return ["roots", "seconds", "thirds", "fourths", "fifths", "sixths", "sevenths"]
    if(currentScale.value == "Triad Arpeggio")
        return ["roots", "thirds", "fifths"];
    else 
        return ["roots", "thirds", "fifths"];
})

// Roots
const ERoots = computed(() => {
    return getRoots(currentKey.value, "E");
})
const ARoots = computed(() => {
    return getRoots(currentKey.value, "A");
})
const DRoots = computed(() => {
    return getRoots(currentKey.value, "D");
})
const GRoots = computed(() => {
    return getRoots(currentKey.value, "G");
})
const BRoots = computed(() => {
    return getRoots(currentKey.value, "B");
})
const eRoots = computed(() => {
    return getRoots(currentKey.value, "e");
})

// Seconds
const ESeconds = computed(() => {
    return getSeconds(currentKey.value, "E");
})
const ASeconds = computed(() => {
    return getSeconds(currentKey.value, "A");
})
const DSeconds = computed(() => {
    return getSeconds(currentKey.value, "D");
})
const GSeconds = computed(() => {
    return getSeconds(currentKey.value, "G");
})
const BSeconds = computed(() => {
    return getSeconds(currentKey.value, "B");
})
const eSeconds = computed(() => {
    return getSeconds(currentKey.value, "e");
})

// Thirds
const EThirds = computed(() => {
    return getThirds(currentKey.value, "E");
})
const AThirds = computed(() => {
    return getThirds(currentKey.value, "A");
})
const DThirds = computed(() => {
    return getThirds(currentKey.value, "D");
})
const GThirds = computed(() => {
    return getThirds(currentKey.value, "G");
})
const BThirds = computed(() => {
    return getThirds(currentKey.value, "B");
})
const eThirds = computed(() => {
    return getThirds(currentKey.value, "e");
})

// Fourths
const EFourths = computed(() => {
    return getFourths(currentKey.value, "E");
})
const AFourths = computed(() => {
    return getFourths(currentKey.value, "A");
})
const DFourths = computed(() => {
    return getFourths(currentKey.value, "D");
})
const GFourths = computed(() => {
    return getFourths(currentKey.value, "G");
})
const BFourths = computed(() => {
    return getFourths(currentKey.value, "B");
})
const eFourths = computed(() => {
    return getFourths(currentKey.value, "e");
})

// Fifths
const EFifths = computed(() => {
    return getFifths(currentKey.value, "E");
})
const AFifths = computed(() => {
    return getFifths(currentKey.value, "A");
})
const DFifths = computed(() => {
    return getFifths(currentKey.value, "D");
})
const GFifths = computed(() => {
    return getFifths(currentKey.value, "G");
})
const BFifths = computed(() => {
    return getFifths(currentKey.value, "B");
})
const eFifths = computed(() => {
    return getFifths(currentKey.value, "e");
})

// Sixths
const ESixths = computed(() => {
    return getSixths(currentKey.value, "E");
})
const ASixths = computed(() => {
    return getSixths(currentKey.value, "A");
})
const DSixths = computed(() => {
    return getSixths(currentKey.value, "D");
})
const GSixths = computed(() => {
    return getSixths(currentKey.value, "G");
})
const BSixths = computed(() => {
    return getSixths(currentKey.value, "B");
})
const eSixths = computed(() => {
    return getSixths(currentKey.value, "e");
})

// Sevenths
const ESevenths = computed(() => {
    return getSevenths(currentKey.value, "E");
})
const ASevenths = computed(() => {
    return getSevenths(currentKey.value, "A");
})
const DSevenths = computed(() => {
    return getSevenths(currentKey.value, "D");
})
const GSevenths = computed(() => {
    return getSevenths(currentKey.value, "G");
})
const BSevenths = computed(() => {
    return getSevenths(currentKey.value, "B");
})
const eSevenths = computed(() => {
    return getSevenths(currentKey.value, "e");
})

// Blues
const EBlues = computed(() => {
    return getBlues(currentKey.value, "E");
})
const ABlues = computed(() => {
    return getBlues(currentKey.value, "A");
})
const DBlues = computed(() => {
    return getBlues(currentKey.value, "D");
})
const GBlues = computed(() => {
    return getBlues(currentKey.value, "G");
})
const BBlues = computed(() => {
    return getBlues(currentKey.value, "B");
})
const eBlues = computed(() => {
    return getBlues(currentKey.value, "e");
})



const fetchCurrentKey = async () => {
    const data = await getCurrentKey();
    currentKey.value = data.key;
}

const fetchScale = async () => {
    const data = await getScale(mapScaleName(), currentKey.value);
    E.value = data.E;
    A.value = data.A;
    D.value = data.D;
    G.value = data.G;
    B.value = data.B;
    e.value = data.e;
}

const mapScaleName: () => string = () => {
    if(currentScale.value == 'Pentatonic Scale')
        return 'pentatonic_scale';
    if(currentScale.value == 'Blue Scale')
        return 'blue_scale';
    if(currentScale.value == 'Diatonic Scale')
        return 'diatonic_scale';
    if(currentScale.value == 'Triad Arpeggio')
        return 'triad_arpeggio';
    if(currentScale.value == 'None')
        return 'none';

    return '';
};

const onChangeCurrentKey = () => {
    fetchScale();
    updateCurrentKey(currentKey.value);
}

const onChangeCurrentScale = () => {
    fetchScale();
    updateCurrentScale(currentScale.value);
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

onMounted(async () => {
    await fetchCurrentKey();
    await fetchScale();
})
</script>

<template>
    <!-- Key Selector -->
    <div class="d-flex justify-content-center align-items-center">
        <span class="me-2">
            Key
        </span>
        <div v-for="(key, index) in keys" :key="key" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="keys" v-model="currentKey" :value="keys[index]" @change="onChangeCurrentKey()">
                    <span class="label"> {{ key }} </span>
                </input>
            </label>
        </div>
    </div>
    <!-- Scale Selector -->
    <div class="d-flex justify-content-center align-items-center mt-5">
        <div v-for="(scale, index) in scales" :key="scale" class="d-inline-block custom-radio">
            <label class="d-flex flex-column">
                <input type="radio" name="scales" v-model="currentScale" :value="scales[index]" @change="onChangeCurrentScale()">
                    <span class="label px-3">{{ scale }}</span>
                </input>
            </label>
        </div>
    </div>
    <!-- HighlightNotes Filter -->
    <div class="highlightNotes-filter notes d-flex flex-column text-end border border-success">
        <label v-for="(highlightNote) in highlightNotes" :key="highlightNote" class="d-flex">
            <input type="checkbox" :value="highlightNote" v-model="currentHighlightNotes"/>
            <div class="checkbox__checkmark"
                :class="{
                    'root-note': highlightNote == 'roots' && currentHighlightNotes.includes('roots'),
                    'second': highlightNote == 'seconds' && currentHighlightNotes.includes('seconds'),
                    'third': highlightNote == 'thirds' && currentHighlightNotes.includes('thirds'),
                    'fourth': highlightNote == 'fourths' && currentHighlightNotes.includes('fourths'),
                    'fifth': highlightNote == 'fifths' && currentHighlightNotes.includes('fifths'),
                    'sixth': highlightNote == 'sixths' && currentHighlightNotes.includes('sixths'),
                    'seventh': highlightNote == 'sevenths' && currentHighlightNotes.includes('sevenths'),
                    'blue': highlightNote == 'blues' && currentHighlightNotes.includes('blues'),
                }">
            </div>
            <span class="ms-3">
                {{ highlightNote }}
            </span>
        </label>
    </div>
    <!-- Fret Indicator -->
    <div v-for="(_, index) in fretIndicator" :key="index" class="d-inline-block" :class="{'fret-indicator': index < fretAmount}">
        <div v-if="index < fretAmount">
            <small v-if="[3,5,7,9,12,15,17,19,21,24].includes(index + 1)" class="opacity-75">
                {{ index + 1 }}
            </small>
        </div>
    </div>
    <!-- Fretboard -->
    <div class="fret-start string-E">
        <div v-for="(_, index) in E" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="E[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? ERoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? ESeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? EThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? EFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? EFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? ESixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? ESevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? EBlues?.includes(index + 1) : '',
                    }">
                </div>
            </label>
        </div>
    </div>
    <div class="fret-start string-A">
        <div v-for="(_, index) in A" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="A[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? ARoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? ASeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? AThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? AFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? AFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? ASixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? ASevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? ABlues?.includes(index + 1) : '',
                    }">
                </div>

            </label>
        </div>
    </div>
    <div class="fret-start string-D">
        <div v-for="(_, index) in D" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="D[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? DRoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? DSeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? DThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? DFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? DFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? DSixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? DSevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? DBlues?.includes(index + 1) : '',
                    }">
                </div>
            </label>
        </div>
    </div>
    <div class="fret-start string-G">
        <div v-for="(_, index) in G" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="G[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? GRoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? GSeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? GThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? GFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? GFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? GSixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? GSevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? GBlues?.includes(index + 1) : '',
                    }">
                </div>
            </label>
        </div>
    </div>
    <div class="fret-start string-B">
        <div v-for="(_, index) in B" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="B[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? BRoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? BSeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? BThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? BFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? BFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? BSixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? BSevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? BBlues?.includes(index + 1) : '',
                    }">
                </div>
            </label>
        </div>
    </div>
    <div class="fret-start string-e" style="border-left: none;">
        <div v-for="(_, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="e[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': currentHighlightNotes.includes('roots') ? eRoots?.includes(index + 1) : '', 
                        'second': currentHighlightNotes.includes('second') ? eSeconds?.includes(index + 1): '',
                        'third': currentHighlightNotes.includes('thirds') ? eThirds?.includes(index + 1) : '',
                        'fourth': currentHighlightNotes.includes('fourths') ? eFourths?.includes(index + 1) : '',
                        'fifth': currentHighlightNotes.includes('fifths') ? eFifths?.includes(index + 1) : '',
                        'sixth': currentHighlightNotes.includes('sixths') ? eSixths?.includes(index + 1) : '',
                        'seventh': currentHighlightNotes.includes('sevenths') ? eSevenths?.includes(index + 1) : '',
                        'blue': currentHighlightNotes.includes('blues') ? eBlues?.includes(index + 1) : '',
                    }">
                </div>
            </label>
        </div>
    </div>
    <div class="mt-5">
        <span class="me-3">
            Fret Amount
        </span>
        <input type="range" min="12" max="24" step="1" v-model="fretAmount">
        <span class="ms-3">
            {{ fretAmount }}
        </span>
    </div>
</template>

<style scoped lang="scss">
.custom-radio {
    min-width: 50px;
}

.custom-radio input {
    display: none;
}

.custom-radio input:checked + .label {
    background-color: gray;
    border-radius: 7px;
    padding: 5px;
}

/* HighlightNotes */
.highlightNotes-filter {
    position: absolute;
    top: 20%;
    right: 10%;
    border-radius: 5px;
    padding: 20px 30px 20px 20px;
    border: 1px solid red;
}

.highlightNotes-filter .checkbox__checkmark {
    margin-top: 4px !important;
}

/* FRETBOARD */
.fret-indicator {
    min-width: 50px;
    height: 50px;
}

.fret-start {
    border-left: 3px solid black;
}

.string-E {
    border-top: 1px solid black;
}

.string-A {
    border-top: 1.5px solid black;
}

.string-D {
    border-top: 2px solid black;
}

.string-G {
    border-top: 2.5px solid black;
}

.string-B {
    border-top: 3px solid black;
}

.string-e {
    border-top: 3.5px solid black;
}

.fret {
    min-width: 50px;
    border-right: 1px solid gray;
}

/* Checkbox Input */
.notes input {
    display: none;
}

.notes input:checked ~ .checkbox__checkmark:after {
    transform: scale(1);
}

.notes .checkbox__checkmark {
    margin-top: -26px;
    height: 18px;
    width: 18px;
    background-color: #eee;
    border-radius: 11px;
    transition: background-color 0.25s ease;
}

.notes .checkbox__checkmark:after {
    content: "";
    display: block;
    width: 18px;
    height: 18px;
    background-color: gray;
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.25s ease;
}

.notes .root-note, 
.notes .root-note:after {
    background-color: $red !important;
}

.notes .second,
.notes .second:after {
    background-color: $red-orange !important;
}

.notes .third, 
.notes .third:after {
    background-color: $orange !important;
}

.notes .fourth, 
.notes .fourth:after {
    background-color: $orange-yellow !important;
}

.notes .fifth,
.notes .fifth:after {
    background-color: $yellow !important;
}

.notes .sixth, 
.notes .sixth:after {
    background-color: $yellow-green !important;
}

.notes .seventh, 
.notes .seventh:after {
    background-color: $green !important;
}

.notes .blue, 
.notes .blue:after {
    background-color: $blue !important;
}

/* Range Input */
/* Thank you, https://range-input-css.netlify.app/ 
    for this awesome range input. */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 25rem;
}

input[type="range"]:focus {
  outline: none;
}

input[type="range"]::-webkit-slider-runnable-track {
  background-color: #c1c9cd;
  border-radius: 0.5rem;
  height: 1rem;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none; 
  appearance: none;
  margin-top: -8px;
  background-color: #808080;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
}

input[type="range"]:focus::-webkit-slider-thumb {
  outline: 3px solid #808080;
  outline-offset: 0.125rem;
}


input[type="range"]::-moz-range-track {
  background-color: #c1c9cd;
  border-radius: 0.5rem;
  height: 1rem;
}


input[type="range"]::-moz-range-thumb {
  background-color: #808080;
  border: none; 
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
}

input[type="range"]:focus::-moz-range-thumb{
  outline: 3px solid #808080;
  outline-offset: 0.125rem;
}
</style>
