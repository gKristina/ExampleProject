<template>
  <div
    :class="$style.modal"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div @click="userHide" :class="$style.background"/>
    <div :class="$style.content">
      <slot></slot>
      <div
        v-if="allowUserClose"
        @click="userHide"
        :class="$style.closeButton"
      >
        ✖
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'BaseModal',
    props: {
      allowUserClose: {
        type: Boolean,
        required: false,
        default: true,
      }
    },
    methods: {
      hide() {
        this.$emit('hide-modal');
      },
      userHide() {
        if (this.allowUserClose) this.hide();
      },
    },
  };
</script>

<style lang="scss" module>
  .modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 10%;
    
    .background {
      position: absolute;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, .85);
      top: 0;
      left: 0;
      z-index: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .content {
      position: relative;
      display: flex;
      flex-direction: column;
      max-width: 60vw;
      background-color: $ecMainLight;
      padding: 40px;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      border-radius: 30px;
      
      .closeButton {
        position: absolute;
        width: 60px;
        height: 60px;
        z-index: 2;
        right: 1rem;
        top: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $ecMainLight;
        background-color: $ecMainDark;
        border-radius: 50%;
        font-size: 2rem;
      }
    }
  }
</style>
