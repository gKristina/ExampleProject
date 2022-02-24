<template>
  <div :class="$style.payment">
    <portal to="header">
      <HeaderContent
        :step="setStepText"
        :class="$style.headerContent"
        icon-color="light"
      />
    </portal>
    <div
      :class="$style.contentWrapper"
      v-if="type === PAYMENT.TYPE.CASH && !showBackFromPayment"
    >
      <div :class="[$style.typeImage, $style.imageCash]"></div>
      <h2 :class="$style.directive">
        Внесите сумму по одной купюре
      </h2>
      <div :class="$style.infoWrapper">
        <table :class="$style.info">
          <tr>
            <td>Осталось внести:</td>
            <td :class="$style.text_right_cash">{{ remainingSum.toLocaleString('ru-RU') }} ₽</td>
          </tr>
          <tr>
            <td>Внесено:</td>
            <td :class="$style.text_right_cash">{{ inputSum.toLocaleString('ru-RU') }} ₽</td>
          </tr>
          <tr>
            <td>Сдача:</td>
            <td :class="$style.text_right_cash">{{ changeSum.toLocaleString('ru-RU') }} ₽</td>
          </tr>
        </table>
      </div>
    </div>
    <div
      :class="$style.contentWrapper"
      v-if="type === PAYMENT.TYPE.CARD && !showBackFromPayment"
    >
      <div :class="[$style.typeImage, $style.imageCard]"></div>
      <h2 :class="$style.directive">
        Вставьте или приложите карту
      </h2>
      <div :class="$style.infoWrapper">
        <table :class="$style.info">
          <tr>
            <td>Сумма к оплате:</td>
            <td :class="$style.text_right_card">{{ remainingSum.toLocaleString('ru-RU') }} ₽</td>
          </tr>
          <tr>
            <td :class="$style.text_left">На совершение операции осталось:</td>
            <td :class="$style.text_right_card">{{ timeRemain }}</td>
          </tr>
        </table>
        
      </div>
    </div>
    <div
      v-if="showBackFromPayment"
      :class="$style.contentWrapper"
    >
      <div :class="[$style.typeImage, $style.spinnerImage]">
        <AnimatedSpinner/>
      </div>
      <p :class="[$style.directive, $style.fromPaymentText]">
        Возврат к платежу...
      </p>
    </div>
    <portal to="modal">
      <BaseModal
        v-if="showLoader"
        :allow-user-close="false"
      >
        <BaseLoader>
          {{ paymentProcessMessage }}
        </BaseLoader>
      </BaseModal>
      <BaseModal
        :allow-user-close="false"
        v-if="showInterruptModal && type === PAYMENT.TYPE.CARD"
      >
        <div :class="$style.modal">
          <p :class="$style.title">Желаете повторить операцию?</p>
          <div :class="$style.buttons">
            <BaseButton
              :class="$style.button"
              @click="cancelCard"
            >Отменить
            </BaseButton>
            <BaseButton
              :class="[$style.button, $style.continue]"
              @click="continueCardPay"
            >Повторить
            </BaseButton>
          </div>
        </div>
      </BaseModal>
      <BaseModal
        v-if="showInterruptModal && type === PAYMENT.TYPE.CASH"
        :allow-user-close="false"
      >
        <div :class="$style.modal">
          <p :class="$style.title">Вы действительно хотите<br>отказаться от платежа?</p>
          <div :class="$style.buttons">
            <BaseButton
              :class="$style.button"
              @click="interruptCash"
            >Прервать
            </BaseButton>
            <BaseButton
              :class="[$style.button, $style.continue]"
              @click="showInterruptModal = false"
            >Продолжить
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </portal>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          v-if="isButtonVisible.back && !showBackFromPayment"
          @click="showInterruptModal = true"
        >
          {{ backButtonText }}
        </BaseButton>
        <BaseButton
          next
          :active="true"
          v-if="isButtonVisible.next && !showBackFromPayment"
          @click="confirmPayment"
        >
          Оплатить
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from "vuex";
  import { PAYMENT } from "@/helpers/constants/payment";
  import { log } from "@/helpers/log";
  import { secondsToMinutesSeconds } from "@/helpers/utils";
  import { getPinpadTimeout } from "@/helpers/externals";
  import BaseModal from "@/components/base/BaseModal";
  import BaseButton from "@/components/base/BaseButton";
  import BaseLoader from "@/components/base/BaseLoader";
  import MainFooter from "@/components/service/MainFooter";
  import { dino } from "@/helpers/emitters/dino";
  import { TAX_GROUP } from "@/helpers/constants/taxgroup";
  import HeaderContent from "@/components/pages/HeaderContent";
  import AnimatedSpinner from "@/components/svg/AnimatedSpinner";
  
  export default {
    name: "PaymentPage",
    components: {
      AnimatedSpinner,
      HeaderContent,
      MainFooter,
      BaseButton,
      BaseModal,
      BaseLoader,
    },
    inject: {
      globalTimeout: 'globalTimeout',
    },
    data() {
      return {
        PAYMENT,
        timer: null,
        timeoutSeconds: null,
        showInterruptModal: false,
        showLoader: false,
        showBackFromPayment: false,
        paymentProcessMessage: 'Идёт проведение платежа...',
        paymentParams: {}
      }
    },
    computed: {
      ...mapState('payment', {
        type: state => state.type,
        inputSum: state => state.sum.input,
        totalSum: state => state.sum.total,
        isInfinite: state => state.infinite,
        isPinpadDone: state => state.pinpadDone,
        isFinished: state => state.finished,
        isSuccess: state => state.success,
      }),
      ...mapState({
        allowPartialCash: state => state.settings.payment.allowPartial.cash,
      }),
      ...mapGetters('payment', {
        remainingSum: 'remainingSum',
        changeSum: 'changeSum',
      }),
      timeRemain() {
        const minutesSeconds = secondsToMinutesSeconds(this.timeoutSeconds);
        const minutes = minutesSeconds[0];
        const seconds = minutesSeconds[1];
        
        const data = {
          minutes: {
            value: minutes,
            units: 'мин.'
          },
          seconds: {
            value: seconds,
            units: 'сек.'
          },
        };
        const strMins = minutes ? `${data.minutes.value} ${data.minutes.units} ` : '';
        return `${strMins}${data.seconds.value} ${data.seconds.units}`;
      },
      backButtonText() {
        return this.inputSum > 0 ? 'Отказаться' : 'Назад';
      },
      isButtonVisible() {
        let back = true;
        let next = true;
  
        if (this.type === PAYMENT.TYPE.CASH) {
          back = true;
          next = false;
    
          if (this.isInfinite) {
            if (this.inputSum > 0) {
              back = false;
              next = true;
            }
          } else if (this.inputSum >= this.totalSum) {
            back = false;
            next = true;
          } else if (this.allowPartialCash) {
            if (this.inputSum > 0) {
              next = true;
            }
          }
        }
  
        if (this.type === PAYMENT.TYPE.CARD) {
          back = false;
          next = false;
        }
  
        return {
          back,
          next,
        }
      },
      setStepText() {
        if (this.type === PAYMENT.TYPE.CASH) {
          return 'Оплата наличными'
        } else {
          return 'Оплата картой'
        }
      }
    },
    methods: {
      ...mapActions('payment', {
        startPayment: 'start',
        interruptPayment: 'interrupt',
        finalizePayment: 'finalize',
        confirmCash: 'confirmCash',
        cancelCash: 'cancelCash',
        setGoodsList: 'setGoodsList',
        debugAddInputSum: 'debugAddInputSum',
      }),
      start(params) {
        log.step('Запускаем оплату');
        
        if (this.type === PAYMENT.TYPE.CARD) {
          this.timeoutSeconds = getPinpadTimeout() / 1000;
          
          const decreaseSeconds = setInterval(() => this.timeoutSeconds--, 1000);
          const watcher = this.$watch(
            () => !(this.timeoutSeconds <= 0 || this.isPinpadDone),
            newVal => {
              if (!newVal) {
                clearInterval(decreaseSeconds);
                if (!this.isPinpadDone) {
                  this.interruptPayment('Таймаут');
                }
                
                if (!this.isSuccess) {
                  this.showInterruptModal = true;
                }
                
                watcher();
              }
            }
          );
        }
        
        this.startPayment(params)
          .then(
            () => {
            },
            e => {
              console.warn(e);
              log.info('Отказ проведения платежа');
            }
          );
      },
      confirmPayment() {
        log.step('Вызов успешного платежа с наличной оплаты');
        this.globalTimeout.stop();
        
        this.showLoader = true;
        this.confirmCash();
      },
      async interruptCash() {
        log.step('Пользователь прервал оплату');
        this.showInterruptModal = false;
        this.showBackFromPayment = true;
        
        if (await this.cancelCash()) {
          this.$emit('changePage', require('@/components/pages/PaymentPickPage'));
        } else {
          // не делаем ничего
          // вотчер isFinished переключит на финальную страницу
        }
      },
      cancelCard() {
        log.step('Отказ от оплаты картой');
        this.$emit('changePage', require('@/components/pages/PaymentPickPage'))
      },
      continueCardPay() {
        this.showInterruptModal = false;
        this.start(this.paymentParams)
      },
      updatePaymentProcessMessage(str) {
        this.paymentProcessMessage = str;
      },
      keypressHandler(e) {
        switch (e.keyCode) {
          case 72: // KeyH
            this.debugAddInputSum(10);
            break;
          case 74: // KeyJ
            this.debugAddInputSum(50);
            break;
          case 75: // KeyK
            this.debugAddInputSum(1000);
            break;
        }
      }
    },
    watch: {
      inputSum(val, prev) {
        if (val !== prev) {
          this.globalTimeout.refresh();
        }
      },
      isPinpadDone(val) {
        if (val && this.isSuccess) {
          log.info('Пинпад завершил работу, включаем модальное окно');
          this.showLoader = true;
        }
      },
      isFinished(val) {
        if (val) {
          this.showLoader = false;
          this.$emit('changePage', require('@/components/pages/FinishPage'));
        }
      },
    },
    created() {
      this.paymentParams = {
        goodsList: {
          name: 'test',
          price: 10,
          tax: TAX_GROUP.VAT_20,
          paymentTypeSign: PAYMENT.TYPE_SIGN.FULL_PAYMENT,
          paymentItemSign: PAYMENT.ITEM_SIGN.PRODUCT,
        },
        sum: 10,
      }
      this.start(this.paymentParams);
      
      document.addEventListener('keyup', this.keypressHandler);
      dino.on('message', this.updatePaymentProcessMessage);
    },
    beforeDestroy() {
      document.removeEventListener('keyup', this.keypressHandler);
      dino.off('message', this.updatePaymentProcessMessage);
    },
  }
</script>

<style lang="scss" module>
  .headerContent {
    background-color: $ecMainDark;
    color: $ecMainLight;
  }
  
  .payment {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    color: $ecMainLight;
    background-color: $ecMainDark;
    
    .contentWrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-direction: column;
      height: 100%;
      padding: 4vh 0;
    }
    
    .typeImage {
      width: 346px;
      height: 346px;
      margin: 0 auto 30px;
      border-radius: 50%;
      background-color: $ecMainLight;
      
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .imageCash {
      background-image: url("@/assets/img/icons/icon-insert-cash.svg");
    }
  
    .imageCard {
      background-image: url("@/assets/img/icons/icon-insert-card.svg");
    }
    
    .spinnerImage {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .directive {
      font-size: 2.3rem;
      text-align: center;
      font-weight: normal;
    }
  
    .fromPaymentText {
      margin-bottom: 7rem;
    }
    
    .infoWrapper {
      display: flex;
      margin: 0 auto;
      justify-content: center;
      
      .info {
        font-size: 20px;
        
        td {
          padding: 8px;
          
          &:last-child {
            text-align: right;
            white-space: nowrap;
          }
        }
      }
    }
    
    .text_right_card {
      width: 180px;
    }
  
    .text_right_cash {
      width: 400px;
    }
    
    .text_left {
      text-align: left;
    }
  }
  
  .modal {
    display: flex;
    flex-direction: column;
    
    .title {
      text-align: center;
      font-size: 2.2rem;
      margin-bottom: 2rem;
    }
    
    .buttons {
      display: flex;
      justify-content: space-around;
      
      .button {
        width: 230px;
        font-size: 1.6rem;
        background-color: $ecAccentDark;
        color: $ecMainLight;
        padding: 30px 20px;
        margin: 0 20px;
      }
      
      .continue {
        background-color: $ecAccentLight;
      }
    }
  }
</style>

