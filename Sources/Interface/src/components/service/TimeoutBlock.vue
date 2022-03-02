<template>
  <div :class="$style.timeout">
    <p :class="$style.title">Вы ещё здесь?</p>
    <p :class="$style.info">До перехода на главную страницу<br><span :class="$style.time">{{ secondsString }}</span></p>
    <BaseButton
      @click="$emit('here')"
      :class="$style.button"
    >Я здесь</BaseButton>
  </div>
</template>

<script>
  import { secondsToMinutesSeconds, timeToString } from "@/helpers/utils";
  import BaseButton from "@/components/base/BaseButton";

  export default {
    name: "TimeoutBlock",
    components: {
      BaseButton,
    },
    props: {
      milliseconds: {
        type: Number,
        required: false,
        default: 60 * 1000,
      },
    },
    data() {
      return {
        localSeconds: this.milliseconds / 1000,
      }
    },
    computed: {
      stillHereTime() {
        const minutesStrings = ['минута', 'минуты', 'минут'];

        const minutesSeconds = secondsToMinutesSeconds(this.localSeconds);
        const minutes = minutesSeconds[0];
        const seconds = minutesSeconds[1];
        let visualMinutes;

        if (minutes) {
          visualMinutes = `<span id="timeout">${minutes}</span> ${timeToString(minutes, minutesStrings, 'ru')}`;
        } else {
          visualMinutes = '';
        }

        return `<br>${visualMinutes} <span id="timeout">${seconds}</span> `
      },
      secondsString() {
        const secondsStrings = ['секунда', 'секунды', 'секунд'];
        const minutesSeconds = secondsToMinutesSeconds(this.localSeconds);
        const seconds = minutesSeconds[1];

        return `${this.localSeconds} ${timeToString(seconds, secondsStrings, 'ru')}`
      },
    },
    created() {
      this.timer = setInterval(() => {
        this.localSeconds--;

        if (this.localSeconds <= 0) {
          clearInterval(this.timer);
          this.$emit('timeout');
        }
      }, 1000);
    }
  }
</script>

<style lang="scss" module>
  .timeout {
    padding: 10px 20px;
    border-radius: 10px;
    background: $ecMainLight;
    color: inherit;
    font-size: 1.2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 37vw;
    
    .title {
      margin-bottom: 40px;
      font-size: 1.8rem;
      font-weight: bold;
    }
    
    .info {
      margin-bottom: 40px;
      
      .time {
        margin-top: 5px;
        font-weight: bold;
      }
    }
    
    .button {
      width: 250px;
      padding: 2rem 0;
      color: white;
      background-color: $ecAccentLight;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.8rem;
      border-radius: 60px;
    }
  }
</style>
