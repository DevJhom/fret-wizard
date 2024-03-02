<script setup lang="ts">
import { ref, computed } from 'vue';
import data from '../data/pentatonic-scale.json'

const fretAmount = ref(24);

const scales = ref(["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
const currentScale = ref<string>("C");

const fretIndicator = new Array(24);
const E = ref(data[currentScale.value as keyof typeof data].E); 
const A = ref(data[currentScale.value as keyof typeof data].A);
const D = ref(data[currentScale.value as keyof typeof data].D);
const G = ref(data[currentScale.value as keyof typeof data].G);
const B = ref(data[currentScale.value as keyof typeof data].B);
const e = ref(data[currentScale.value as keyof typeof data].e);

const onChangeCurrentScale = (currentScale: string) => {
    E.value = data[currentScale as keyof typeof data].E; 
    A.value = data[currentScale as keyof typeof data].A; 
    D.value = data[currentScale as keyof typeof data].D; 
    G.value = data[currentScale as keyof typeof data].G; 
    B.value = data[currentScale as keyof typeof data].B; 
    e.value = data[currentScale as keyof typeof data].e; 
}
</script>

<template>
    <div v-for="(scale, index) in scales" :key="scale" class="d-inline-block scales">
        <div class="d=flex flex-column">
            <div>
                {{ scale }}
            </div>
            <input type="radio" name="scales" v-model="currentScale" :value="scales[index]" @change="onChangeCurrentScale(currentScale)">
        </div>
    </div>
    <!-- Fret Indicator -->
    <div>
        <div v-for="(_, index) in fretIndicator" :key="index" class="d-inline-block" :class="{'fret-indicator': index < fretAmount}">
            <div v-if="index < fretAmount">
                <div v-if="[3,5,7,9,12,15,17,19,21,24].includes(index + 1)">
                    {{ index + 1 }}
                </div>
            </div>
        </div>
    </div>
    <!-- Frets -->
    <div class="fret-start string-E">
        <div v-for="(fret, index) in E" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="E[index]">
            </div>
        </div>
    </div>
    <div class="fret-start string-A">
        <div v-for="(fret, index) in A" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="A[index]">
            </div>
        </div>
    </div>
    <div class="fret-start string-D">
        <div v-for="(fret, index) in D" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="D[index]">
            </div>
        </div>
    </div>
    <div class="fret-start string-G">
        <div v-for="(fret, index) in G" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="G[index]">
            </div>
        </div>
    </div>
    <div class="fret-start string-B">
        <div v-for="(fret, index) in B" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="B[index]">
            </div>
        </div>
    </div>
    <div class="fret-start string-e" style="border-left: none;">
        <div v-for="(fret, index) in e" :key="index" class="d-inline-block" :class="{'fret': index < fretAmount}" style="border-right: none">
            <div v-if="index < fretAmount">
                <input type="checkbox" class="form-check-input" v-model="e[index]">
            </div>
        </div>
    </div>
    <div>
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

.scales {
    border: 1px solid gray;
    min-width: 50px;
}

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

input {
    margin-top: -10px;
}
</style>
