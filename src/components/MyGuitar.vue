<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateScale } from '../service/service';

const fretAmount = ref(24);
const fretIndicator = new Array(24);
const keys = ref(["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
const scales = ref(["Pentatonic Scale", "Blue Scale", "Diatonic Scale", "Traid Arpeggio"]);
const currentKey = ref<string>("C");
const currentScale = ref<string>("Pentatonic Scale");

const E = ref();
const A = ref();
const D = ref();
const G = ref();
const B = ref();
const e = ref();

const currentHighlightNotes = ref([]);
const highlightNotes = ref(["root notes", "thrids", "fifths"]);
const rootNotes = ref([3,5,7,9]);
const thirds = ref([4]);
const fifths = ref([6]);

const fetchCurrentKey = async () => {
    const data = await getCurrentKey();
    currentKey.value = data.key;
}

const fetchScale = async () => {
    const data = await getScale(currentKey.value);
    E.value = data.E;
    A.value = data.A;
    D.value = data.D;
    G.value = data.G;
    B.value = data.B;
    e.value = data.e;
}

const onChangeCurrentKey = () => {
    fetchScale();
    updateCurrentKey(currentKey.value);
}

const onChangeCurrentScale = () => {
    fetchScale();
    // updateCurrentScale(currentScale.value);
}

watch([E, A, D, G, B, e], (newValue) => {
    updateScale(currentKey.value, newValue[0], newValue[1], newValue[2], newValue[3], newValue[4], newValue[5])
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
    <div class="highlightNotes-filter d-flex flex-column text-end border border-success">
        <div v-for="(highlightNote) in highlightNotes" :key="highlightNote" class="d-flex">
            <input type="checkbox" :value="highlightNote" v-model="currentHighlightNotes"/>
            <span class="ms-2 mb-1">
                {{ highlightNote }}
            </span>
        </div>
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
        <div v-for="(fret, index) in E" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="E[index]"/>
                <div class="checkbox__checkmark" 
                    :class="{
                        'root-note': rootNotes.includes(index), 
                        'third': thirds.includes(index),
                        'fifth': fifths.includes(index)}">
                </div>
            </label>
        </div>
    </div>
    <div class="fret-start string-A">
        <div v-for="(fret, index) in A" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="A[index]"/>
                <div class="checkbox__checkmark"></div>
            </label>
        </div>
    </div>
    <div class="fret-start string-D">
        <div v-for="(fret, index) in D" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="D[index]"/>
                <div class="checkbox__checkmark"></div>
            </label>
        </div>
    </div>
    <div class="fret-start string-G">
        <div v-for="(fret, index) in G" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="G[index]"/>
                <div class="checkbox__checkmark"></div>
            </label>
        </div>
    </div>
    <div class="fret-start string-B">
        <div v-for="(fret, index) in B" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="B[index]"/>
                <div class="checkbox__checkmark"></div>
            </label>
        </div>
    </div>
    <div class="fret-start string-e" style="border-left: none;">
        <div v-for="(fret, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none">
            <label v-if="index < fretAmount" class="notes">
                <input type="checkbox" v-model="e[index]"/>
                <div class="checkbox__checkmark"></div>
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

<style scoped>
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
    padding: 20px;
    border: 1px solid red;
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
    background-color: red !important;
}

.notes .third, 
.notes .third:after {
    background-color: orange !important;
}

.notes .fifth,
.notes .fifth:after {
    background-color: yellow !important;
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
