<template>
  <div :class="$style.finish">
    <portal to="header">
      <HeaderContent
        step="Печать квитанции"
        icon-color="light"
        :class="$style.headerContent"
      />
    </portal>
    <div :class="$style.typeImage"></div>
    <p :class="$style.todo">Оплата прошла успешно.<br>Не забудьте взять квитанцию!</p>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          :active="true"
          main
          @click="goToMain"
        >На главную
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import BaseButton from "@/components/base/BaseButton";
  import MainFooter from "@/components/service/MainFooter";
  import { mapState } from "vuex";
  import HeaderContent from "@/components/pages/HeaderContent";
  import { log } from '@/helpers/log';
  import { PaymentSchedule } from '@/services/api/PaymentSchedule';
  import { getCurrentSession } from '@/helpers/externals';
  
  export default {
    name: "FinishPage",
    components: { HeaderContent, MainFooter, BaseButton },
    inject: {
      api: 'api'
    },
    data() {
      return {
        toMain: {
          timer: null,
          delay: 6 * 1000,
        }
      }
    },
    computed: {
      ...mapState({
        paymentType: state => state.payment.type,
        paymentSuccess: state => state.payment.success,
        selectedDebt: state => state.clients.selectedDebt,
        inputSum:  state => state.payment.sumToPay
      }),
    },
    methods: {
      goToMain() {
        this.$emit('changePage', require('@/components/pages/IdlePage'));
      }
    },
    async created() {
      this.toMain.timer = setTimeout(
        this.goToMain,
        this.toMain.delay,
      );
  
      if (this.paymentSuccess) {
        const data = {
          ...this.selectedDebt,
          paid: this.inputSum
        };
        const api = await this.api;
        api.pay(data).then(
          () => {}, 
          () => {
            log.info('[Оплата] Ставим оплату в очередь')
            PaymentSchedule.add({id: getCurrentSession(), data})
          }).catch(e => {
          log.info('[Оплата] Ставим оплату в очередь', e)
          PaymentSchedule.add({id: getCurrentSession(), data})
        });
      }
    },
    beforeDestroy() {
      clearTimeout(this.toMain.timer);
    },
  }
</script>

<style lang="scss" module>
  .headerContent {
    background-color: $ecMainDark;
    color: $ecMainLight;
  }
  
  .finish {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 4vh 0;
    background-color: $ecMainDark;
    color: $ecMainLight;
  
    .typeImage {
      width: 346px;
      height: 346px;
      margin-bottom: 30px;
      border-radius: 50%;
      background-color: $ecMainLight;
      background-image: url("@/assets/img/icons/icon-check.svg");
      background-repeat: no-repeat;
      background-position: center;
    }
    
    .todo {
      margin-bottom: 7rem;
      font-size: 1.8rem;
      text-align: center;
    }
  }
</style>
