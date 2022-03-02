<template>
  <keyboard
    v-bind="$attrs"
    v-on="$listeners"
    :layouts="layout"
    :class="{bigKeyboard: layout === layoutData.numpadNoDecimal}"
  ></keyboard>
</template>

<script>
  import keyboard from 'vue-keyboard';
  import KeyboardLayouts from "@/helpers/KeyboardLayouts";
  
  export default {
    name: 'BaseKeyboard',
    components: { keyboard },
    data() {
      return {
        layoutData: KeyboardLayouts
      }
    },
    props: {
      layout: {
        type: [String, Array],
        required: false,
        default: KeyboardLayouts.qwertyRus,
        validator(val) {
          return typeof val === "string"
            || Array.isArray(val) && val.every(el => typeof el === 'string')
        },
      },
    },
  };
</script>

<style lang="scss">
  $modifier: 1.5;
  
  .bigKeyboard {
    .vue-keyboard-key {
      margin: 1rem;
      font-size: 2rem;
      width: #{55 * $modifier}px;
      height: #{55 * $modifier}px;
    }
  
    [data-action='clear'] {
      width: auto;
      padding: 0 1.6rem;
      font-size: 1.5rem;
    }
  }
  
  .vue-keyboard {
    width: auto;
  }
  
  .vue-keyboard-key {
    display: block;
    margin: 0.7rem;
    background-color: $ecMainLight;
    color: $ecAccentDark;
    box-shadow: $ecCardShadow;
    border-radius: 15px;
    font-size: 1.6rem;
    font-weight: bold;
    justify-self: center;
    width: #{48 * $modifier}px;
    height: #{42 * $modifier}px;
    
    &:hover {
      background-color: $ecMainLight;
      color: $ecAccentDark;
    }
    
    &:active {
      background-color: $ecAccentDark;
      color: $ecFontSecondary;
      box-shadow: none;
    }
  }

  .vue-keyboard-row {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  [data-action='clear'] {
    width: auto;
    padding: 0 1.2rem;
    font-size: 1.2rem;
    font-weight: normal;
    background-color: $ecMainDark;
    color: $ecMainLight;
    
    &:hover {
      background-color: $ecMainDark;
      color: $ecMainLight;
    }
    
    &:active {
      background-color: $ecAccentLight;
    }
  }

  [data-action='backspace'] {
    font-weight: normal;
    background-color: $ecMainDark;
    color: $ecMainLight;
  
    &:hover {
      background-color: $ecMainDark;
      color: $ecMainLight;
    }
    
    &:active {
      background-color: $ecAccentLight;
    }
  }

  [data-action='space'] {
    width: #{45 * $modifier * 4}px;
  }
</style>
