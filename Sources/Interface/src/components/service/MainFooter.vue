<template>
  <div :class="$style.footer">
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: "MainFooter",
  }
</script>

<style lang="scss" module>
  .footer {
    width: 100vw;
    height: 170px;
    background-color: $ecMainDark;

    display: flex;
    position: relative;
  }
</style>
