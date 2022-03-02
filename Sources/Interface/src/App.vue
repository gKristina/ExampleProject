<template>
  <div
    :id="$style.app"
    ref="app"
    @click="refreshTimeout"
    @keyup="handleKeyup"
    tabindex="0"
  >
    <div v-if="ui.skud" @click="clickSkud(1);" :class="[$style.skud, $style.top, $style.left]"></div>
    <div v-if="ui.skud" @click="clickSkud(2);" :class="[$style.skud, $style.top, $style.right]"></div>
    <div v-if="ui.skud" @click="clickSkud(3);" :class="[$style.skud, $style.bottom, $style.left]"></div>
    <div v-if="ui.skud" @click="clickSkud(4);" :class="[$style.skud, $style.bottom, $style.right]"></div>
    <SkudPage v-if="skud.authPage" @close="closeSkudPage"/>
    
    <MainHeader v-if="ui.header">
      <p :class="$style.debugWarning"
         @click="onClickDebugWarning"
         v-if="isDebugWarning"
      >Режим отладки</p>
      <portal-target name="header"></portal-target>
    </MainHeader>
    <MainContent v-if="ui.content">
      <component
        :is="page"
        @changePage="changePage($event)"
      ></component>
    </MainContent>
    <portal-target name="footer"></portal-target>
    <BaseModal
      v-if="timeout.modal.show"
      :allow-user-close="false"
      style="z-index: 100000"
    >
      <TimeoutBlock
        :milliseconds="timeoutTime"
        @timeout="executeTimeout"
        @here="stillHere"
      />
    </BaseModal>
    <BaseModal
      v-if="showPaymentInterrupt"
      :allow-user-close="false"
    >
      <BaseLoader>
        Прерываем оплату
      </BaseLoader>
    </BaseModal>
    <portal-target name="modal"></portal-target>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from 'vuex';
  import { log } from "@/helpers/log";
  import SkudPage from "@/components/pages/SkudPage";
  import MainHeader from "@/components/service/MainHeader";
  import MainContent from "@/components/service/MainContent";
  import MainFooter from "@/components/service/MainFooter";
  import IdleScreen from "@/components/pages/IdlePage";
  import { getSkudSequence, pingInterface, changeInterface, linkTo } from "@/helpers/externals";
  import BaseButton from "@/components/base/BaseButton";
  import TimeoutBlock from "@/components/service/TimeoutBlock";
  import BaseModal from "@/components/base/BaseModal";
  import { api } from '@/services/api/ApiFactory';
  
  export default {
    name: 'app',
    components: {
      BaseModal,
      TimeoutBlock,
      BaseButton,
      IdleScreen,
      MainFooter,
      MainContent,
      MainHeader,
      SkudPage
    },
    provide: function () {
      return {
        UI: this.ui,
        skud: {
          hide: this.hideSkud,
          show: this.showSkud,
        },
        globalTimeout: {
          start: this.startTimeout,
          refresh: this.refreshTimeout,
          stop: this.stopTimeout,
        },
        tt: this.tt,
        api: this.createApi()
      };
    },
    data() {
      return {
        skud: {
          sequence: '',
          password: '',
          timeout: null,
          authPage: false,
        },
        ui: {
          skud: false,
          header: true,
          content: true,
        },
        page: IdleScreen,
        timeout: {
          timer: null,
          prevent: false,
          modal: {
            timer: null,
            show: false,
          },
        },
        showPaymentInterrupt: false,
        hideDebugWarning: false,
      };
    },
    computed: {
      ...mapState({
        isMainPage: state => state.isMainPage,
        timeoutTime: state => state.settings.timeout,
        isPayment: state => Boolean(state.payment?.is),
      }),
      ...mapGetters({
        isDebug: 'settings/isDebug',
      }),
      isDebugWarning() {
        return this.isDebug && !this.hideDebugWarning
      }
    },
    methods: {
      ...mapActions({
        cancelCash: 'payment/cancelCash',
      }),
      async updateAppSettings() {
        return this.$store.dispatch('settings/updateAppSettings');
      },
      async createApi() {
        await this.updateAppSettings();
        api.createInstance();
        return api.instance;
      },
      clickSkud(num) {
        clearTimeout(this.skud.timeout);
        this.skud.sequence += num;
        
        if (this.skud.sequence === String(getSkudSequence())) {
          this.skud.sequence = '';
          this.ui.skud = false;
          this.skud.authPage = true;
        }
        
        this.skud.timeout = setTimeout(() => this.skud.sequence = '', 5 * 1000);
      },
      changePage(component) {
        if (component.__esModule) {
          component = component.default;
        }
        
        log.step(`Переход на страницу: ${component.name}`);
        this.page = component;
      },
      hideSkud() {
        this.ui.skud = false;
      },
      showSkud() {
        this.ui.skud = true;
      },
      closeSkudPage() {
        this.skud.authPage = false;
        this.ui.skud = true;
      },
      startTimeout() {
        log.info('Глобальный таймер запущен');
        this.timeout.prevent = false;
        this.refreshTimeout();
      },
      refreshTimeout() {
        if (!this.timeout.modal.show && !this.timeout.prevent) {
          log.info('Глобальный таймер обновлён');
          clearTimeout(this.timeout.timer);
          this.timeout.timer = setTimeout(() => {
            this.timeout.modal.show = true;
          }, this.timeoutTime);
        }
      },
      stopTimeout() {
        log.info('Глобальный таймер остановлен');
        clearTimeout(this.timeout.timer);
        this.timeout.prevent = true;
      },
      async executeTimeout() {
        this.timeout.modal.show = false;
        
        if (this.isPayment) {
          log.step('Таймаут на оплате');
          
          this.showPaymentInterrupt = true;
          const isCancelWithoutMoney = await this.cancelCash();
          this.showPaymentInterrupt = false;
          
          if (isCancelWithoutMoney) {
            this.changePage(IdleScreen);
          } else {
            // ничего не делаем
            // будет произведён переход на страницу финиша оплаты
          }
        } else {
          log.step('Переход на страницу ожидания по таймауту');
          this.changePage(IdleScreen);
        }
      },
      stillHere() {
        this.timeout.modal.show = false;
        this.refreshTimeout();
      },
      reloadPage() {
        console.log('reloadPage');
        location.reload();
      },
      onClickDebugWarning() {
        this.hideDebugWarning = true
        setTimeout(() => this.hideDebugWarning = false, 2000)
      },
      handleKeyup(e) {
        if (this.isDebug) {
          switch (e.keyCode) {
            case 65: // a
              // window.extHandleBarCode('2200000000026');
              break;
            case 90: // Z
            case 116: // F5
              location.reload();
              break;
            case 111: //Num /
              changeInterface(prompt('Название папки с интерфейсом (регистр не важен)', ''));
              linkTo('main.html');
              break;
          }
        }
      },
    },
    created() {
      try {
        log.step('╔══════════════════════════════════════════════════╗');
        log.step('║                       INIT                       ║');
        log.step('╚══════════════════════════════════════════════════╝');
        this.$nextTick(() => this.$refs.app.focus());
        if (this.isDebug) {
          this.stopTimeout();
        } else {
          this.startTimeout();
        }
        setInterval(pingInterface, 30 * 1000);
      } catch (e) {
        log.error(e);
      }
    },
  }
</script>

<style lang="scss" module>
  #app {
    font-family: Inter, sans-serif;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    position: relative;
  }
  
  .skud {
    position: absolute;
    width: 200px;
    height: 200px;
    //border: 1px solid red;
    z-index: 1000;
    
    &.top {
      top: 0;
    }
    
    &.bottom {
      bottom: 0;
    }
    
    &.right {
      right: 0;
    }
    
    &.left {
      left: 0;
    }
  }

  .debugWarning {
    position: absolute;
    right: 0;
    top: 0;
    text-transform: uppercase;
    font-size: 1.8rem;
    padding: 1.5rem 2.5rem;
    background-color: #af342f;
    color: #fff;
    opacity: 0.8;
    z-index: 999;
  }
</style>

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: Inter, sans-serif;
    user-select: none;
  }
  
  html {
    overflow: hidden;
    -ms-content-zooming: none;
    -ms-touch-action: pan-x pan-y;
  }
  
  body {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background-color: $ecBackground;
    background-position: 40px 20px, 0 0;
    background-repeat: no-repeat, repeat;
    
    /* defaults */
    font-size: 1.3rem;
    color: $ecFontDark;
  }
  
  @font-face {
    font-family: 'Inter';
    src: url('~@/assets/fonts/Inter/Inter-Medium.ttf') format('TrueType');
    font-weight: normal;
    font-style: normal;
  }
  
  @font-face {
    font-family: 'Inter';
    src: url('~@/assets/fonts/Inter/Inter-Bold.ttf') format('TrueType');
    font-weight: bold;
    font-style: normal;
  }

  @font-face {
    font-family: 'Inter';
    src: url('~@/assets/fonts/Inter/Inter-ExtraBold.ttf') format('TrueType');
    font-weight: 800;
    font-style: normal;
  }
  
  @font-face {
    font-family: 'PTSans';
    src: url('~@/assets/fonts/PTSans-Regular/PTSans-Regular.woff2') format('woff2');
    src: url('~@/assets/fonts/PTSans-Regular/PTSans-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
  
  /* globals */
  
  /* defaults */
  button {
    background-color: transparent;
    border-radius: 12px;
    font-size: inherit;
  }
  
  /* fixes */
  button {
    border: none;
    outline: none;
    padding: 0; // HACK: убирает анимацию нажатия у текста во всех остальных браузерах
    
    & > span { // HACK: убирает анимацию нажатия у текста в IE
      position: relative;
    }
    
    &:active,
    &:focus {
      outline: none;
    }
  }
</style>
