<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Setup, Theme } from '@data/constants';
import { fetchCurrentTheme, saveCurrentTheme, fetchFretboards, saveFretboards, saveCurrentFretboard } from '@/services/customizerService';
import LibraryPage from '@components/LibraryPage.vue';
import ChordProgressionPage from '@components/ChordProgressionPage.vue';
import FretboardPage from '@components/FretboardPage.vue';
import RotateMessage from '@/components/RotateMessage.vue';
import Moon from '@/assets/icons/Moon.vue';
import Sun from '@/assets/icons/Sun.vue';
import { useLibraryStore } from '@stores/useLibraryStore';
import type { LibraryCard } from '@stores/useLibraryStore';

const libraryStore = useLibraryStore();

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
        <LibraryPage v-if="currentView === 'library'" @load-card="onLoadCard"/>
        <ChordProgressionPage v-else-if="currentView === 'progression'"/>
        <FretboardPage v-else :key="currentView" :setup="setupForView[currentView]"/>
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
  border: none;

  .label {
    white-space: nowrap;
  }
}

.switch-theme {
  position: absolute;
  top: 1rem;
  right: 2rem;
}

.theme-icon {
  padding-bottom: 3px;
}
</style>
