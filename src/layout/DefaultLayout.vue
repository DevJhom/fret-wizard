<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Theme } from '@data/constants';
import { fetchCurrentTheme, saveCurrentTheme } from '@/services/customizerService';
import { usePatternStore } from '@stores/usePatternStore';
import MainPage from '@/components/MainPage.vue';
import LibraryPage from '@components/LibraryPage.vue';
import SideBar from '@components/SideBar.vue';
import RotateMessage from '@/components/RotateMessage.vue';
import Moon from '@/assets/icons/Moon.vue';
import Sun from '@/assets/icons/Sun.vue';
import { useLibraryStore } from '@stores/useLibraryStore';
import type { LibraryCard } from '@stores/useLibraryStore';

const patternStore = usePatternStore();
const libraryStore = useLibraryStore();

const theme = ref(Theme.dark);
const currentView = ref<'main' | 'library'>('main');
const activeCardId = ref<string | null>(null);
const isLandscape = ref(true);
isLandscape.value = window.matchMedia("(orientation: landscape)").matches;

const getCurrentTheme = async () => {
  const data = await fetchCurrentTheme();
  if (data) {
    theme.value = data;
  }
}

const saveActiveCard = async () => {
  if (activeCardId.value) {
    await libraryStore.updateCardData(activeCardId.value, patternStore.currentFretboardData);
  }
}

const onLoadCard = async (card: LibraryCard) => {
  await saveActiveCard();
  activeCardId.value = card.id;
  patternStore.loadFromFretboardData(card.data);
  currentView.value = 'main';
}

const switchView = async (view: 'main' | 'library') => {
  if (currentView.value === 'main' && view === 'library') {
    await saveActiveCard();
  }
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
      <SideBar />
      <div class="content">
        <div class="top-bar">
          <span class="logo" @click="refreshPage()">
            FRETWIZARD
          </span>
          <div class="nav-tabs switch-radio">
            <label>
              <input type="radio" name="nav" value="main" :checked="currentView === 'main'" @change="switchView('main')">
                <div class="label px-2">Fretboard</div>
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
        <MainPage v-if="currentView === 'main'"/>
        <LibraryPage v-else-if="currentView === 'library'" @load-card="onLoadCard"/>
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
  color: $yellow;
  cursor: pointer;
}

.nav-tabs {
  display: flex;
  border: none;
}

.switch-theme {
  display: flex;
  position: absolute;
  top: 1rem;
  right: 2rem;
}

.theme-icon {
  padding-bottom: 3px;
}
</style>
