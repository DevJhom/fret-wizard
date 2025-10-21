<script setup lang="ts">
import { ref } from 'vue';
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';
import { Tonality, Accidental, Degree } from '@data/constants';

const patternStore = usePatternStore();
const { currentTonality, currentAccidental, currentHighlightNotes, currentCAGED, currentStrings } = storeToRefs(patternStore);

const { roots, minorSeconds, seconds, minorThirds, thirds, fourths, tritones, fifths, minorSixths, sixths, minorSevenths, sevenths } = Degree;

const isCollapsed = ref(true);

const toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar")!;
  sidebar.classList.toggle("collapsed");
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
    <div id="sidebar" class="side-bar">
        <div class="hamburger text-start" @click="toggleSidebar()">☰</div>
        <Transition name="fade"> 
            <div v-show="isCollapsed">
                <!-- Tonality -->
                <div class="d-flex mt-5 switch-radio">
                    <label>
                        <input type="radio" name="tonality" :value="Tonality.MAJOR" v-model="currentTonality" @change="patternStore.toggleSidebarStatus(); patternStore.toggleTonalityStatus()">
                            <div class="label"> Major </div>
                        </input>
                    </label>

                    <label>
                        <input type="radio" name="tonality" :value="Tonality.MINOR" v-model="currentTonality" @change="patternStore.toggleSidebarStatus(); patternStore.toggleTonalityStatus()"> 
                            <div class="label"> Minor </div>
                        </input>
                    </label>
                </div>

                <!-- Accidental -->
                <div class="d-flex mt-3 switch-radio">
                    <label>
                        <input type="radio" name="accidental" :value="Accidental.SHARP" v-model="currentAccidental" @change="patternStore.toggleSidebarStatus(); patternStore.updateToEqualAccidental()">
                            <div class="label text-nowrap"> Sharp ♯ </div>
                        </input>
                    </label>

                    <label>
                        <input type="radio" name="accidental" :value="Accidental.FLAT" v-model="currentAccidental" @change="patternStore.toggleSidebarStatus(); patternStore.updateToEqualAccidental()"> 
                            <div class="label text-nowrap"> Flat ♭ </div>
                        </input>
                    </label>
                </div>

                <!-- Notes -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Notes 
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label v-for="(highlightNote, index) in patternStore.highlightNotes" :key="index" class="d-flex notes">
                        <input type="checkbox" :value="highlightNote" v-model="currentHighlightNotes" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark"
                            :class="{
                                'root-note': highlightNote == roots && currentHighlightNotes.includes(roots),
                                'minor-second': highlightNote == minorSeconds && currentHighlightNotes.includes(minorSeconds),
                                'second': highlightNote == seconds && currentHighlightNotes.includes(seconds),
                                'minor-third': highlightNote == minorThirds && currentHighlightNotes.includes(minorThirds),
                                'third': highlightNote == thirds && currentHighlightNotes.includes(thirds),
                                'tritone': highlightNote == tritones && currentHighlightNotes.includes(tritones),
                                'fourth': highlightNote == fourths && currentHighlightNotes.includes(fourths),
                                'fifth': highlightNote == fifths && currentHighlightNotes.includes(fifths),
                                'minor-sixth': highlightNote == minorSixths && currentHighlightNotes.includes(minorSixths),
                                'sixth': highlightNote == sixths && currentHighlightNotes.includes(sixths),
                                'minor-seventh': highlightNote == minorSevenths && currentHighlightNotes.includes(minorSevenths),
                                'seventh': highlightNote == sevenths && currentHighlightNotes.includes(sevenths)
                            }">
                        </div>
                        <span class="ms-3">
                            {{ highlightNote }}
                        </span>
                    </label>
                </div>

                <!-- Shapes (CAGED) -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Shapes (CAGED)
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentCAGED.CShape" v-model="currentCAGED.CShape" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentCAGED.CShape}"></div>
                        <span class="ms-3">C</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentCAGED.AShape" v-model="currentCAGED.AShape" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentCAGED.AShape}"></div>
                        <span class="ms-3">A</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentCAGED.GShape" v-model="currentCAGED.GShape" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentCAGED.GShape}"></div>
                        <span class="ms-3">G</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentCAGED.EShape" v-model="currentCAGED.EShape" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentCAGED.EShape}"></div>
                        <span class="ms-3">E</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentCAGED.DShape" v-model="currentCAGED.DShape" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentCAGED.DShape}"></div>
                        <span class="ms-3">D</span>
                    </label>            
                </div>

                <!-- Strings (EADGBe) -->
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Strings (EADGBe)
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.e" v-model="currentStrings.e" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.e}"></div>
                        <span class="ms-3">e</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.B" v-model="currentStrings.B" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.B}"></div>
                        <span class="ms-3">B</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.G" v-model="currentStrings.G" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.G}"></div>
                        <span class="ms-3">G</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.D" v-model="currentStrings.D" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.D}"></div>
                        <span class="ms-3">D</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.A" v-model="currentStrings.A" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.A}"></div>
                        <span class="ms-3">A</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.E" v-model="currentStrings.E" @change="patternStore.toggleSidebarStatus()"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.E}"></div>
                        <span class="ms-3">E</span>
                    </label>
                </div>
                
                <!-- Reset to Default -->
                <div class="mt-5" @click="patternStore.resetToDefault()">
                    <small class="reset-settings">
                        Reset Settings
                    </small>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.side-bar {
    width: 15vw;
    min-height: 100vh;
    padding: 1rem 1.5rem;
    background-color: var(--sidebar-background-color);
    transition: 0.5s;
}

.side-bar.collapsed {
    width: 60px; 
    background-color: transparent;
    padding: 1rem;
}

.hamburger {
    font-size: 1.5rem;
    margin-top: -4px;
    color: $yellow;
    cursor: pointer;
}

.highlightNotes-label {
    position: absolute;
    top: 16%;
    right: 11%;
}

.highlightNotes-filter .checkbox__checkmark {
    margin-top: 4px !important;
    background-color: $black;
    cursor: pointer;
}

.reset-settings {
    background-color: var(--reset-settings-background-color);
    color: $black;
    border-radius: 9px;
    padding: 0.25rem 1rem;
    cursor: pointer;
}

.reset-settings:hover {
    background-color: $yellow;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease; 
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0; 
}
</style>
