<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { renamedTo } from '@/lib/cardSession';

const props = defineProps<{
    cardName?: string
}>();

const emit = defineEmits<{
    (e: 'rename', name: string): void
    (e: 'close'): void
    (e: 'open-library'): void
}>();

const nameInput = ref<HTMLInputElement | null>(null);
const isRenaming = ref(false);
const draft = ref('');

// Opens the name field with the whole name selected, so typing replaces it
const startRename = async () => {
    if (!props.cardName) return;
    draft.value = props.cardName;
    isRenaming.value = true;
    await nextTick();
    nameInput.value?.select();
}

// Enter and blur both land here; Enter's blur after the field closes is ignored
const saveRename = () => {
    if (!isRenaming.value) return;
    isRenaming.value = false;
    const name = renamedTo(draft.value, props.cardName ?? '');
    if (name) emit('rename', name);
}

const cancelRename = () => {
    isRenaming.value = false;
}

defineExpose({ startRename });
</script>

<template>
    <!-- Names the open card; its save state is on the Save button beside it -->
    <div class="card-identity">
        <button type="button" class="crumb" @click="emit('open-library')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/></svg>
            <span class="crumb-label">Library</span>
        </button>
        <span class="crumb-separator" aria-hidden="true">/</span>

        <template v-if="isRenaming">
            <label class="visually-hidden" for="card-name-input">Sheet name</label>
            <input
                id="card-name-input"
                ref="nameInput"
                v-model="draft"
                class="card-name-input"
                maxlength="80"
                @keydown.enter.prevent="saveRename"
                @keydown.esc.prevent="cancelRename"
                @blur="saveRename"
            >
        </template>
        <button v-else type="button" class="card-name" title="Rename" :aria-label="`Rename ${cardName}`" @click="startRename">
            <span class="card-name-text">{{ cardName }}</span>
            <svg class="card-name-pencil" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>
        </button>

        <button type="button" class="close-card" title="Close and start over with a blank fretboard" :aria-label="`Close ${cardName}`" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
            Close
        </button>
    </div>
</template>

<style scoped lang="scss">
// Shares the row with Stack View and Save, giving up width to them before the name is cut
.card-identity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    min-height: 44px;
}

.crumb {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 0.4rem;
    height: 44px;
    padding: 0 0.25rem;
    border: none;
    background: none;
    color: var(--muted-text-color);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        color: inherit;
    }
}

.crumb-separator {
    flex: none;
    color: var(--card-border-color);
    font-weight: 600;
}

// Reads as a title; the border and pencil on hover say it can be renamed
.card-name {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    height: 44px;
    margin-left: -0.5rem;
    padding: 0 0.5rem;
    border: 1px solid transparent;
    border-radius: 8px;
    background: none;
    color: inherit;
    font-size: 1.2rem;
    font-weight: 700;
    cursor: text;

    &:hover {
        border-color: var(--card-border-color);
    }
}

.card-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-name-pencil {
    flex: none;
    color: var(--muted-text-color);
    opacity: 0;
    transition: opacity 0.15s;
}

.card-name:hover .card-name-pencil,
.card-name:focus-visible .card-name-pencil {
    opacity: 1;
}

// Sits where the name was, its text in the same place, and only as wide as a name needs.
// It is always focused while open, so its one border is the focus ring
.card-name-input {
    flex: 0 1 16rem;
    min-width: 0;
    height: 36px;
    margin-left: -0.5rem;
    padding: 0 0.5rem;
    border: 1px solid var(--accent-text-color);
    border-radius: 8px;
    background-color: var(--card-background-color);
    color: inherit;
    font-size: 1.2rem;
    font-weight: 700;
    outline: none;
}

// Quiet like the Library crumb, so the name stays the title of the row
.close-card {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 0.35rem;
    height: 44px;
    padding: 0 0.6rem;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--muted-text-color);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
        background-color: var(--option-background-color);
        color: inherit;
    }
}

.crumb,
.card-name,
.close-card {
    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

@media (max-width: $phone) {
    .card-name,
    .card-name-input {
        font-size: 1.05rem;
    }
}
</style>
