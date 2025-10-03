<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Theme } from '@/components/data/constants';
import { fetchCurrentTheme, saveCurrentTheme } from '@/services/customizerService';
import MainPage from '@/components/MainPage.vue';
import SideBar from '@components/SideBar.vue';
import RotateMessage from '@/components/RotateMessage.vue';
import Moon from '@/assets/icons/Moon.vue';
import Sun from '@/assets/icons/Sun.vue';

const theme = ref(Theme.dark);
const isLandscape = ref(true);
isLandscape.value = window.matchMedia("(orientation: landscape)").matches;

const getCurrentTheme = async () => {
  const data = await fetchCurrentTheme();
  if (data) {
    theme.value = data;
  }
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
      <SideBar/>
      <div class="content">
        <span class="logo" @click="refreshPage()">
          FRETWIZARD
        </span>
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
        <MainPage/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  align-items: stretch;
}

.content {
  display: flex;
  flex-direction: column;
}

.logo {
  width: 100%;
  text-align: start;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: $yellow;
  cursor: pointer;
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
