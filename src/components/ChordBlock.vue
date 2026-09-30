<script setup lang="ts">
defineProps<{
  numeral: string
  name: string
  removable?: boolean
}>()

const emit = defineEmits<{
  (e: 'remove'): void
}>()
</script>

<template>
  <div class="chord-block">
    <span class="chord-numeral">{{ numeral }}</span>
    <span class="chord-name">{{ name }}</span>
    <button v-if="removable" class="chord-remove" title="Remove" @click.stop="emit('remove')">×</button>
  </div>
</template>

<style scoped lang="scss">
.chord-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  background-color: var(--card-background-color);
  border: 1px solid var(--card-border-color);
  box-shadow: var(--card-shadow);
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  transition: border-color 0.2s;

  &:hover {
    border-color: $yellow;
  }
}

.chord-numeral {
  font-size: 0.8rem;
  color: var(--accent-text-color);
}

.chord-name {
  font-size: 1.4rem;
  font-weight: 600;
}

.chord-remove {
  position: absolute;
  top: 2px;
  right: 4px;
  padding: 0 4px;
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
</style>
