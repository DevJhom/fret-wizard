<script setup lang="ts">
import { CurrentCAGED, CurrentStrings } from '@/lib/fretboardData';
import { Pattern, Tonality, Accidental } from '@data/constants';
import { isCAGEDNameHere, GetCAGEDName } from '@data/CAGED';
import { ChordPositions } from '@data/chords';
import MyString from '@components/MyString.vue';

const props = defineProps<{
    fretAmount: number,
    currentKey: string,
    currentPattern: Pattern,
    currentTonality: Tonality, 
    currentAccidental: Accidental,
    currentHighlightNotes: string[],
    currentCAGED: CurrentCAGED, 
    currentStrings: CurrentStrings,
    fadeOutsideShape?: boolean,
    rootBasedShapes?: boolean,
    labelMode?: 'notes' | 'intervals',
    stringToggles?: boolean,
    chordPositions?: ChordPositions,
    barPositions?: ChordPositions,
    E: string[],
    A: string[],
    D: string[],
    G: string[],
    B: string[],
    e: string[],
}>();

const emit = defineEmits<{
    (e: 'toggle-string', stringName: keyof CurrentStrings): void
}>();

const fretIndicator = new Array(24);
const fretIndicatorIndexes = [3,5,7,9,12,15,17,19,21,24];

</script>

<template>
        <!-- FRETBOARD -->
        <div>
            <!-- Fret Indicator -->
            <div class="d-flex w-75">
                <div class="d-inline-block string-name"></div>
                <div v-for="(_, index) in fretIndicator" :key="index" class="d-inline-block" :class="{'fret-indicator': index < fretAmount}">
                    <div v-if="index < fretAmount">
                        <small v-if="fretIndicatorIndexes.includes(index + 1)" class="opacity-75">
                            {{ index + 1 }}
                        </small>
                    </div>
                </div>
            </div>

            <!-- Strings -->
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.e }" :aria-pressed="currentStrings.e" :aria-label="`${currentStrings.e ? 'Hide' : 'Show'} e string`" @click="emit('toggle-string', 'e')">e</button>
                <div v-else class="d-inline-block string-name">e</div>
                <div class="fret-start string-e">
                    <MyString
                        :string-name="'e'"
                        :string-data="e"
                        :chord-positions="chordPositions?.e"
                        :bar-positions="barPositions?.e"
                        :fret-amount="fretAmount"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.B }" :aria-pressed="currentStrings.B" :aria-label="`${currentStrings.B ? 'Hide' : 'Show'} B string`" @click="emit('toggle-string', 'B')">B</button>
                <div v-else class="d-inline-block string-name">B</div>
                <div class="fret-start string-B">
                    <MyString
                        :string-name="'B'"
                        :string-data="B"
                        :chord-positions="chordPositions?.B"
                        :bar-positions="barPositions?.B"
                        :fret-amount="fretAmount"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.G }" :aria-pressed="currentStrings.G" :aria-label="`${currentStrings.G ? 'Hide' : 'Show'} G string`" @click="emit('toggle-string', 'G')">G</button>
                <div v-else class="d-inline-block string-name">G</div>
                <div class="fret-start string-G">
                    <MyString
                        :string-name="'G'"
                        :string-data="G"
                        :chord-positions="chordPositions?.G"
                        :bar-positions="barPositions?.G"
                        :fret-amount="fretAmount"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>
            <!-- Fret Dots (To be implemented later) -->
            <!-- <div class="fret-dot d-flex text-nowrap w-75">
                <div class="d-inline-block string-name"></div>
                <div v-for="(_, index) in D" :key="index" class="d-inline-block border-0" :class="{'fret': index < fretAmount}">
                    <span v-if="[2,4,6,8,14,16,18,20].includes(index)">*</span>
                    <span v-else-if="[11,23].includes(index)">**</span>
                </div>
            </div> -->
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.D }" :aria-pressed="currentStrings.D" :aria-label="`${currentStrings.D ? 'Hide' : 'Show'} D string`" @click="emit('toggle-string', 'D')">D</button>
                <div v-else class="d-inline-block string-name">D</div>
                <div class="fret-start string-D">
                    <MyString
                        :string-name="'D'"
                        :string-data="D"
                        :chord-positions="chordPositions?.D"
                        :bar-positions="barPositions?.D"
                        :fret-amount="fretAmount"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.A }" :aria-pressed="currentStrings.A" :aria-label="`${currentStrings.A ? 'Hide' : 'Show'} A string`" @click="emit('toggle-string', 'A')">A</button>
                <div v-else class="d-inline-block string-name">A</div>
                <div class="fret-start string-A">
                    <MyString
                        :string-name="'A'"
                        :string-data="A"
                        :chord-positions="chordPositions?.A"
                        :bar-positions="barPositions?.A"
                        :fret-amount="fretAmount"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>
            <div class="d-flex text-nowrap w-75">
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.E }" :aria-pressed="currentStrings.E" :aria-label="`${currentStrings.E ? 'Hide' : 'Show'} E string`" @click="emit('toggle-string', 'E')">E</button>
                <div v-else class="d-inline-block string-name">E</div>
                <div class="fret-start string-E last-string">
                    <MyString
                        :string-name="'E'"
                        :string-data="E"
                        :chord-positions="chordPositions?.E"
                        :bar-positions="barPositions?.E"
                        :fret-amount="fretAmount"
                        :is-last-string="true"
                        :current-key="currentKey"
                        :current-tonality="currentTonality"
                        :current-accidental="currentAccidental"
                        :current-highlight-notes="currentHighlightNotes"
                        :currentCAGED="currentCAGED"
                        :current-strings="currentStrings"
                        :current-pattern="currentPattern"
                        :fade-outside-shape="fadeOutsideShape"
                        :root-based-shapes="rootBasedShapes"
                        :label-mode="labelMode"
                    />
                </div>
            </div>

            <!-- CAGED Names -->
            <div v-if="!stringToggles" class="CAGED-name-container text-start">
                <div v-for="(_, index) in e" :key="index" class="d-inline-block CAGED-box" :class="{'fret': index < fretAmount}" style="border-right: none;">
                    <div v-if="index < fretAmount">
                        <!-- to be refactored -->
                        <span v-if="isCAGEDNameHere(index, currentCAGED, currentKey, currentTonality)" class="CAGED-name text-yellow">
                            {{ GetCAGEDName(index, currentCAGED, currentKey, currentTonality) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

</template>

<style scoped lang="scss">
.fret-indicator {
    min-width: 2rem;
    height: 30px;
    font-size: 12px;
}

.string-name {
    min-width: 30px;
    max-width: 30px;
    margin-top: -13px;
    margin-right: 12px;
}

.string-toggle {
    display: inline-block;
    height: 26px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: none;
    color: inherit;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: var(--accent-text-color);
    }
}

.string-hidden {
    opacity: 0.45;
    text-decoration: line-through;
}

.fret-start {
    border-left: 3px solid var(--nut-color);
}

.string-e, .string-B, .string-G, .string-D, .string-A {
    background-color: var(--neck-background-color);
}

.string-e {
    border-top: 1px solid var(--string-color);
}

.string-B {
    border-top: 1.5px solid var(--string-color);
}

.string-G {
    border-top: 2px solid var(--string-color);
}

.string-D {
    border-top: 2.5px solid var(--string-color);
}

.string-A {
    border-top: 3px solid var(--string-color);
}

.string-E {
    border-top: 3.5px solid var(--string-color);
}

.last-string {
    border-left-color: transparent;
}

.CAGED-name-container {
    padding-left: 2rem;
}

.CAGED-box {
    min-width: 2rem;
    max-width: 2rem;
    min-height: 10px;
}

.CAGED-name {
    white-space: nowrap;
    text-overflow: string;
    font-size: 12px;
}

// .fret-dot {
//     position: absolute;
//     justify-content: center;
//     align-items: center;
//     width: 100%;
//     margin-top: 70px;
// }

@media only screen and (max-width: 1024px) and (orientation: landscape) {
    .fret-indicator {
        min-width: 1.5rem;
    }

    .CAGED-box {
        min-width: 1.5rem;
        max-width: 1.5rem;
    }
}
</style>

