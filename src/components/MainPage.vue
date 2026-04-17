<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Pattern, Setup, Tonality } from '@data/constants';
import { getScale } from '@data/intervals';
import { getChordPositions, getBarPositions, getChordPositionIndexes } from '@data/chords';
import { fetchCurrentFretboard, fetchFretboards, saveCurrentFretboard, saveFretboards } from '@/services/customizerService';
import { usePatternStore, FretboardData } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import _ from "lodash";
import Sortable from "sortablejs";
import MyFretboard from '@components/MyFretboard.vue';
import Done from '@/assets/icons/Done.vue';
import Edit from '@/assets/icons/Edit.vue';
import Trash from '@/assets/icons/Trash.vue';

const patternStore = usePatternStore();
const { allKeys, allPatterns, fretAmount, currentKey, currentSetup, currentPattern, currentTonality, currentAccidental, currentHighlightNotes, currentCAGED, currentStrings, currentChordPosition, isSidebarActive, hasSidebarUpdated, hasTonalityUpdated, hasReset } = storeToRefs(patternStore);

interface FretboardRenderer extends FretboardData {
    E: string[];
    A: string[];
    D: string[];
    G: string[];
    B: string[];
    e: string[];
}

const draggableList = ref(null);
const fretboards = ref<FretboardRenderer[]>([]);
const currentFretboardIndex = ref<number>(0);
const isEditing = ref<boolean>(true);

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
    currentSetup.value = data.currentSetup;
}

const renderFretboard = async () => {
    const fretboardList = await fetchFretboards();

    if (fretboardList && fretboardList.length > 1) {
        addFretboardList(fretboardList);
    }
    else {
        addCurrentFretboard();
    }
}


const constructFretboardData = (fretboard?: FretboardRenderer): FretboardData => {
    if (fretboard) {
        return {
            fretAmount: fretboard.fretAmount,
            currentKey: fretboard.currentKey,
            currentSetup: fretboard.currentSetup,
            currentPattern: fretboard.currentPattern,
            currentTonality: fretboard.currentTonality,
            currentAccidental: fretboard.currentAccidental,
            currentHighlightNotes: fretboard.currentHighlightNotes, 
            currentCAGED: fretboard.currentCAGED,
            currentStrings: fretboard.currentStrings,
            currentChordPosition: fretboard.currentChordPosition
        }
    }
    else {
        return {
            fretAmount: fretAmount.value,
            currentKey: currentKey.value,
            currentSetup: currentSetup.value,
            currentPattern: currentPattern.value,
            currentTonality: currentTonality.value,
            currentAccidental: currentAccidental.value,
            currentHighlightNotes: currentHighlightNotes.value,
            currentCAGED: currentCAGED.value,
            currentStrings: currentStrings.value,
            currentChordPosition: currentChordPosition.value
        }
    }
}

const addFretboardList = (fretboardList: FretboardData[]) => {
    for (const fretboard of fretboardList) {
        const data = getScale(fretboard.currentTonality, fretboard.currentPattern, fretboard.currentKey);
        const fretboardRenderer: FretboardRenderer = {
            ...fretboard,
            E: data.E,
            A: data.A,
            D: data.D,
            G: data.G,
            B: data.B,
            e: data.e,
        }
        fretboards.value.push(_.cloneDeep(fretboardRenderer));
    };

    isEditing.value = false;
}

const addCurrentFretboard = () => {
    const data = getScale(currentTonality.value, currentPattern.value, currentKey.value);

    const fretboard: FretboardRenderer = {
        ...constructFretboardData(),
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
    handleSaveFretboards(fretboards.value);
}

const updateCurrentFretboard = () => {
    const data = getScale(currentTonality.value, currentPattern.value, currentKey.value);

    const fretboard: FretboardRenderer = {
        ...constructFretboardData(),
        E: data.E,
        A: data.A,
        D: data.D,
        G: data.G,
        B: data.B,
        e: data.e,
    }

    fretboards.value[currentFretboardIndex.value] = _.cloneDeep(fretboard);
    handleSaveCurrentFretboard();
    handleSaveFretboards(fretboards.value);
}

const handleSaveCurrentFretboard = () => {
    const currentFretboard = constructFretboardData();
    saveCurrentFretboard(currentFretboard);
}

const handleSaveFretboards = (fretboards: FretboardRenderer[]) => {
    const fretboardList = fretboards.map(constructFretboardData);
    saveFretboards(fretboardList);
}

const onChangeCurrentKey = () => {
    updateCurrentFretboard();
}

const onChangeCurrentSetup = () => {
    patternStore.setDefaultPattern(currentSetup.value);
    onChangeCurrentPattern();
}

const onChangeCurrentPattern = () => {
    patternStore.updateCurrentHighlightNotes();
    updateCurrentFretboard();
}

const onChangeFretAmount = () => {
    updateCurrentFretboard();
}

const onChangeChordPosition = () => {
    updateCurrentFretboard();
}

const scrollToLastEdit = () => {
    const id = "fretboard-" + currentFretboardIndex.value;
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
    }
}

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
        handleSaveCurrentFretboard();
    } 

    handleSaveFretboards(fretboards.value);
}

watch(hasSidebarUpdated, () => {
    updateCurrentFretboard();

    if (!isEditing.value)
        isEditing.value = true;

    //scrollToLastEdit();
})

watch(hasTonalityUpdated, () => {
    //patternStore.updateTonality(); // changes currentKey to its relative major/minor
    patternStore.updateCurrentHighlightNotes();
})

watch(hasReset, () => {
    fretboards.value = [];
    addCurrentFretboard();
    updateCurrentFretboard();
})

onMounted(async () => {
    await getCurrentFretboard();
    await renderFretboard();

    Sortable.create(draggableList.value, {
        animation: 150,
        async onEnd({ oldIndex, newIndex }) {
            const moved = fretboards.value.splice(oldIndex, 1)[0];
            fretboards.value.splice(newIndex, 0, moved);
            handleSaveFretboards(fretboards.value);
        },
    });
})
</script>

<template>
    <div class="my-guitar mt-4">
        <!-- FRETBOARD -->
        <div ref="draggableList">
            <!-- fix me -->
            <!-- binds key to fretboard.id instead of fretboard.currentKey -->
            <div v-for="(fretboard, index) in fretboards" 
                class="mt-4 fretboard"
                :class="{ 'selected-fretboard': (fretboards.length > 1 && index == currentFretboardIndex && isEditing == true) }"
                :id="`fretboard-${index}`"
                :key="fretboard.currentKey"
            >
                <div v-if="index == currentFretboardIndex && isEditing == true">
                    <div class="selector-wrapper mb-3">
                        <!-- Setup Selector -->
                        <div class="switch-setup switch-radio me-2 fw-bold">
                            <label>
                                <input type="radio" name="setup" value="Scale" v-model="currentSetup" @change="onChangeCurrentSetup()">
                                    <div class="label px-2 py-1">Scale</div>
                                </input>
                            </label>

                            <label>
                                <input type="radio" name="setup" value="Chord" v-model="currentSetup" @change="onChangeCurrentSetup()"> 
                                    <div class="label px-2 py-1">Chord</div>
                                </input>
                            </label>
                        </div>

                        <!-- Pattern Selector -->
                        <div v-for="(scale, index) in allPatterns" :key="scale" class="d-inline-block custom-radio">
                            <label class="d-flex flex-column">
                                <input type="radio" name="scales" v-model="currentPattern" :value="allPatterns[index]" @change="onChangeCurrentPattern()">
                                    <span class="label px-3">{{ scale }}</span>
                                </input>
                            </label>
                        </div>
                    </div>

                    <div class="selector-wrapper mb-3">
                        <!-- Tonality -->
                        <div class="switch-tonality switch-radio me-2 fw-bold">
                            <label>
                                <input type="radio" name="tonality" :value="Tonality.MAJOR" v-model="currentTonality" @change="patternStore.toggleSidebarStatus(); patternStore.toggleTonalityStatus()">
                                    <div class="label px-2 py-1"> Major </div>
                                </input>
                            </label>

                            <label>
                                <input type="radio" name="tonality" :value="Tonality.MINOR" v-model="currentTonality" @change="patternStore.toggleSidebarStatus(); patternStore.toggleTonalityStatus()"> 
                                    <div class="label px-2 py-1"> Minor </div>
                                </input>
                            </label>
                        </div>

                        <!-- Key Selector -->
                        <div v-for="(key, index) in allKeys" :key="key" class="d-inline-block custom-radio">
                            <label class="d-flex flex-column">
                                <input type="radio" name="keys" v-model="currentKey" :value="allKeys[index]" @change="onChangeCurrentKey()">
                                    <span class="label"> {{ key }} </span>
                                </input>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="my-fretboard" :class="{'active-fretboard': index == currentFretboardIndex && isEditing == false && isSidebarActive == true }">
                    <div class="d-flex flex-column justify-content-center align-items-center mx-4">
                        <h5 class="text-yellow">
                            {{ fretboard.currentKey }} {{ fretboard.currentTonality }}
                        </h5>
                        <small class="text-yellow">
                            {{ fretboard.currentPattern }}
                        </small>
                    </div>
                    <MyFretboard
                        :fretAmount="fretboard.fretAmount"
                        :currentPattern="fretboard.currentPattern"
                        :currentKey="fretboard.currentKey"
                        :currentTonality="fretboard.currentTonality"
                        :currentAccidental="fretboard.currentAccidental"
                        :currentHighlightNotes="fretboard.currentHighlightNotes"
                        :currentCAGED="fretboard.currentCAGED"
                        :currentStrings="fretboard.currentStrings"
                        :isChordFocused="fretboard.currentSetup == Setup.Chord"
                        :chordPositions="getChordPositions(fretboard.currentPattern, fretboard.currentKey, fretboard.currentChordPosition)"
                        :barPositions="getBarPositions(fretboard.currentPattern, fretboard.currentKey, fretboard.currentChordPosition)"
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

                <!-- Chord Positions -->
                <div v-if="fretboard.currentSetup == Setup.Chord" class="mt-2">
                    <span class="me-1 text-yellow fw-bold">
                        Chord Positions
                    </span>
                    <div v-for="(position) in getChordPositionIndexes(fretboard.currentPattern, fretboard.currentKey)" :key="position" class="d-inline-block custom-radio">
                        <label class="d-flex flex-column">
                            <input type="radio" name="chordPositions" v-model="currentChordPosition" :value="position" @change="onChangeChordPosition()">
                                <span class="label px-3">{{ position + 1 }}</span>
                            </input>
                        </label>
                    </div>
                </div>

                <!-- Fret Amount Selector -->
                <div v-if="index == currentFretboardIndex && isEditing == true" class="mt-3">
                    <span class="me-3 text-yellow fw-bold">
                        Number of Frets
                    </span>
                    <input type="range" min="12" max="24" step="1" v-model.number="fretAmount" @change="onChangeFretAmount()">
                    <span class="ms-3 text-yellow fw-bold">
                        {{ fretAmount }}
                    </span>
                </div>
            </div>
        </div>

        <h2 @click="addCurrentFretboard" class="text-yellow"> + </h2>
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

.my-fretboard {
    display: flex;
    padding: 0.5rem 0;
    background-color: var(--fretboard-background-color);
    border-radius: 9px;
}

.active-fretboard {
    border: 1px solid $yellow;
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

.selector-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.switch-setup, .switch-tonality {
    display: flex;
    left: 0;
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
