<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { Setup, Theme } from '@data/constants';
import { fetchCurrentTheme, saveCurrentTheme, flushPendingSaves } from '@/services/customizerService';
import { accountsEnabled } from '@services/apiConfig';
import AccountMenu from '@components/AccountMenu.vue';
import { useAuthStore } from '@stores/useAuthStore';
import LibraryPage from '@components/LibraryPage.vue';
import ChordProgressionPage from '@components/ChordProgressionPage.vue';
import FretboardPage from '@components/FretboardPage.vue';
import Moon from '@/assets/icons/Moon.vue';
import Sun from '@/assets/icons/Sun.vue';
import Menu from '@/assets/icons/Menu.vue';
import { useLibraryStore } from '@stores/useLibraryStore';
import type { LibraryCard } from '@stores/useLibraryStore';
import { isFretboardView, pathForView, routeFromPath } from '@/lib/pageRoute';
import { getWorkspaceCardId } from '@/lib/cardSession';
import type { FretboardView, View } from '@/lib/pageRoute';

const libraryStore = useLibraryStore();
const authStore = useAuthStore();
const showAccounts = accountsEnabled();

const theme = ref(Theme.dark);

const setupForView: Record<FretboardView, Setup> = {
  scale: Setup.Scale,
  chord: Setup.Chord,
};

const viewForSetup: Record<Setup, FretboardView> = {
  [Setup.Scale]: 'scale',
  [Setup.Chord]: 'chord',
};

// The page and, on Scale/Chord, the open Library card live in the URL path so a refresh reopens them
const initialRoute = routeFromPath(window.location.pathname);
const currentView = ref<View>(initialRoute.view);
const currentCardId = ref<string | null>(initialRoute.cardId);
// Phone-only sidebar holding the page nav
const isMenuOpen = ref(false);

const getCurrentTheme = async () => {
  const data = await fetchCurrentTheme();
  if (data) {
    theme.value = data;
  }
}

// Every page or card switch adds a history entry, unless it corrects the current one
const navigate = async (view: View, cardId: string | null = null, replace = false) => {
  isMenuOpen.value = false;
  // Debounced API saves must land before the next page reads its stack back.
  await flushPendingSaves();
  currentView.value = view;
  currentCardId.value = isFretboardView(view) ? cardId : null;
  const path = pathForView(view, currentCardId.value);
  if (window.location.pathname === path) return;
  if (replace) {
    history.replaceState(history.state, '', path);
  } else {
    history.pushState(null, '', path);
  }
}

// Scale and Chord tabs return to the card that page was last working on
const switchView = (view: View) => navigate(view, isFretboardView(view) ? getWorkspaceCardId(setupForView[view]) : null);

const onLoadCard = (card: LibraryCard) => navigate(viewForSetup[card.setup], card.id);

const onOpenCard = (cardId: string, replace: boolean) => navigate(currentView.value, cardId, replace);

const onCloseCard = (replace: boolean) => navigate(currentView.value, null, replace);

const closeMenuOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isMenuOpen.value = false;
}

const refreshPage = () => {
  window.location.reload();
};

// Rewrites the app root or an unknown path without adding a history entry
const replacePath = () => {
  const path = pathForView(currentView.value, currentCardId.value);
  if (window.location.pathname !== path) history.replaceState(history.state, '', path);
}

// Back/Forward follow the URL without adding history
const onPopState = async () => {
  const route = routeFromPath(window.location.pathname);
  await flushPendingSaves();
  currentView.value = route.view;
  currentCardId.value = route.cardId;
  replacePath();
}

// A new session means different data: forget the cards; the remounted pages reload.
watch(() => authStore.sessionVersion, () => {
  libraryStore.reset();
});

onMounted(async () => {
  replacePath();
  window.addEventListener('keydown', closeMenuOnEscape);
  window.addEventListener('popstate', onPopState);
  await getCurrentTheme();
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeMenuOnEscape);
  window.removeEventListener('popstate', onPopState);
})
</script>

<template>
  <div :class="theme">
    <div class="layout">
      <div class="content">
        <div class="top-bar">
          <button
            type="button"
            class="menu-button"
            aria-label="Open menu"
            aria-controls="page-nav"
            :aria-expanded="isMenuOpen"
            @click="isMenuOpen = true"
          >
            <Menu/>
          </button>
          <span class="logo" @click="refreshPage()">
            Fret<span class="logo-accent">Wizard</span>
          </span>
          <div class="menu-backdrop" :class="{ 'is-open': isMenuOpen }" @click="isMenuOpen = false"></div>
          <nav id="page-nav" class="nav-tabs switch-radio" :class="{ 'is-open': isMenuOpen }" aria-label="Pages">
            <label>
              <input type="radio" name="nav" value="scale" :checked="currentView === 'scale'" @change="switchView('scale')">
                <div class="label" data-text="Scale">Scale</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="chord" :checked="currentView === 'chord'" @change="switchView('chord')">
                <div class="label" data-text="Chord">Chord</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="progression" :checked="currentView === 'progression'" @change="switchView('progression')">
                <div class="label" data-text="Chord Progression">Chord Progression</div>
              </input>
            </label>
            <label>
              <input type="radio" name="nav" value="library" :checked="currentView === 'library'" @change="switchView('library')">
                <div class="label" data-text="Library">Library</div>
              </input>
            </label>
          </nav>
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
          <FretboardPage v-else :key="`${currentView}-${authStore.sessionVersion}`" :setup="setupForView[currentView]" :card-id="currentCardId" @open-card="onOpenCard" @close-card="onCloseCard"/>
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
  border-bottom: 1px solid var(--card-border-color);
}

.logo {
  text-align: start;
  padding: 1rem;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  cursor: pointer;
}

// "Fret" takes the theme's text color; "Wizard" the accent
.logo-accent {
  font-size: inherit;
  color: var(--accent-text-color);
}

// Separate rounded tabs: muted until hovered, yellow when active
.nav-tabs {
  display: flex;
  gap: 4px;
  border: none;

  label,
  label:first-child,
  label:last-child {
    width: auto;
    padding: 0;
    border-radius: 8px;
    background: none;
  }

  .label {
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
    color: var(--muted-text-color);
    font-weight: 500;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease;

    // Invisible bold copy reserves the bold width, so tabs don't shift when the active one changes
    &::after {
      content: attr(data-text) / "";
      display: block;
      height: 0;
      overflow: hidden;
      visibility: hidden;
      font-weight: 600;
    }
  }

  label:hover .label {
    background-color: var(--option-background-color);
    color: inherit;
  }

  input:checked + .label {
    background-color: $yellow;
    color: $black;
    font-weight: 600;
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

.menu-button,
.menu-backdrop {
  display: none;
}

// Phones: the page nav becomes a sidebar opened from the menu button
@media (max-width: $phone) {
  .top-bar {
    gap: 0;
  }

  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-left: 0.5rem;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: none;
    color: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid $yellow;
    }
  }

  .logo {
    padding-left: 0.25rem;
    font-size: 1.2rem;
  }

  .menu-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 1040;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;

    &.is-open {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .nav-tabs {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1050;
    flex-direction: column;
    gap: 0.25rem;
    width: min(260px, 80vw);
    padding: 1rem 0.75rem;
    background-color: var(--card-background-color);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
    transform: translateX(-100%);
    // Hidden drawer is also removed from the tab order
    visibility: hidden;
    transition: transform 0.2s ease, visibility 0s linear 0.2s;

    &.is-open {
      transform: none;
      visibility: visible;
      transition: transform 0.2s ease;
    }

    label,
    label:first-child,
    label:last-child {
      width: 100%;
      padding: 0;
      border-radius: 8px;
      background: none;
    }

    .label {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-align: start;
      font-size: 1rem;
    }
  }

  .top-bar-actions {
    padding-right: 1rem;
  }
}
</style>
