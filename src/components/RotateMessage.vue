<script setup lang="ts">
</script>

<template>
  <div class="warning-message">
    <h2> Rotate Your Phone </h2>
    <h3> For Better Experience </h3>
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
