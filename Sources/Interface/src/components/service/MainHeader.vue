<template>
  <div class="header">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "MainHeader"
  }
</script>

<style>
  .header {
    width: 100vw;
    min-height: 160px;

    display: flex;
  }
</style>
