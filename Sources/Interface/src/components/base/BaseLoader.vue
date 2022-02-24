<template>
  <div :class="$style.loader">
    <AnimatedSpinner :class="$style.spinner"/>
    <slot></slot>
  </div>
</template>

<script>
  import AnimatedSpinner from "@/components/svg/AnimatedSpinner";
  export default {
    name: "BaseLoader",
    components: {AnimatedSpinner}
  }
</script>

<style lang="scss" module>
  .loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.7rem;
    font-weight: bold;

    .spinner {
      margin: 2vh auto 4vh;
    }
  }
</style>
