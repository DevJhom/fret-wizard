<script setup lang="ts">
import { ref } from 'vue';
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';

const patternStore = usePatternStore();
const { currentHighlightNotes, currentStrings } = storeToRefs(patternStore);

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
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Notes 
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label v-for="(highlightNote) in patternStore.highlightNotes" :key="highlightNote" class="d-flex notes">
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

                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Strings (EADGBe)
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.E" v-model="currentStrings.E"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.E}"></div>
                        <span class="ms-3">e</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.A" v-model="currentStrings.A"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.A}"></div>
                        <span class="ms-3">B</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.D" v-model="currentStrings.D"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.D}"></div>
                        <span class="ms-3">G</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.G" v-model="currentStrings.G"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.G}"></div>
                        <span class="ms-3">D</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.B" v-model="currentStrings.B"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.B}"></div>
                        <span class="ms-3">A</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="currentStrings.e" v-model="currentStrings.e"/>
                        <div class="checkbox__checkmark" :class="{'yellow': currentStrings.e}"></div>
                        <span class="ms-3">E</span>
                    </label>
                </div>
                
                <!-- THE CAGED SYSTEM (To be implemented later)
                <div class="notes d-flex flex-column text-start mt-5">
                    <span class="me-2 text-yellow fw-bold">
                        Shapes (CAGED)
                    </span>
                </div>
                <div class="highlightNotes-filter notes d-flex flex-column text-end">
                    <label class="d-flex notes">
                        <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                        <div class="checkbox__checkmark"></div>
                        <span class="ms-3">C</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                        <div class="checkbox__checkmark"></div>
                        <span class="ms-3">A</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                        <div class="checkbox__checkmark"></div>
                        <span class="ms-3">G</span>
                    </label>
                    <label class="d-flex notes">
                        <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                        <div class="checkbox__checkmark"></div>
                        <span class="ms-3">E</span>
                    </label>            
                    <label class="d-flex notes">
                        <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                        <div class="checkbox__checkmark"></div>
                        <span class="ms-3">D</span>
                    </label>            
                </div>
                -->
            </div>
        </Transition>
    </div>
</template>

<style scoped lang="scss">
.side-bar {
    width: 15vw;
    height: 100%;
    min-height: 100vh;
    padding: 1rem 2rem;
    background-color: #3c3e41;
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
    background-color: #242525;
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
