<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps<{
    cardName?: string,
    isDirty: boolean
}>();

const emit = defineEmits<{
    (e: 'save'): void
    (e: 'save-as-new'): void
}>();

const root = ref<HTMLElement | null>(null);
const toggle = ref<HTMLButtonElement | null>(null);
const options = ref<HTMLElement | null>(null);
const isOpen = ref(false);

// The open card already holds this stack, so there is nothing to save to it
const isSaved = computed(() => !!props.cardName && !props.isDirty);

// The bar no longer names the open card; the tooltip still says which one Save writes to
const saveTitle = computed(() => {
    if (!props.cardName) return undefined;
    return isSaved.value ? `"${props.cardName}" is up to date` : `Save changes to "${props.cardName}"`;
});

const enabledOptions = () => Array.from(options.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? []);

const openMenu = async () => {
    isOpen.value = true;
    await nextTick();
    enabledOptions()[0]?.focus();
}

const closeMenu = (returnFocus = false) => {
    if (!isOpen.value) return;
    isOpen.value = false;
    if (returnFocus) toggle.value?.focus();
}

const toggleMenu = () => {
    if (isOpen.value) closeMenu();
    else openMenu();
}

// Up/Down move through the options, wrapping at the ends
const moveFocus = (step: number) => {
    const items = enabledOptions();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(index + step + items.length) % items.length]?.focus();
}

const save = () => {
    closeMenu(true);
    emit('save');
}

const saveAsNew = () => {
    closeMenu(true);
    emit('save-as-new');
}

const closeOnOutsidePress = (event: PointerEvent) => {
    if (!root.value?.contains(event.target as Node)) closeMenu();
}

onMounted(() => document.addEventListener('pointerdown', closeOnOutsidePress));
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsidePress));
</script>

<template>
    <!-- Split button: the main action on the left, the other ways to save behind the arrow -->
    <div ref="root" class="save-menu" @keydown.esc="closeMenu(true)">
        <button type="button" class="save-main" :disabled="isSaved" :title="saveTitle" @click="save">
            <span class="save-label" :class="{ 'is-hidden': isSaved }">Save to Library</span>
            <span class="save-label" :class="{ 'is-hidden': !isSaved }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                Saved
            </span>
        </button>
        <button ref="toggle" type="button" class="save-toggle" aria-label="More ways to save" aria-haspopup="menu" :aria-expanded="isOpen" @click="toggleMenu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
        </button>

        <div
            v-if="isOpen"
            ref="options"
            class="save-options"
            role="menu"
            @keydown.down.prevent="moveFocus(1)"
            @keydown.up.prevent="moveFocus(-1)"
            @keydown.tab="closeMenu()"
        >
            <button type="button" class="save-option" role="menuitem" :disabled="isSaved" @click="save">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3"/><path d="M8 21v-7h8v7"/></svg>
                Save to Library
            </button>
            <button type="button" class="save-option" role="menuitem" @click="saveAsNew">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
                Save as a New Card
            </button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.save-menu {
    position: relative;
    display: flex;
}

.save-main,
.save-toggle {
    align-items: center;
    height: 44px;
    border: none;
    color: $black;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        filter: brightness(1.1);
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}

.save-main {
    display: inline-grid;
    justify-items: center;
    padding: 0 1rem;
    border-radius: 9px 0 0 9px;
    background-color: $yellow;
}

// Both labels share one cell, so the button keeps its width when the label changes
.save-label {
    grid-area: 1 / 1;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: inherit;
}

.is-hidden {
    visibility: hidden;
}

// Same yellow as "Save to Library": the label and check mark are what say it is saved
.save-main:disabled {
    cursor: default;
    filter: none;
}

// Yellow like the main action; the gray line between them keeps the two halves reading as separate targets
.save-toggle {
    display: inline-flex;
    justify-content: center;
    width: 40px;
    padding: 0;
    border-left: 1px solid $gray-1;
    border-radius: 0 9px 9px 0;
    background-color: $yellow;
}

// Opens under the button, lined up with its right edge
.save-options {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-width: 13rem;
    padding: 0.35rem;
    border: 1px solid var(--card-border-color);
    border-radius: 12px;
    background-color: var(--card-background-color);
    box-shadow: 0 12px 28px -10px rgba(0, 0, 0, 0.45);
}

.save-option {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    height: 44px;
    padding: 0 0.75rem;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        background-color: var(--option-background-color);
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: -2px;
    }

    &:disabled {
        opacity: 0.45;
        background: none;
        cursor: default;
    }
}
</style>
