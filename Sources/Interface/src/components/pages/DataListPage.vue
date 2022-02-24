<template>
  <div :class="$style.confirmPage">
    <portal to="header">
      <HeaderContent :step="dataIsSet ? 'Подтвердите данные' : 'Произошла ошибка'"/>
    </portal>
    <portal to="modal">
      <BaseModal
        v-if="showLoader"
        :allow-user-close="false"
      >
        <BaseLoader>
          Пожалуйста подождите...
        </BaseLoader>
      </BaseModal>
    </portal>
    <h2
      v-if="dataIsSet"
      :class="$style.dataTitle"
    >
      Данные по заказу
    </h2>
    <div
      :class="$style.dataErrorText"
      v-if="!dataIsSet"
    >
      {{ errorMessage }}
    </div>
    <div v-else :class="$style.ifSuccessBlock">
      <div :class="$style.mainSection">
        <div
          :class="[$style.wrapper]"
          ref="wrap"
          :style="wrapperWidth"
        >
          <div
            :class="[$style.dataWrap, {[$style.active]: selectedRow === item.code }]"
            v-for="(item, index) in data"
            :key="index"
            :style="cardSize"
            @click="selectRow(item.code)"
          >
            <div>
              <div>№: {{index + 1}}</div>
              <div>{{item.fullName}}</div>
            </div>
            <div>
    
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>
      <div
        :class="[$style.bottomWrap, $style.list]"
      >
      </div>
    </div>
    <div :class="$style.listArrows" v-if="!cardView">
      <img
        src="@/assets/img/icons/icon-arrow.svg"
        alt="Стрелка"
        :class="$style.arrowDown"
        @click="scrollDown"
      >
      <img
        src="@/assets/img/icons/icon-arrow.svg"
        alt="Стрелка"
        :class="$style.arrowUp"
        @click="scrollUp"
      >
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/InputPage'))"
        >Назад
        </BaseButton>
        <BaseButton
          :active="dataIsSet"
          next
          @click="onClickNext"
        >Далее
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import HeaderContent from "@/components/pages/HeaderContent";
  import MainFooter from "@/components/service/MainFooter";
  import BaseButton from "@/components/base/BaseButton";
  import "scroll-behavior-polyfill"
  import { mapState } from "vuex";
  import BaseModal from "@/components/base/BaseModal";
  import BaseLoader from "@/components/base/BaseLoader";
  import { goodsMock } from "@/helpers/mock/goodsMock";
  import { DATALIST_TYPE } from '@/helpers/constants/clients';
  
  export default {
    name: "DataListPage",
    components: {HeaderContent, MainFooter, BaseButton, BaseModal, BaseLoader},
    data() {
      return {
        cardView: false,
        cardSize: {},
        
        data: '',
        finalPrice: null,
        wrapperWidth: null,
        scrollValue: null,
        groupWidth: null,
        pages: null,
        currentPage: 1,
        showLoader: false,
        errorMessage: 'Данные не получены',
        selectedRow: null
      }
    },
    methods: {
      scrollDown() {
        this.$refs.wrap.scrollTop += this.scrollValue
      },
      scrollUp() {
        this.$refs.wrap.scrollTop -= this.scrollValue
      },
      selectRow(id) {
        return this.selectedRow === id ? this.selectedRow = 0 : this.selectedRow = id;
      },
      onClickNext() {
        if (this.dataListType === DATALIST_TYPE.CLIENTS) {
          this.data = this.clients;
        }
        else if (this.dataListType === DATALIST_TYPE.DEBTS) {
          // this.showLoader = true
        }
      }
    },
    computed: {
      ...mapState({

        dataListType: state => state.dataListType,
        clients: state => state.clients.clientsInfo
      }),
      dataIsSet() {
        return this.data ?? false
      }
    },
    created() {
      if (this.dataListType === DATALIST_TYPE.CLIENTS) {
        this.data = this.clients;
      }
      else if (this.dataListType === DATALIST_TYPE.DEBTS) {
        // this.showLoader = true
      }
    },
    mounted() {
    
    }
  }
</script>

<style lang="scss" module>
  .confirmPage {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 30px;
    
    .dataTitle {
      font-size: 1.5rem;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .dataErrorText {
      width: 600px;
      font-size: 2rem;
      margin: 0 auto;
      text-align: center;
      line-height: 40px;
    }
    
    .ifSuccessBlock {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .mainSection {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      
      .arrowLeft,
      .arrowRight {
        width: 60px;
        height: 60px;
        margin-bottom: 10rem;
      }
      
      .arrowLeft {
        &:active {
          transform: scale(0.9);
        }
      }
      
      .arrowRight {
        transform: rotate(180deg);
        
        &:active {
          transform: scale(0.9) rotate(180deg);
        }
      }
    }
  
    .listArrows {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 200px;
    
      .arrowDown,
      .arrowUp {
        width: 60px;
        height: 60px;
      }
    
      .arrowDown {
        transform: rotate(270deg);
      
        &:active {
          transform: scale(0.9) rotate(270deg);
        }
      }
      .arrowUp {
        transform: rotate(90deg);
      
        &:active {
          transform: scale(0.9) rotate(90deg);
        }
      }
    }
  }
  
  .wrapper {
    overflow: hidden;
    scroll-behavior: smooth;
    width: 85vw;
    height: auto;
    background-color: $ecMainLight;
    box-shadow: $ecCardShadow;
    border-radius: 30px;
    
    .groups {
      &.list {
        width: 100%;
        padding: 2rem;
      }
    }
    
    .dataWrap {
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      width: 100%;
      border-bottom: 1px solid rgba($ecMainDark, 0.2);
      padding: 1rem 0 1rem 2rem;
      
      &:first-child {
        padding-top: 0;
      }
  
      &.active{
        border: 2px solid $ecAccentLight;
        box-shadow:  0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);;
        border-radius: 30px;
      }
      
      .priceWrap {
        &.list {
          min-width: 260px;
          
          p {
            display: flex;
            justify-content: space-between;
          }
        }
      }
      
      & p {
        font-size: 20px;
        padding-bottom: 10px;
        
        &:last-child {
          padding-bottom: 0;
        }
        
        & span {
          font-weight: bold;
        }
      }
    }
  }
  
  .whitePadding {
    width: 95%;
    z-index: 2;
    
    &.top {
      height: 41px;
      margin-bottom: -40px;
      background: linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 60%);
    }
    
    &.bottom {
      height: 61px;
      margin-top: -60px;
      background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 70%);
    }
  }
  
  .bottomWrap {
    display: flex;
    align-items: center;
    width: 100%;
    
    &.list {
      justify-content: space-between;
      height: 80px;
      padding: 20px 40px 0;
    }
    .finalPriceWrap {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .price {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .bold {
        font-size: 24px;
        font-weight: bold;
      }
      
      &.list {
        align-self: flex-end;
        width: 260px;
        height: 100%;
      }
    }
  }
</style>