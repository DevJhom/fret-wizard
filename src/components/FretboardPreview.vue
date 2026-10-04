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

// Inlay dots under the neck: one at 3, 5, 7, 9; two at 12
const inlayCount = (fret: number) => (fret === 12 ? 2 : [3, 5, 7, 9].includes(fret) ? 1 : 0);
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
        <div class="inlays" aria-hidden="true">
            <div class="open"></div>
            <div class="inlay-frets">
                <div v-for="fret in PREVIEW_FRETS" :key="fret" class="inlay">
                    <span v-for="n in inlayCount(fret)" :key="n" class="inlay-dot"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.preview {
    padding: 10px 10px 4px;
    border-radius: 10px;
    border: 1px solid var(--card-border-color);
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

.open {
    flex: 0 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.frets {
    flex: 1;
    display: flex;
    background-color: var(--neck-background-color);
    border-left: 3px solid var(--nut-color);
}

.fret {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid var(--fret-wire-color);
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

.inlays {
    display: flex;
    height: 12px;
    align-items: center;
}

.inlay-frets {
    flex: 1;
    display: flex;
    padding-left: 3px;
}

.inlay {
    flex: 1 1 0;
    display: flex;
    justify-content: center;
    gap: 3px;
}

.inlay-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--muted-text-color);
    font-size: 0;
}
</style>
