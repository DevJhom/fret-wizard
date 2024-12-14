<script setup lang="ts">
import { usePatternStore } from '@/stores/usePatternStore';
import { storeToRefs } from 'pinia';

const patternStore = usePatternStore();
const { currentHighlightNotes } = storeToRefs(patternStore);
</script>

<template>
    <div class="side-bar">
        <div class="notes d-flex flex-column text-start">
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
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">e</span>
            </label>
            <label class="d-flex notes">
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">B</span>
            </label>
            <label class="d-flex notes">
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">G</span>
            </label>
            <label class="d-flex notes">
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">D</span>
            </label>            
            <label class="d-flex notes">
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">A</span>
            </label>            
            <label class="d-flex notes">
                <input type="checkbox" :value="true" v-model="currentHighlightNotes"/>
                <div class="checkbox__checkmark"></div>
                <span class="ms-3">E</span>
            </label>
        </div>
        
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
    </div>
</template>

<style scoped lang="scss">
.side-bar {
    padding-right: 10%;
    // border: 1px solid $green;
    // border-radius: 5px;
    // padding: 20px 30px 20px 20px;
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
</style>
