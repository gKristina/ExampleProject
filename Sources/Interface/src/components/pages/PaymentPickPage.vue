<template>
  <div :class="$style.paymentPick">
    <portal to="header">
      <HeaderContent
        step="Выберите способ оплаты"
        :class="$style.headerContent"
        icon-color="light"
      />
    </portal>
    <p v-visible="error.text" :class="$style.error" class="ec-color-error">
      {{ error.text || '&nbsp;' }}
    </p>
    <div :class="$style.typesWrapper">
      <div
        :class="$style.cardWrap"
        @click="onCardClick(PAYMENT.TYPE.CASH)"
      >
        <div :class="[$style.imageWrapper, $style.wallet]"></div>
        <p :class="[$style.cardTitle, {[$style.active]: type === PAYMENT.TYPE.CASH}]">Наличными</p>
      </div>
  
      <div
        :class="$style.cardWrap"
        @click="onCardClick(PAYMENT.TYPE.CARD)"
      >
        <div :class="[$style.imageWrapper, $style.card]"></div>
        <p :class="[$style.cardTitle, {[$style.active]: type === PAYMENT.TYPE.CARD}]">Картой</p>
      </div>
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/DataListPage'))"
        >
          Назад
        </BaseButton>
        <BaseButton
          next
          :active="type === PAYMENT.TYPE.CASH || type === PAYMENT.TYPE.CARD"
          @click="onForwardButtonClick(type)"
        >
          Вперед
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import BaseButton from '@/components/base/BaseButton';
  import { mapActions } from 'vuex';
  import { PAYMENT } from '@/helpers/constants/payment';
  import MainFooter from '@/components/service/MainFooter';
  import HeaderContent from '@/components/pages/HeaderContent';
  import { debounce } from '@/helpers/utils';
  
  export default {
    name: "PaymentPickPage",
    components: {HeaderContent, MainFooter, BaseButton },
    data() {
      return {
        PAYMENT,
        type: undefined,
        error: {
          text: '',
          timeout: null,
        },
        onForwardButtonClick: null,
      }
    },
    methods: {
      ...mapActions({
        storeSetPayment: 'payment/setType'
      }),
      onCardClick(payType) {
        this.type = payType
      },
      selectPayment(type) {
        if (type === PAYMENT.TYPE.CASH || type === PAYMENT.TYPE.CARD) {
          this.storeSetPayment(type)
            .then(
              () => this.$emit('changePage', require('@/components/pages/PaymentPage')),
              () => {
                this.error.text = 'Не удалось установить тип оплаты';
                clearTimeout(this.error.timeout);
                this.error.timeout = setTimeout(() => this.error.text = '', 2 * 1000);
              }
            );
        }
      }
    },
    created() {
      this.onForwardButtonClick = debounce(this.selectPayment, 2000);
    }
  }
</script>

<style lang="scss" module>
  .headerContent {
    background-color: $ecMainDark;
    color: $ecMainLight;
  }
  
  .paymentPick {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
    background-color: $ecMainDark;
    color: $ecMainLight;

    .error {
      color: indianred;
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .typesWrapper {
      display: flex;
    }
    
    .cardWrap {
      width: 355px;
      height: 512px;
      box-shadow: $ecCardShadow;
      margin: 10px 10px 20px;
  
      .imageWrapper {
        height: 400px;
        background-color: $ecMainLight;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 30px 30px 0 0;
    
        &.wallet {
          background-image: url("@/assets/img/icons/icon-wallet.svg");
        }
        &.card {
          background-image: url("@/assets/img/icons/icon-card.svg");
        }
      }
      
      .cardTitle {
        text-align: center;
        font-size: 2.2rem;
        font-weight: bold;
        padding: 35px 10px 40px;
        border-radius: 0 0 30px 30px;
        background-color: $ecBackground;
        color: $ecFontDark;
        
        &.active {
          background-color: $ecAccentDark;
          color: $ecMainLight;
        }
      }
    }
  }
</style>
