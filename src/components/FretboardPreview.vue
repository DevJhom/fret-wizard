<script setup lang="ts">
import { computed } from 'vue';
import { Degree } from '@data/constants';
import { boardPreview, PREVIEW_FRETS } from '@data/boardPreview';
import { degreeClasses } from '@/lib/degreeClasses';
import type { FretboardData } from '@/lib/fretboardData';

const props = defineProps<{
    fretboard: FretboardData,
    label: string
}>();

const strings = computed(() => boardPreview(props.fretboard));

const dotClass = (degree: Degree | null) => (degree ? degreeClasses[degree] : '');
</script>

<template>
    <div class="preview" role="img" :aria-label="`Preview of ${label}, frets 0 to ${PREVIEW_FRETS}`">
        <div v-for="string in strings" :key="string.name" class="preview-string" :class="`string-${string.name}`">
            <div class="open">
                <span v-if="string.notes[0]" class="degree-dot dot open-dot" :class="dotClass(string.notes[0])"></span>
            </div>
            <div class="frets">
                <div v-for="fret in PREVIEW_FRETS" :key="fret" class="fret">
                    <span v-if="string.notes[fret]" class="degree-dot dot" :class="dotClass(string.notes[fret])"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview {
    padding: 10px;
}

.preview-string {
    position: relative;
    display: flex;
    height: 13px;

    // The string itself, drawn over the neck and under the dots
    &::after {
        content: "";
        position: absolute;
        left: 16px;
        right: 0;
        top: 6px;
        height: 1px;
        background-color: var(--string-color);
        z-index: 1;
    }
}

.string-G::after,
.string-D::after {
    height: 1.5px;
}

.string-A::after,
.string-E::after {
    height: 2px;
}

// The neck runs from the e string to the E string, as on the main fretboard:
// nothing is drawn above the first string or below the last
.string-e {
    --neck-top: 6px;
}

.string-E {
    --neck-bottom: 5px;
}

// Open notes sit against the nut, as on the main fretboard
.open {
    flex: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.frets {
    position: relative;
    flex: 1;
    display: flex;
    padding-left: 3px;

    // Neck and nut
    &::before {
        content: "";
        position: absolute;
        inset: var(--neck-top, 0) 0 var(--neck-bottom, 0) 0;
        background-color: var(--neck-background-color);
        border-left: 3px solid var(--nut-color);
    }
}

.fret {
    position: relative;
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;

    // Fret wire
    &::after {
        content: "";
        position: absolute;
        top: var(--neck-top, 0);
        bottom: var(--neck-bottom, 0);
        right: 0;
        width: 1px;
        background-color: var(--fret-wire-color);
    }
}

.dot {
    position: relative;
    z-index: 2;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    font-size: 0;
}

.open-dot {
    width: 7px;
    height: 7px;
}
</style>
