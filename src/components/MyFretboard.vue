<script setup lang="ts">
import { CurrentCAGED, CurrentStrings } from '@/lib/fretboardData';
import { Pattern, Tonality, Accidental } from '@data/constants';
import { isCAGEDNameHere, GetCAGEDName } from '@data/CAGED';
import { FRET_MARKERS, DOUBLE_INLAY_FRETS, SINGLE_INLAY_FRETS } from '@/lib/fretMarkers';
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
    shapeNames?: boolean,
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
const fretIndicatorIndexes = FRET_MARKERS;

// Inlay dots on the neck: one between G and D, two at the octaves (between B and G, and D and A)
const doubleInlayFrets = DOUBLE_INLAY_FRETS;
const singleInlayFrets = SINGLE_INLAY_FRETS;

</script>

<template>
        <!-- FRETBOARD -->
        <div class="fretboard">
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
                        :inlay-frets="doubleInlayFrets"
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
                        :inlay-frets="singleInlayFrets"
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
                <button v-if="stringToggles" type="button" class="string-name string-toggle" :class="{ 'string-hidden': !currentStrings.D }" :aria-pressed="currentStrings.D" :aria-label="`${currentStrings.D ? 'Hide' : 'Show'} D string`" @click="emit('toggle-string', 'D')">D</button>
                <div v-else class="d-inline-block string-name">D</div>
                <div class="fret-start string-D">
                    <MyString
                        :string-name="'D'"
                        :string-data="D"
                        :inlay-frets="doubleInlayFrets"
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
            <div v-if="shapeNames" class="CAGED-name-container text-start">
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
// Keeps the note labels' z-index inside the fretboard, so menus that open over it stay on top.
// Centers notes and fret numbers in their fret, whatever alignment the surrounding card uses.
.fretboard {
    isolation: isolate;
    text-align: center;
}

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
    color: rgba($gray-1, 0.6);
}

// Containing block for MyString's absolute open-position note, so it scrolls with the neck.
.fret-start {
    position: relative;
    border-top: var(--string-width) solid var(--string-color);
    border-left: 3px solid var(--nut-color);
}

// Where a string meets the nut the browser splits the corner diagonally, so the nut fills it in
.fret-start::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: -3px;
    width: 3px;
    height: var(--string-width);
    background-color: var(--nut-color);
}

.string-e, .string-B, .string-G, .string-D, .string-A {
    background-color: var(--neck-background-color);
}

.string-e {
    --string-width: 1px;
}

.string-B {
    --string-width: 1.5px;
}

.string-G {
    --string-width: 2px;
}

.string-D {
    --string-width: 2.5px;
}

.string-A {
    --string-width: 3px;
}

.string-E {
    --string-width: 3.5px;
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

@media (max-width: $phone) {
    .fret-indicator {
        min-width: 1.5rem;
    }

    .CAGED-box {
        min-width: 1.5rem;
        max-width: 1.5rem;
    }
}
</style>

