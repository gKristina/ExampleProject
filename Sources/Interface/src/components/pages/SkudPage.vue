<template>
  <div :class="$style.skud_auth">
    <label>
      <input
        :class="$style.input"
        type="password"
        v-model="password"
        maxlength="10"
      >
    </label>

    <table :class="$style.keyboard">
      <tr v-for="(row, key) in [0,1,2]" :key="key">
        <td v-for="(number, key) in [1 + 3 * row, 2 + 3 * row, 3 + 3 * row]" :key="key">
          <div
            :class="$style.button"
            @click="addNumber(number)"
          >
            <span :class="$style.text">{{ number }}</span>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div
            :class="$style.button"
            @click="password = ''"
          >
            <span :class="$style.text">С</span>
          </div>
        </td>
        <td>
          <div
            :class="$style.button"
            @click="addNumber(0)"
          >
            <span :class="$style.text">0</span>
          </div>
        </td>
        <td>
          <div
            :class="$style.button"
            @click="password = password.substring(0, password.length - 1)"
          >
            <img
              :class="$style.delete"
              src="@/assets/img/previous.png"
              alt="удалить"
            >
          </div>
        </td>
      </tr>
    </table>
    <portal to="footer">
      <MainFooter :class="$style.footer">
        <BaseButton back @click="$emit('close')">Назад</BaseButton>
        <BaseButton next @click="checkPassword()">Вперед</BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import { checkSkudPass } from "@/helpers/externals";
  import { log } from "@/helpers/log";
  import BaseButton from "@/components/base/BaseButton";
  import MainFooter from "@/components/service/MainFooter";

  export default {
    name: "SkudPage",
    components: {BaseButton, MainFooter},
    data() {
      return {
        password: '',
      }
    },
    methods: {
      addNumber(number) {
        if (this.password.length < 5) {
          this.password += number;
        }
      },
      checkPassword() {
        checkSkudPass(this.password);
        this.password = '';
      },
    },
    created() {
      log.step('Переход на страницу SKUD');
    }
  }
</script>

<style lang="scss" module>
  .skud_auth {
    position: absolute;
    left: 0;
    top: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10vh;
    background-color: $ecBackground;
    width: 100vw;
    height: 100vh;
    z-index: 1000;

    .input {
      text-align: center;
      font-size: 53px;
      font-weight: bold;
      color: $ecFontDark;
      box-shadow: $ecCardShadow;
      border: none;
      border-radius: 20px;
      width: 485px;
      max-width: 70vw;
      height: 90px;
      background-color: white;
      margin-bottom: 20px;
    }

    .keyboard {
      .button {
        width: 140px;
        max-width: 30vw;
        height: 120px;
        max-height: 20vh;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid transparent;
        border-radius: 30px;
        background-color: $ecMainLight;
        color: $ecFontDark;
        box-shadow: $ecCardShadow;
        padding-top: .5rem;
        margin: .8rem;
        
        &:active {
          box-shadow: none;
        }

        .text {
          font-size: 3.8rem;
          font-weight: bold;
          font-family: Inter, sans-serif;
          transform: scaleX(.9);
          height: auto;
        }

        .delete {
          height: 50%;
          transform: scaleY(0.7);
        }
      }
    }

    .control {
      display: flex;

      .spacer {
        width: 130px;
        max-width: 20vw;
      }

      .button {
        border-radius: 10px;
        padding: .8rem;
        background-color: rgba(255, 255, 255, .4);
        margin-top: .7rem;
        color: white;
        text-align: center;
        font-size: 45px;
      }
    }
  }
  
  .footer {
    z-index: 1000;
  }
</style>
