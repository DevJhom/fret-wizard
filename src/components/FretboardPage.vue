<script setup lang="ts">
import { ref, computed, watch, watchEffect, nextTick, onMounted, onBeforeUnmount } from 'vue';
import _ from 'lodash';
import Sortable from 'sortablejs';
import { Pattern, Setup, Tonality, degreeInPattern } from '@data/constants';
import { isQualityLocked } from '@data/patternNames';
import { rootName } from '@data/noteNames';
import { fetchCurrentFretboard, fetchFretboards, saveCurrentFretboard, saveFretboards } from '@/services/customizerService';
import { defaultDataFor, FretboardData } from '@/lib/fretboardData';
import { useLibraryStore } from '@stores/useLibraryStore';
import { cardStatus, cardWithUnsavedDraft, clearWorkspaceCardId, detachNotice, getWorkspaceCardId, pageTitle, resolveCardRoute, sameStack, setWorkspaceCardId } from '@/lib/cardSession';
import { getStackView, setStackView } from '@/lib/stackView';
import CardHeader from '@components/CardHeader.vue';
import DetachedBanner from '@components/DetachedBanner.vue';
import StackBar from '@components/StackBar.vue';
import StackRow from '@components/StackRow.vue';
import PatternBuilder from '@components/PatternBuilder.vue';
import FretboardEditor from '@components/FretboardEditor.vue';
import RotatePhone from '@/assets/icons/RotatePhone.vue';
import { rotateHintDismissed } from '@/lib/rotateHint';

type LabelMode = 'notes' | 'intervals';

interface SortableEvent {
    item: HTMLElement;
    from: HTMLElement;
    oldIndex?: number;
    newIndex?: number;
}

const props = defineProps<{ setup: Setup, cardId?: string | null }>();

const emit = defineEmits<{
    (e: 'open-card', cardId: string, replace: boolean): void
    (e: 'close-card', replace: boolean): void
    (e: 'open-library'): void
}>();

const libraryStore = useLibraryStore();

const stack = ref<FretboardData[]>([]);
const selectedIndex = ref<number>(0);
const labelMode = ref<LabelMode>('notes');
// Stack View lists every fretboard collapsed; the Default view shows the selected one in full
const isStackView = ref<boolean>(getStackView(props.setup));
// In Stack View, whether the selected fretboard is opened into the editor in place of its row
const isEditing = ref<boolean>(false);
const isLoaded = ref<boolean>(false);
const stackList = ref<HTMLElement | null>(null);
const cardHeader = ref<InstanceType<typeof CardHeader> | null>(null);
// The URL named a card the Library doesn't have; the header explains until dismissed
const isDetached = ref<boolean>(false);
// A card just created here, whose name field opens once the page shows it
const pendingRenameId = ref<string | null>(null);

const chord = computed(() => stack.value[selectedIndex.value]);

// The Library card named in the URL, once the library has loaded
const openCard = computed(() => props.cardId ? libraryStore.cards.find(c => c.id === props.cardId && c.setup === props.setup) : undefined);
const isDirty = computed(() => !!openCard.value && !sameStack(stack.value, openCard.value.fretboards));
const status = computed(() => cardStatus(!!openCard.value, isDirty.value));
// Until the library loads, a card URL has no card to name; hiding the header avoids a flash of "Draft"
const isCardPending = computed(() => !!props.cardId && !openCard.value);

const dismissRotateHint = () => {
    rotateHintDismissed.value = true;
}

// A root is named by its pattern and quality (C♯m but D♭), whatever spelling it was saved with
const respellRoot = (fretboard: FretboardData) => {
    fretboard.currentKey = rootName(fretboard.currentKey, fretboard.currentPattern, fretboard.currentTonality);
}

const updateChord = (patch: Partial<FretboardData>) => {
    Object.assign(stack.value[selectedIndex.value], patch);
    respellRoot(stack.value[selectedIndex.value]);
}

const allTones = (pattern: Pattern, tonality: Tonality) => degreeInPattern(pattern, tonality) ?? [];

const onChangeRoot = (key: string) => {
    updateChord({ currentKey: key });
}

const onChangeTonality = (tonality: Tonality) => {
    updateChord({ currentTonality: tonality, currentHighlightNotes: allTones(chord.value.currentPattern, tonality) });
}

const onChangePattern = (pattern: Pattern) => {
    const tonality = isQualityLocked(pattern) ? Tonality.MAJOR : chord.value.currentTonality;
    updateChord({ currentPattern: pattern, currentTonality: tonality, currentHighlightNotes: allTones(pattern, tonality) });
}

const selectChord = (index: number) => {
    selectedIndex.value = index;
}

// The editor card: the selected fretboard in the Default view, the one being edited in Stack View
const isExpanded = (index: number) => index == selectedIndex.value && (!isStackView.value || isEditing.value);

// A short fade-and-rise as the list swaps views; skipped for anyone who asks for reduced motion
const playViewSwitch = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stackList.value?.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
        { duration: 220, easing: 'ease-out' },
    );
}

const toggleStackView = () => {
    isStackView.value = !isStackView.value;
    isEditing.value = false;
    playViewSwitch();
}

// The editor is much taller than the row it replaces, so bring all of it on screen
const revealEditor = async () => {
    await nextTick();
    stackList.value?.querySelector('.fretboard-card')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Opens a Stack View row into the editor, in place
const editChord = (index: number) => {
    selectedIndex.value = index;
    isEditing.value = true;
    revealEditor();
}

const finishEditing = () => {
    isEditing.value = false;
}

// A new fretboard starts as a copy, so Stack View opens it for editing straight away
const addChord = () => {
    stack.value.push(_.cloneDeep(chord.value));
    selectedIndex.value = stack.value.length - 1;
    if (isStackView.value) {
        isEditing.value = true;
        revealEditor();
    }
}

// A tab's × or a Stack View row can remove any fretboard, so the selection follows the one it was on
const removeChord = (index: number) => {
    const selected = stack.value[selectedIndex.value];
    stack.value.splice(index, 1);
    const kept = stack.value.indexOf(selected);
    if (kept > -1) {
        selectedIndex.value = kept;
        return;
    }
    // The selected fretboard itself was removed: fall back to its neighbor, with nothing left open
    selectedIndex.value = Math.min(index, stack.value.length - 1);
    isEditing.value = false;
}

const reorderChords = (oldIndex: number, newIndex: number) => {
    const selected = stack.value[selectedIndex.value];
    const [moved] = stack.value.splice(oldIndex, 1);
    stack.value.splice(newIndex, 0, moved);
    selectedIndex.value = stack.value.indexOf(selected);
}

const resetChord = () => {
    stack.value[selectedIndex.value] = defaultDataFor(props.setup);
}

const restoreElementPosition = (list: HTMLElement, item: HTMLElement, index: number) => {
    item.remove();
    const next = list.children[index];
    if (next) {
        list.insertBefore(item, next);
    } else {
        list.children[index - 1].after(item);
    }
}

const saveCard = async () => {
    if (openCard.value) {
        await libraryStore.updateCardFretboards(openCard.value.id, stack.value);
    } else {
        await saveAsNewCard();
    }
}

const saveAsNewCard = async () => {
    await libraryStore.ensureLoaded();
    const card = await libraryStore.createCard(`Sheet ${libraryStore.cards.length + 1}`, props.setup, stack.value);
    if (!card) return;
    isDetached.value = false;
    pendingRenameId.value = card.id;
    setWorkspaceCardId(props.setup, card.id);
    emit('open-card', card.id, false);
}

const renameCard = (name: string) => {
    if (openCard.value) libraryStore.renameCard(openCard.value.id, name);
}

// Unlinks the card and starts over from one default fretboard; Back reopens the card
const closeCard = () => {
    if (isDirty.value && !window.confirm(`"${openCard.value!.name}" has unsaved changes. Discard them and close it?`)) return;
    clearWorkspaceCardId(props.setup);
    stack.value = [defaultDataFor(props.setup)];
    selectedIndex.value = 0;
    isEditing.value = false;
    emit('close-card', false);
}

// Brings the page in line with the card named in the URL
const attachCard = async (cardId: string | null | undefined) => {
    if (!cardId) return;
    await libraryStore.ensureLoaded();
    const workspaceCardId = getWorkspaceCardId(props.setup);
    const action = resolveCardRoute(cardId, props.setup, libraryStore.cards, workspaceCardId);
    isDetached.value = detachNotice(action);
    if (action === 'detach') {
        if (workspaceCardId === cardId) clearWorkspaceCardId(props.setup);
        emit('close-card', true);
        return;
    }
    if (action === 'keep') return;

    const card = libraryStore.cards.find(c => c.id === cardId)!;
    const unsaved = cardWithUnsavedDraft(workspaceCardId, cardId, stack.value, libraryStore.cards);
    if (unsaved && !window.confirm(`"${unsaved.name}" has unsaved changes. Discard them and open "${card.name}"?`)) {
        emit('open-card', unsaved.id, true);
        return;
    }

    stack.value = card.fretboards.length
        ? _.cloneDeep(card.fretboards).map(fretboard => ({ ...fretboard, currentSetup: props.setup }))
        : [defaultDataFor(props.setup)];
    stack.value.forEach(respellRoot);
    selectedIndex.value = 0;
    isEditing.value = false;
    setWorkspaceCardId(props.setup, cardId);
}

const loadStack = async () => {
    const saved = await fetchFretboards(props.setup);
    if (saved && saved.length) {
        stack.value = saved;
    } else {
        stack.value = [(await fetchCurrentFretboard(props.setup)) ?? defaultDataFor(props.setup)];
    }
    stack.value.forEach(item => item.currentSetup = props.setup);
    stack.value.forEach(respellRoot);
    isLoaded.value = true;
}

watch([stack, selectedIndex], () => {
    if (!isLoaded.value) return;
    saveFretboards(props.setup, stack.value);
    saveCurrentFretboard(props.setup, chord.value);
}, { deep: true });

watch(isStackView, value => setStackView(props.setup, value));

// A card just saved here asks for a name as soon as the header shows it
watch(() => openCard.value?.id, id => {
    if (!id || id !== pendingRenameId.value) return;
    pendingRenameId.value = null;
    nextTick(() => cardHeader.value?.startRename());
});

watchEffect(() => {
    document.title = pageTitle(props.setup === Setup.Scale ? 'Scale' : 'Chord', openCard.value?.name, status.value);
});

onBeforeUnmount(() => {
    document.title = 'FretWizard';
});

onMounted(async () => {
    await loadStack();

    // Stack View rows are dragged by their handle; the editor card has none, so it stays put
    await nextTick();
    if (stackList.value) {
        Sortable.create(stackList.value, {
            animation: 150,
            handle: '.drag-handle',
            onUpdate(evt: SortableEvent) {
                const { item, from, oldIndex, newIndex } = evt;
                if (oldIndex === undefined || newIndex === undefined) return;
                restoreElementPosition(from, item, oldIndex);
                reorderChords(oldIndex, newIndex);
            },
        });
    }

    await attachCard(props.cardId);
})

// Back/Forward between cards, or a card just saved, changes the id without remounting the page
watch(() => props.cardId, cardId => attachCard(cardId));
</script>

<template>
    <div v-if="chord" class="fretboard-page">
        <div v-if="!rotateHintDismissed" class="rotate-hint">
            <RotatePhone class="rotate-icon"/>
            <span>Rotate your phone for better viewing experience</span>
            <button type="button" class="rotate-hint-close" aria-label="Dismiss" @click="dismissRotateHint">×</button>
        </div>

        <!-- The stack tabs sit on the card like folder tabs -->
        <div class="stack-folder">
            <DetachedBanner v-if="isDetached" class="detached-row" @save-as-new="saveAsNewCard" @dismiss="isDetached = false"/>
            <StackBar
                :chords="stack"
                :selected-index="selectedIndex"
                :setup="setup"
                :card-name="openCard?.name"
                :is-dirty="isDirty"
                :is-stack-view="isStackView"
                @select="selectChord"
                @add="addChord"
                @remove="removeChord"
                @reorder="reorderChords"
                @save="saveCard"
                @save-as-new="saveAsNewCard"
                @toggle-stack-view="toggleStackView"
            >
                <!-- A draft has no card to name -->
                <template v-if="openCard || isCardPending" #identity>
                    <CardHeader
                        ref="cardHeader"
                        :class="{ 'is-pending': isCardPending }"
                        :card-name="openCard?.name"
                        @rename="renameCard"
                        @close="closeCard"
                        @open-library="emit('open-library')"
                    />
                </template>
            </StackBar>

            <!-- One slot per fretboard. The Default view fills only the selected one, with the editor.
                 Stack View fills them all: collapsed rows, and the editor in place of the row being edited -->
            <div ref="stackList" class="stack-list" :class="{ 'is-stack-view': isStackView }">
                <template v-for="(item, index) in stack" :key="index">
                    <FretboardEditor
                        v-if="isExpanded(index)"
                        v-model:label-mode="labelMode"
                        class="page-card"
                        :chord="chord"
                        :setup="setup"
                        :removable="stack.length > 1"
                        :collapsible="isStackView"
                        @update="updateChord"
                        @reset="resetChord"
                        @remove="removeChord(selectedIndex)"
                        @done="finishEditing"
                    >
                        <template #builder>
                            <PatternBuilder
                                :chord="chord"
                                :setup="setup"
                                @change-root="onChangeRoot"
                                @change-tonality="onChangeTonality"
                                @change-pattern="onChangePattern"
                            />
                        </template>
                    </FretboardEditor>
                    <StackRow
                        v-else-if="isStackView"
                        :chord="item"
                        :setup="setup"
                        :label-mode="labelMode"
                        :removable="stack.length > 1"
                        @edit="editChord(index)"
                        @remove="removeChord(index)"
                    />
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.fretboard-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    padding: 1rem 2rem 3rem;
}

// Stack tabs and the card, with no gap so the selected tab joins the card
.stack-folder {
    display: flex;
    flex-direction: column;
}

// The banner sits clear of the tabs; only the tabs join the card
.detached-row {
    margin-bottom: 0.75rem;
}

// Keeps its height so the stack doesn't jump when the card arrives
.is-pending {
    visibility: hidden;
}

// The first tab sits on the top-left corner, so that corner is square
.page-card {
    border-radius: 0 14px 14px 14px;
    background-color: var(--fretboard-background-color);
    box-shadow: var(--fretboard-shadow);
}

.stack-list {
    display: flex;
    flex-direction: column;
}

// Stack View: every fretboard, one above the other, clear of the bar
.stack-list.is-stack-view {
    gap: 0.75rem;
    margin-top: 0.75rem;
}

// No tab to join in Stack View; the outline marks the fretboard being edited
.is-stack-view .page-card {
    border-radius: 14px;
    box-shadow: 0 0 0 2px var(--accent-text-color);
}

.rotate-hint {
    display: none;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    border: 2px dashed var(--card-border-color);
    border-radius: 12px;
    font-size: 0.85rem;
    text-align: start;
    color: $gray-1;
}

.rotate-icon {
    flex: none;
    width: 20px;
    height: 20px;
}

.rotate-hint-close {
    flex: none;
    width: 36px;
    height: 36px;
    margin-left: auto;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;

    &:hover {
        color: var(--accent-text-color);
    }

    &:focus-visible {
        outline: 2px solid $yellow;
    }
}

@media (max-width: $phone) {
    .fretboard-page {
        padding: 0.75rem 1rem 2rem;
    }
}

@media (max-width: $phone) and (orientation: portrait) {
    .rotate-hint {
        display: flex;
    }
}
</style>
