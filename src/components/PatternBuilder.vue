<script setup lang="ts">
import { computed } from 'vue';
import { Accidental, Pattern, Setup, Tonality, majorSharpAllNotes, majorFlatAllNotes } from '@data/constants';
import { isQualityLocked, qualityLockedReason } from '@data/patternNames';
import type { FretboardData } from '@/lib/fretboardData';

const props = defineProps<{
    chord: FretboardData,
    setup: Setup
}>();

const emit = defineEmits<{
    (e: 'change-root', key: string): void
    (e: 'change-tonality', tonality: Tonality): void
    (e: 'change-pattern', pattern: Pattern): void
    (e: 'change-accidental', accidental: Accidental): void
}>();

const scaleTypes = [
    { pattern: Pattern.Pentatonic, label: 'Pentatonic' },
    { pattern: Pattern.Blue, label: 'Blues' },
    { pattern: Pattern.Diatonic, label: 'Diatonic' },
    { pattern: Pattern.Chromatic, label: 'Chromatic' },
    { pattern: Pattern.Triad, label: 'Triad' },
];

const chordTypes = [
    { pattern: Pattern.Triad, label: 'Triad' },
    { pattern: Pattern.Seventh, label: '7th' },
    { pattern: Pattern.Dominant, label: 'Dom 7' },
    { pattern: Pattern.Add9, label: 'add9' },
    { pattern: Pattern.Add11, label: 'add11' },
    { pattern: Pattern.Add13, label: 'add13' },
    { pattern: Pattern.Power, label: 'Power' },
];

const roots = computed(() => props.chord.currentAccidental == Accidental.FLAT ? majorFlatAllNotes : majorSharpAllNotes);
const qualityLocked = computed(() => isQualityLocked(props.chord.currentPattern));
const lockedNote = computed(() => qualityLockedReason(props.chord.currentPattern));
const isScale = computed(() => props.setup == Setup.Scale);
const types = computed(() => isScale.value ? scaleTypes : chordTypes);
</script>

<template>
    <div class="pattern-builder">
        <div class="builder-field">
            <span class="builder-label">Key</span>
            <div class="option-row">
                <label v-for="root in roots" :key="root" class="custom-radio">
                    <input type="radio" name="chord-root" :value="root" :checked="chord.currentKey == root" @change="emit('change-root', root)">
                        <span class="label">{{ root }}</span>
                    </input>
                </label>
            </div>
        </div>

        <div class="builder-field">
            <span class="builder-label">Accidental</span>
            <div class="tile-radio fw-bold">
                <label>
                    <input type="radio" name="chord-accidental" :checked="chord.currentAccidental == Accidental.SHARP" @change="emit('change-accidental', Accidental.SHARP)">
                        <div class="label px-2 py-1" aria-label="Sharps">♯</div>
                    </input>
                </label>
                <label>
                    <input type="radio" name="chord-accidental" :checked="chord.currentAccidental == Accidental.FLAT" @change="emit('change-accidental', Accidental.FLAT)">
                        <div class="label px-2 py-1" aria-label="Flats">♭</div>
                    </input>
                </label>
            </div>
        </div>

        <div class="builder-field">
            <span class="builder-label">{{ isScale ? 'Scale' : 'Type' }}</span>
            <div class="option-row">
                <label v-for="type in types" :key="type.pattern" class="custom-radio">
                    <input type="radio" name="chord-type" :value="type.pattern" :checked="chord.currentPattern == type.pattern" @change="emit('change-pattern', type.pattern)">
                        <span class="label px-3">{{ type.label }}</span>
                    </input>
                </label>
            </div>
        </div>

        <div class="builder-field">
            <span class="builder-label">Quality</span>
            <div class="tile-radio fw-bold" :class="{ 'is-locked': qualityLocked }">
                <label>
                    <input type="radio" name="chord-tonality" :disabled="qualityLocked" :checked="!qualityLocked && chord.currentTonality == Tonality.MAJOR" @change="emit('change-tonality', Tonality.MAJOR)">
                        <div class="label px-2 py-1"> Major </div>
                    </input>
                </label>
                <label>
                    <input type="radio" name="chord-tonality" :disabled="qualityLocked" :checked="!qualityLocked && chord.currentTonality == Tonality.MINOR" @change="emit('change-tonality', Tonality.MINOR)">
                        <div class="label px-2 py-1"> Minor </div>
                    </input>
                </label>
            </div>
            <small v-if="qualityLocked" class="locked-note">{{ lockedNote }}</small>
        </div>
    </div>
</template>

<style scoped lang="scss">
// Each field is a heading above its options: Key | Accidental, then Scale/Type | Quality
.pattern-builder {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: start;
    align-content: start;
    gap: 1.25rem 2.5rem;
    flex-grow: 1;
}

.builder-field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    min-width: 0;
}

.builder-label {
    text-align: start;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $gray-1;
}

.option-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.is-locked {
    opacity: 0.4;

    label {
        cursor: not-allowed;
    }
}

.locked-note {
    text-align: start;
    color: $gray-1;
}

.custom-radio .label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
    padding: 0 5px;
}

.tile-radio .label {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    height: 44px;
}

@media (max-width: $phone) {
    .pattern-builder {
        grid-template-columns: 1fr;
        gap: 1.15rem;
    }
}
</style>
