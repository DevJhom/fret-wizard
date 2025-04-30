<script setup lang="ts">
import { ref } from 'vue';
import MyGuitar from '@components/MyGuitar.vue';
import SideBar from '@components/SideBar.vue';
import RotateMessage from '@/components/RotateMessage.vue';

const isLandscape = ref(true);

const refreshPage = () => {
 window.location.reload();
};

isLandscape.value = window.matchMedia("(orientation: landscape)").matches;

window.matchMedia("(orientation: landscape)").addEventListener("change", (event) => {
  if (event.matches) {
    isLandscape.value = true;
  } else {
    isLandscape.value = false;
  }
});
</script>

<template>
  <RotateMessage v-if="!isLandscape"/>
  <div v-else class="d-flex">
    <SideBar/>
    <div class="d-flex flex-column">
      <span class="logo" @click="refreshPage()">
        FRETWIZARD
      </span>
      <MyGuitar/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo {
  width: 100%;
  text-align: start;
  padding: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: $yellow;
  cursor: pointer;
}
</style>
