<script setup lang="ts">
import MyGuitar from '@components/MyGuitar.vue'
import LeftNav from './components/SideBar.vue';
</script>

<template>
  <div class="d-flex">
    <LeftNav/>
    <div>
      <MyGuitar/>
    </div>
  </div>
</template>

<style scoped>

</style>
