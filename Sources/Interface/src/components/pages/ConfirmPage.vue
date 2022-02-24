<template>
  <div :class="$style.confirmPage">
    <portal to="header">
      <HeaderContent step="Подтвердите данные"/>
    </portal>
    <div :class="$style.flexFix">
      <div ref="stringsWrap" :class="$style.dataWrap">
        <div :class="$style.stringWrap">
          <p>Номер заказа: </p><span> {{data.orderNum}}</span>
        </div>
        <div :class="$style.stringWrap">
          <p>Сумма к оплате: </p><span> {{data.price}} ₽</span>
        </div>
      </div>
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/InputPage'))"
        >Назад
        </BaseButton>
        <BaseButton
          :active="true"
          next
          @click="$emit('changePage', require('@/components/pages/PaymentPickPage'))"
        >Верно
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import HeaderContent from "@/components/pages/HeaderContent";
  import MainFooter from "@/components/service/MainFooter";
  import BaseButton from "@/components/base/BaseButton";
  
  export default {
    name: "ConfirmPage",
    components: {HeaderContent, MainFooter, BaseButton},
    data() {
      return {
        data: {
          orderNum: "48965",
          price: 450
        }
      }
    }
  }
</script>

<style lang="scss" module>
  .confirmPage {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .flexFix {
    display: flex;
  }
  
  .dataWrap {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 770px;
    min-height: 260px;
    padding: 5rem;
    box-shadow: $ecCardShadow;
    border-radius: 30px;
    background-color: $ecMainLight;
    
    .stringWrap {
      display: flex;
      align-items: flex-end;
    }
    
    & p {
      font-size: 20px;
      overflow: hidden;
      white-space: nowrap;
      
      &:after {
        content: '......................................................................................................................';
      }
      
      &:last-child {
        padding-bottom: 0;
      }
    }
    
    & span {
      font-size: 30px;
      font-weight: bold;
      white-space: nowrap;
      padding-left: 10px;
    }
  }
</style>