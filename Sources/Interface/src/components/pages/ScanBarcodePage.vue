<template>
  <div :class="$style.scanBarcodePage">
    <portal to="header">
      <HeaderContent step="Ожидание штрихкода"/>
    </portal>
    <div :class="$style.imgWrap">
      <img src="@/assets/img/barcode.png" alt="Штрихкод">
      <div :class="$style.diode">
        <div :class="$style.laser"></div>
      </div>
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/SelectCategoryPage'))"
        >
          Назад
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import HeaderContent from "@/components/pages/HeaderContent";
  import MainFooter from "@/components/service/MainFooter";
  import BaseButton from "@/components/base/BaseButton";
  import {log} from "@/helpers/log";
  import {mapActions} from "vuex";
  import {WsScanner} from "@/services/api/WsScanner"
  
  export default {
    name: "ScanBarcodePage",
    components: {HeaderContent, MainFooter, BaseButton},
    methods: {
      ...mapActions({
        storeOrderNum: "updateOrderNum"
      })
    },
    mounted() {
      try {
        WsScanner.onmessage = event => {
          log.info('Отсканированы данные: ' + event.data)
          let orderNum = event.data
          if (event.data.length > 10) orderNum = orderNum.substring(orderNum.length - 10)
          this.storeOrderNum(orderNum)
          this.$emit('changePage', require('@/components/pages/DataListPage'))
        }
      } catch (e) {
        log.error(e)
      }
    },
    beforeDestroy() {
      WsScanner.disable()
    }
  }
</script>

<style lang="scss" module>
  .scanBarcodePage {
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .imgWrap {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 400px;
      
      & img {
        width: 300px;
      }
      
      .laser {
        width: 100%;
        background-color: tomato;
        height: 1px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 2;
        box-shadow: 0 0 4px red;
        animation: scanning 5s infinite;
      }
      
      .diode {
        animation: beam .05s infinite;
      }
    }
  }
  
  @keyframes beam {
    50% {
      opacity: 0;
    }
  }
  
  @keyframes scanning {
    0% {
      transform: translateY(0px);
      opacity: 0;
    }
    
    5% {
      transform: translateY(0px);
      opacity: 1;
    }
    
    25% {
      transform: translateY(300px);
    }
    
    50% {
      transform: translateY(0px);
      opacity: 1;
    }
    60% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }
</style>