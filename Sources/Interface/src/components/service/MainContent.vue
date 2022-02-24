<template>
  <div class="content">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "MainContent"
  }
</script>

<style>
  .content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }
</style>
