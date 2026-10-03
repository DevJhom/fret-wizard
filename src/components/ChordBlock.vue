<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  numeral: string
  name: string
  removable?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()

// Seventh chords ("Bm7♭5", "IIImaj7") need a smaller size to fit the block
const isLongName = computed(() => props.name.length >= 5);
const isLongNumeral = computed(() => props.numeral.length >= 6);
</script>

<template>
  <div class="chord-block" :class="{ 'is-removable': removable }">
    <span class="chord-numeral" :class="{ 'is-long': isLongNumeral }">{{ numeral }}</span>
    <span class="chord-name" :class="{ 'is-long': isLongName }">{{ name }}</span>
    <button v-if="removable" class="chord-remove" title="Remove" :aria-label="`Remove ${name}`" @click.stop="emit('remove')">×</button>
  </div>
</template>

<style scoped lang="scss">
// Nested card: the numeral (same in every key) labels the outer card,
// and the chord name (changes with the key) sits on a panel inset inside it
$inset: 5px;
$radius: 14px;

.chord-block {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 88px;
  height: 94px;
  padding: 0 $inset $inset;
  background-color: var(--chord-block-back-color);
  border: 1px solid transparent;
  border-radius: $radius;
  box-shadow: var(--card-shadow);
  cursor: grab;
  user-select: none;
  transition: border-color 0.2s;

  &:hover {
    border-color: $yellow;
  }
}

.chord-numeral {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-text-color);

  &.is-long {
    font-size: 0.75rem;
  }
}

// Long numerals move left so they clear the × in the top-right corner
.is-removable .chord-numeral.is-long {
  padding-right: 23px;
}

// Inner radius = outer radius minus the inset, so both curves run parallel
.chord-name {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  background-color: var(--chord-block-front-color);
  border-radius: $radius - $inset;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  font-size: 1.4rem;
  font-weight: 600;
  white-space: nowrap;

  &.is-long {
    font-size: 1.1rem;
  }
}

.chord-remove {
  position: absolute;
  top: 0;
  right: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  color: var(--icon-color);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: $red;
  }
}

// Four blocks per row on a phone
@media (max-width: $phone) {
  .chord-block {
    width: 76px;
    height: 84px;
  }

  .chord-name {
    font-size: 1.25rem;

    &.is-long {
      font-size: 0.95rem;
    }
  }

  .chord-numeral {
    font-size: 0.8rem;

    &.is-long {
      font-size: 0.7rem;
    }
  }
}
</style>
