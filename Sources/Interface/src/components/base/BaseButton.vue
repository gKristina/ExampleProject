<template>
  <button
    :class="[
      $style.button,
      {
        [$style.active]: $attrs.active,
        [$style.back]: $attrs.hasOwnProperty('back'),
        [$style.main]: $attrs.hasOwnProperty('main'),
        [$style.next]: $attrs.hasOwnProperty('next'),
        [$style.card]: $attrs.hasOwnProperty('card'),
      }
    ]"
    v-bind="$attrs"
    v-on="listeners"
  >
    <span>
      <slot></slot>
    </span>
  </button>
</template>

<script>
  export default {
    name: "BaseButton",
    computed: {
      listeners() {
        return Object.assign(
          {},
          this.$listeners,
          {
            input: event => {
              this.$emit('input', event.target.value);
            },
          },
        );
      },
    },
  }
</script>

<style lang="scss" module>
  %footer_button {
    width: 313px;
    height: 115px;
    position: absolute;
    top: 50%;
  }
  
  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    font-size: 2.2rem;
    font-weight: bold;
    border-radius: 60px;
    color: $ecMainLight;
    background-color: transparent;
  
    $footerSideOffset: 60px;
  
    &.card {
      color: black;
      box-shadow: $ecCardShadow;
      border-radius: 30px;
      font-size: 2rem;
      background-color: #fff;
    }
    
    &.back {
      @extend %footer_button;
      
      transform: translateY(-50%);
      left: $footerSideOffset;
  
      border: 1px solid $ecMainLight;
    }
    
    &.main {
      @extend %footer_button;
      
      left: 50%;
      transform: translate(-50%, -50%);
  
      border: 1px solid $ecMainLight;
    }
    
    &.next {
      @extend %footer_button;
      
      transform: translateY(-50%);
      right: $footerSideOffset;
  
      color: $ecMainLight;
      background-color: $ecAccentDark;
    }
  
    &.active {
      background-color: $ecAccentLight;
      color: $ecMainLight;
    }
  }
</style>
