<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Setup, Theme } from '@data/constants';
import { fetchCurrentTheme, saveCurrentTheme, fetchFretboards, saveFretboards, saveCurrentFretboard, flushPendingSaves } from '@/services/customizerService';
import { accountsEnabled } from '@services/apiConfig';
import AccountMenu from '@components/AccountMenu.vue';
import { useAuthStore } from '@stores/useAuthStore';
import LibraryPage from '@components/LibraryPage.vue';
import ChordProgressionPage from '@components/ChordProgressionPage.vue';
import FretboardPage from '@components/FretboardPage.vue';
import RotateMessage from '@/components/RotateMessage.vue';
import Moon from '@/assets/icons/Moon.vue';
import Sun from '@/assets/icons/Sun.vue';
import { useLibraryStore } from '@stores/useLibraryStore';
import type { LibraryCard } from '@stores/useLibraryStore';

const libraryStore = useLibraryStore();
const authStore = useAuthStore();
const showAccounts = accountsEnabled();

const theme = ref(Theme.dark);
type FretboardView = 'scale' | 'chord';
type View = FretboardView | 'progression' | 'library';

const setupForView: Record<FretboardView, Setup> = {
  scale: Setup.Scale,
  chord: Setup.Chord,
};

const viewForSetup: Record<Setup, FretboardView> = {
  [Setup.Scale]: 'scale',
  [Setup.Chord]: 'chord',
};

const currentView = ref<View>('scale');
const isLandscape = ref(true);
isLandscape.value = window.matchMedia("(orientation: landscape)").matches;

const getCurrentTheme = async () => {
  const data = await fetchCurrentTheme();
  if (data) {
    theme.value = data;
  }
}

const saveActiveCard = async () => {
  // Debounced API saves must land before the stack is read back.
  await flushPendingSaves();
  if (currentView.value !== 'scale' && currentView.value !== 'chord') return;

  const setup = setupForView[currentView.value];
  const activeCard = libraryStore.activeCard;
  if (activeCard && activeCard.setup === setup) {
    const fretboards = await fetchFretboards(setup);
    if (fretboards) {
      await libraryStore.updateCardFretboards(activeCard.id, fretboards);
    }
  }
}

const onLoadCard = async (card: LibraryCard) => {
  await saveActiveCard();
  libraryStore.activeCardId = card.id;
  await saveFretboards(card.setup, card.fretboards);
  await saveCurrentFretboard(card.setup, card.fretboards[0]);
  // The page about to mount reads the stack back, so send it now.
  await flushPendingSaves();
  currentView.value = viewForSetup[card.setup];
}

const switchView = async (view: View) => {
  await saveActiveCard();
  currentView.value = view;
}

const refreshPage = () => {
  window.location.reload();
};

window.matchMedia("(orientation: landscape)").addEventListener("change", (event) => {
  if (event.matches) {
    isLandscape.value = true;
  } else {
    isLandscape.value = false;
  }
});

// A new session means different data: forget the cards; the remounted pages reload.
watch(() => authStore.sessionVersion, () => {
  libraryStore.reset();
});

onMounted(async () => {
  await getCurrentTheme();
})
</script>

<template>
  <div :class="theme">
    <RotateMessage v-if="!isLandscape"/>
    <div v-else class="layout">
      <div class="content">
        <div class="top-bar">
          <span class="logo" @click="refreshPage()">
            FRETWIZARD
          </span>
          <div class="nav-tabs switch-radio">
            <label>
              <input type="radio" name="nav" value="scale" :checked="currentView === 'scale'" @change="switchView('scale')">
                <div class="label px-2">Scale</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="chord" :checked="currentView === 'chord'" @change="switchView('chord')">
                <div class="label px-2">Chord</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="progression" :checked="currentView === 'progression'" @change="switchView('progression')">
                <div class="label px-2">Chord Progression</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="library" :checked="currentView === 'library'" @change="switchView('library')">
                <div class="label px-2">Library</div>
              </input>
            </label>
          </div>
          <div class="top-bar-actions">
            <AccountMenu v-if="showAccounts"/>
            <div class="switch-theme switch-radio">
              <label>
                <input type="radio" name="theme" :value="Theme.dark" v-model="theme" @change="saveCurrentTheme(theme)">
                  <div class="label px-1"><Moon class="theme-icon"/></div>
                </input>
              </label>

              <label>
                <input type="radio" name="theme" :value="Theme.light" v-model="theme" @change="saveCurrentTheme(theme)">
                  <div class="label px-1"><Sun class="theme-icon"/></div>
                </input>
              </label>
            </div>
          </div>
        </div>
        <template v-if="authStore.status !== 'restoring'">
          <LibraryPage v-if="currentView === 'library'" :key="`library-${authStore.sessionVersion}`" @load-card="onLoadCard"/>
          <ChordProgressionPage v-else-if="currentView === 'progression'" :key="`progression-${authStore.sessionVersion}`"/>
          <FretboardPage v-else :key="`${currentView}-${authStore.sessionVersion}`" :setup="setupForView[currentView]"/>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  align-items: stretch;
  min-height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  text-align: start;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: var(--accent-text-color);
  cursor: pointer;
}

.nav-tabs {
  display: flex;
  border: none;

  .label {
    white-space: nowrap;
  }
}

.top-bar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  padding-right: 2rem;
}

.switch-theme {
  display: flex;
}

.theme-icon {
  padding-bottom: 3px;
}
</style>
