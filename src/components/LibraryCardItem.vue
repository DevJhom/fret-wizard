<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { Setup } from '@data/constants';
import FretboardPreview from '@components/FretboardPreview.vue';
import { cardMeta, fretboardLabel } from '@/lib/libraryView';
import type { FretboardData } from '@/lib/fretboardData';
import type { LibraryCard } from '@stores/useLibraryStore';

const props = defineProps<{
    card: LibraryCard
}>();

const emit = defineEmits<{
    (e: 'open'): void,
    (e: 'rename', name: string): void,
    (e: 'delete'): void
}>();

const selected = ref(0);
const isRenaming = ref(false);
const isConfirmingDelete = ref(false);
const draft = ref('');
const nameInput = ref<HTMLInputElement | null>(null);
const cancelDeleteButton = ref<HTMLButtonElement | null>(null);

// Clamped because the active card's stack can shrink while this page is open
const selectedFretboard = computed<FretboardData | undefined>(() =>
    props.card.fretboards[Math.min(selected.value, props.card.fretboards.length - 1)]
);

const chips = computed(() => props.card.fretboards.map((fretboard, index) => ({
    index,
    label: fretboardLabel(fretboard, props.card.setup),
    isSelected: fretboard === selectedFretboard.value,
})));

const meta = computed(() => cardMeta(props.card));

const startRename = async () => {
    draft.value = props.card.name;
    isConfirmingDelete.value = false;
    isRenaming.value = true;
    await nextTick();
    nameInput.value?.select();
};

const saveRename = () => {
    if (!isRenaming.value) return;
    isRenaming.value = false;
    const name = draft.value.trim();
    if (name && name !== props.card.name) emit('rename', name);
};

const cancelRename = () => {
    isRenaming.value = false;
};

const askDelete = async () => {
    isRenaming.value = false;
    isConfirmingDelete.value = true;
    await nextTick();
    cancelDeleteButton.value?.focus();
};

const cancelDelete = () => {
    isConfirmingDelete.value = false;
};
</script>

<template>
    <article class="library-card">
        <div class="card-top">
            <span class="badge" :class="card.setup === Setup.Scale ? 'badge-scale' : 'badge-chord'">{{ card.setup }}</span>
            <div class="corner-actions">
                <button v-if="isRenaming" type="button" class="btn-icon btn-confirm" aria-label="Save name" @mousedown.prevent @click="saveRename">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
                </button>
                <button v-else type="button" class="btn-icon" :aria-label="`Rename ${card.name}`" @click="startRename">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/></svg>
                </button>
                <button v-if="!isConfirmingDelete" type="button" class="btn-icon btn-delete" :aria-label="`Delete ${card.name}`" @click="askDelete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>
                </button>
            </div>
        </div>

        <div>
            <h2 v-if="!isRenaming" class="card-name">{{ card.name }}</h2>
            <div v-else class="rename-row">
                <label class="visually-hidden" :for="`rename-${card.id}`">Card name</label>
                <input
                    :id="`rename-${card.id}`"
                    ref="nameInput"
                    v-model="draft"
                    class="rename-input"
                    maxlength="80"
                    @keydown.enter.prevent="saveRename"
                    @keydown.esc.prevent="cancelRename"
                    @blur="saveRename"
                />
            </div>
            <p class="card-meta">{{ meta }}</p>
        </div>

        <FretboardPreview v-if="selectedFretboard" :fretboard="selectedFretboard" :label="fretboardLabel(selectedFretboard, card.setup)"/>

        <div v-if="chips.length > 1" class="chips" role="group" aria-label="Fretboards in this card">
            <button
                v-for="chip in chips"
                :key="chip.index"
                type="button"
                class="chip"
                :class="{ 'chip-selected': chip.isSelected }"
                :aria-pressed="chip.isSelected"
                @click="selected = chip.index"
            >{{ chip.label }}</button>
        </div>
        <div v-else-if="chips.length === 1" class="chips">
            <span class="chip chip-static">{{ chips[0].label }}</span>
        </div>

        <div class="card-footer">
            <div v-if="!isConfirmingDelete" class="footer-row footer-open">
                <button type="button" class="btn-open" @click="emit('open')">
                    Open in {{ card.setup }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
            </div>
            <div v-else class="footer-row" @keydown.esc="cancelDelete">
                <span class="confirm-text">Delete this card?</span>
                <button ref="cancelDeleteButton" type="button" class="btn-secondary" @click="cancelDelete">Cancel</button>
                <button type="button" class="btn-danger" @click="emit('delete')">Delete</button>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">
.library-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px;
    border-radius: 14px;
    background-color: var(--card-background-color);
    border: 1px solid var(--card-border-color);
    box-shadow: var(--card-shadow);
    text-align: left;
    transition: border-color 0.15s ease;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
}

.badge {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid var(--accent-text-color);
}

.badge-scale {
    background-color: var(--accent-text-color);
    color: var(--accent-contrast-color);
}

.badge-chord {
    color: var(--accent-strong-text-color);
}

.card-name {
    margin: 0;
    font-size: 18px;
    line-height: 1.3;
    font-weight: 650;
    overflow-wrap: anywhere;
}

.card-meta {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--muted-text-color);
}

.rename-row {
    display: flex;
    gap: 8px;
}

.rename-input {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    border-radius: 10px;
    border: 1px solid var(--accent-text-color);
    background-color: var(--card-background-color);
    color: inherit;
    font-weight: 600;
    outline: none;
}

.chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.chip {
    min-height: 32px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--card-border-color);
    background-color: transparent;
    color: var(--muted-text-color);
    font-size: 12px;
    font-weight: 600;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.chip-selected {
    background-color: var(--accent-soft-color);
    border-color: var(--accent-text-color);
    color: var(--accent-strong-text-color);
}

.chip-static {
    display: inline-flex;
    align-items: center;

    &:hover {
        border-color: var(--card-border-color);
    }
}

.card-footer {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--card-border-color);
}

.footer-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.confirm-text {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
}

%btn {
    height: 44px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid transparent;
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    white-space: nowrap;
}

.btn-open {
    @extend %btn;
    background-color: var(--accent-soft-color);
    color: var(--accent-strong-text-color);

    &:hover {
        border-color: var(--accent-text-color);
    }
}


.btn-secondary {
    @extend %btn;
    background-color: transparent;
    border-color: var(--card-border-color);
    color: inherit;

    &:hover {
        border-color: var(--accent-text-color);
    }
}

.btn-danger {
    @extend %btn;
    background-color: var(--danger-color);
    color: #ffffff;

    &:hover {
        border-color: transparent;
    }
}

.btn-icon {
    @extend %btn;
    width: 44px;
    padding: 0;
    background-color: transparent;
    color: var(--muted-text-color);

    &:hover {
        background-color: var(--option-background-color);
        border-color: transparent;
        color: inherit;
    }
}

// Pulled into the corner so the 44px targets don't make the top row taller
.corner-actions {
    display: flex;
    gap: 2px;
    margin: -10px -10px -10px 0;
}

.btn-delete:hover {
    color: var(--danger-color);
}

.btn-confirm,
.btn-confirm:hover {
    color: $green;
}

.footer-open {
    justify-content: flex-end;
}

.library-card button:focus-visible,
.rename-input:focus-visible {
    outline: 2px solid var(--accent-text-color);
    outline-offset: 2px;
}
</style>
