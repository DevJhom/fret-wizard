<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { getCurrentKey, updateCurrentKey, getScale, updateScale } from '../service/index';

const fretAmount = ref(24);
const fretIndicator = new Array(24);
const keys = ref(["C","C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]);
const currentKey = ref<string>("C");
const E = ref();
const A = ref();
const D = ref();
const G = ref();
const B = ref();
const e = ref();

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

watch([E, A, D, G, B, e], (newValue) => {
    updateScale(currentKey.value, newValue[0], newValue[1], newValue[2], newValue[3], newValue[4], newValue[5])
}, { deep: true })

onMounted(async () => {
    await fetchCurrentKey();
    await fetchScale();
})
</script>

<template>
    <div>
        Choose Key
    </div>
    <div v-for="(scale, index) in keys" :key="scale" class="d-inline-block keys">
        <div class="d=flex flex-column">
            <div>
                {{ scale }}
            </div>
            <input type="radio" name="scales" v-model="currentKey" :value="keys[index]" @change="onChangeCurrentKey()">
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
.keys {
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
