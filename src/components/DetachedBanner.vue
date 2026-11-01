<script setup lang="ts">
const emit = defineEmits<{
    (e: 'save-as-new'): void
    (e: 'dismiss'): void
}>();
</script>

<template>
    <!-- The URL named a card the Library doesn't have: say so, instead of quietly showing a draft -->
    <div class="detached-banner" role="status">
        <svg class="detached-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg>
        <p class="detached-text">These fretboards aren't in your Library anymore. They're still here, but unsaved.</p>
        <div class="detached-actions">
            <button type="button" class="banner-button is-primary" @click="emit('save-as-new')">Save to Library</button>
            <button type="button" class="banner-button" @click="emit('dismiss')">Dismiss</button>
        </div>
    </div>
</template>

<style scoped lang="scss">
.detached-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem 1rem;
    padding: 0.6rem 0.75rem 0.6rem 1rem;
    border: 1px solid color-mix(in srgb, var(--danger-color) 30%, transparent);
    border-radius: 12px;
    background-color: color-mix(in srgb, var(--danger-color) 8%, transparent);
}

.detached-icon {
    flex: none;
    color: var(--danger-color);
}

.detached-text {
    flex: 1 1 18rem;
    min-width: 0;
    margin: 0;
    font-size: 0.9rem;
}

.detached-actions {
    display: flex;
    gap: 0.5rem;
}

.banner-button {
    height: 44px;
    padding: 0 1rem;
    border: 1px solid var(--card-border-color);
    border-radius: 9px;
    background-color: var(--card-background-color);
    color: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;

    &.is-primary {
        border-color: transparent;
        background-color: $yellow;
        color: $black;
    }

    &:hover {
        filter: brightness(1.1);
    }

    &:focus-visible {
        outline: 2px solid $yellow;
        outline-offset: 2px;
    }
}
</style>
