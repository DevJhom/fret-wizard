<script setup lang="ts">
import RotatePhone from '@/assets/icons/RotatePhone.vue';
</script>

<template>
  <div class="warning-message">
    <RotatePhone/>
    <h2 class="mt-4"> Rotate Your Phone </h2>
  </div>
</template>

<style scoped lang="scss">
.warning-message {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: $black;
  color: $yellow;
  z-index: 100;
}
</style>
