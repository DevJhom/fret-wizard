<script setup lang="ts">
import MyGuitar from '@components/MyGuitar.vue';
import SideBar from '@components/SideBar.vue';

const refreshPage = () => {
 window.location.reload();
}
</script>

<template>
  <div class="d-flex">
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
