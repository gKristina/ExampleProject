<template>
  <div :class="$style.inputPage">
    <portal to="header">
      <HeaderContent step="Введите номер телефона"/>
    </portal>
    <div :class="$style.mainContent">
      <div :class="$style.inputWrap">
        <input
          type="text"
          v-model="inputValue"
        >
        <BaseKeyboard
          :layout="layout.onlyBackspace"
          v-model="inputValue"
        />
      </div>
      <BaseKeyboard
        :layout="layout.numpadNoDecimal"
        v-model="inputValue"
      />
    </div>
    <portal to="footer">
      <MainFooter>
        <BaseButton
          back
          @click="$emit('changePage', require('@/components/pages/IdlePage'))"
        >Назад
        </BaseButton>
        <BaseButton
          :active="validateInput"
          next
          @click="onClickNext"
        >Вперед
        </BaseButton>
      </MainFooter>
    </portal>
  </div>
</template>

<script>
  import HeaderContent from "@/components/pages/HeaderContent";
  import BaseKeyboard from "@/components/base/BaseKeyboard";
  import BaseButton from "@/components/base/BaseButton";
  import MainFooter from "@/components/service/MainFooter";
  import KeyboardLayouts from "@/helpers/KeyboardLayouts";
  import {mapState, mapActions} from "vuex";
  import { DATALIST_TYPE } from '@/helpers/constants/clients';
  
  export default {
    name: "InputPage",
    components: {BaseKeyboard, HeaderContent, MainFooter, BaseButton},
    inject: {
      api: 'api'
    },
    data() {
      return {
        layout: KeyboardLayouts,
        inputValue: ''
      }
    },
    computed: {
      ...mapState({
        inputValueState: state => state.input.orderNum
      }),
      validateInput() {
        return this.inputValue && this.inputValue.length > 1;
      },
      backButtonText() {
        return this.inputSum > 0 ? 'Отказаться' : 'Назад';
      }
    },
    methods: {
      ...mapActions({
        addClientInfo: 'clients/addClientInfo',
        setDataListType: 'setDataListType'
      }),
      onClickNext() {
        if (this.validateInput) {
          this.api.findClientsByPhone().then(
            clients => {
              clients.forEach(client => this.addClientInfo(client));
              this.setDataListType(DATALIST_TYPE.CLIENTS);
            },
            () => {
              
            }
          ).then(() => this.$emit('changePage', require('@/components/pages/DataListPage')));
        }
      }
    },
    mounted() {
      this.inputValue = this.inputValueState
    }
  }
</script>

<style lang="scss" module>
  .inputPage {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mainContent {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 4vh 0;
  }
  
  .inputWrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 900px;
    
    & input {
      width: 100%;
      height: 3.8rem;
      box-shadow: $ecCardShadow;
      border-radius: 15px;
      border: none;
      margin-right: 0.8rem;
      font-size: 1.6rem;
      padding: 1rem 2rem;
    }
  }
</style>