<template>
  <div :class="$style.idle">
    <portal to="header">
      <HeaderContent/>
    </portal>
    <div
      :class="$style.screenButton"
      @click="$emit('changePage', require('@/components/pages/InputPage'))"
    ></div>
    <div :class="$style.backgroundWrap">
      <img
        :class="$style.mainImg"
        src="~@/assets/img/logo-new.svg"
        alt="Электронный кассир"
      >
    </div>
    <portal to="footer">
      <MainFooter :class="$style.footer">
        <p>Коснитесь экрана,<br>чтобы продолжить</p>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import store from "@/store/store";
  import payment from "@/store/dynamic/payment";
  import refund from "@/store/dynamic/refund";
  import { startPayCycle, stopBill } from "@/helpers/externals";
  import { mapActions, mapGetters, mapState } from "vuex";
  import MainFooter from "@/components/service/MainFooter";
  import HeaderContent from "@/components/pages/HeaderContent";
  import { api } from '@/services/api/ApiFactory';
  import clients from '@/store/dynamic/clients';
  
  export default {
    name: "IdlePage",
    components: {HeaderContent, MainFooter},
    inject: {
      skud: 'skud',
      globalTimeout: 'globalTimeout',
    },
    computed: {
      ...mapState({
        gateId: state => state.settings.gateId,
      }),
      ...mapGetters({
        isDebug: 'settings/isDebug',
      }),
    },
    methods: {
      ...mapActions({
        updateAppSettings: 'settings/updateAppSettings',
        setMainPageStatus: 'setMainPageStatus',
        resetStore: 'loadInitialState',
        initGateID: 'settings/initializeGateId'
      }),
    },
    beforeCreate() {
      if (store.hasModule('payment')) {
        store.unregisterModule('payment');
      }
      if (store.hasModule('refund')) {
        store.unregisterModule('refund');
      }
      if (store.hasModule('clients')) {
        store.unregisterModule('clients');
      }
      
      store.dispatch('loadInitialState');
      setTimeout(() => {
        store.registerModule('payment', payment);
        store.registerModule('refund', refund);
        store.registerModule('clients', clients);
      }, 500);
      
      stopBill();
    },
    async created() {
      await this.initGateID();
      
      startPayCycle(this.gateId);
      
      this.skud.show();
      this.globalTimeout.stop();
      
      this.setMainPageStatus(true);
    },
    beforeDestroy() {
      this.skud.hide();
      if (!this.isDebug) {
        this.globalTimeout.start();
      }
      
      this.setMainPageStatus(false);
    },
  }
</script>

<style lang="scss" module>
  .screenButton {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100vw;
    height: 100vh;
  }
  
  .idle {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100vw;
  }
  
  .backgroundWrap {
    width: 100%;
    height: 100%;
    background-image: url("@/assets/img/backgrounds/bg-idle.jpg");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    
    & img {
      width: 30vw;
      margin: 2rem;
    }
  }
  
  .mainImg {
    width: 200px;
    height: auto;
  }
  
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 220px;
    
    p {
      display: flex;
      align-items: center;
      color: $ecMainLight;
      font-weight: 800;
      font-size: 48px;
      
      &:before {
        content: '';
        display: block;
        width: 88px;
        height: 125px;
        margin: 0 30px 10px 0;
        background-image: url('@/assets/img/icons/icon-pointer.svg');
        background-repeat: no-repeat;
        animation: click 5s infinite ease;
      }
    }
  }
  
  @keyframes click {
    0% {
      transform: translateY(0px) scale(1)
    }
    8% {
      transform: translateY(-20px) scale(1);
    }
    10% {
      transform: translateY(-20px) scale(0.85);
    }
    12% {
      transform: translateY(-20px) scale(1);
    }
    20% {
      transform: translateY(0px)
    }
    100% {
      transform: translateY(0px)
    }
  }
</style>
