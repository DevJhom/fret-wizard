<script setup lang="ts">
import { ref } from 'vue';
import MyGuitar from '@components/MyGuitar.vue';
import SideBar from '@components/SideBar.vue';
import RotateMessage from '@/components/RotateMessage.vue';

enum Theme {
  dark = "dark-theme",
  light = "light-theme"
}

const theme = ref(Theme.dark);
const isLandscape = ref(true);

isLandscape.value = window.matchMedia("(orientation: landscape)").matches;

const switchTheme = () => {
  theme.value = (theme.value == Theme.dark ? Theme.light : Theme.dark);
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
        <div class="switch-theme" @click="switchTheme()">
          🌙☀️
        </div>
        <MyGuitar/>
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
  position: absolute;
  top: 1rem;
  right: 2rem;
}
</style>
