<template>
  <div :class="$style.inputPage">
    <portal to="header" v-if="!pageAsModal">
      <HeaderContent step="Введите номер телефона"/>
    </portal>
    <div :class="$style.mainWrap">
      <BaseModal v-if="modal.show" :allowUserClose="false">
        <div :class="$style.modalText">{{modal.text}}</div>
      </BaseModal>
      <div :class="$style.mainContent">
        <div :class="$style.inputWrap">
          <input
            type="text"
            :placeholder="inputSumPlaceholder"
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
      <div v-if="pageAsModal" :class="$style.modalButtons">
        <BaseButton modal @click="$emit('closeModal')"> Отмена</BaseButton>
        <BaseButton modal :active="inputValue > 1" @click="$emit('inputSum', inputValue)">Продолжить</BaseButton>
      </div>
    </div>
    <portal to="footer" v-if="!pageAsModal">
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
  import { parsePhoneNumber } from '@/helpers/utils';
  import BaseModal from '@/components/base/BaseModal';
  
  export default {
    name: "InputPage",
    components: {BaseKeyboard, HeaderContent, MainFooter, BaseButton, BaseModal},
    inject: {
      api: 'api'
    },
    props: {
      pageAsModal: {
        type: Boolean,
        required: false,
        default: false
      },
      inputSumPlaceholder: {
        type: String,
        required: false,
        default: ''
      }
    },
    data() {
      return {
        layout: KeyboardLayouts,
        inputValue: '',
        modal: {
          show: false,
          text: '',
          confirm: false,
          timer: null
        },
      }
    },
    computed: {
      validateInput() {
        return this.inputValue && this.inputValue.length > 7;
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
      async onClickNext() {
        if (this.validateInput) {
          this.showModal({text: `Выполняем поиск ...`});
          const value = parsePhoneNumber(this.inputValue);
          const api = await this.api;
          api.findClientsByPhone(value).then(
            clients => {
              if (clients.length) {
                clients.forEach(client => this.addClientInfo(client));
                this.setDataListType(DATALIST_TYPE.CLIENTS);
                this.$emit('changePage', require('@/components/pages/DataListPage'))
              } else {
                this.showModal({text: `Клиент не найден`, seconds: 2});
              }
            },
            () => {
              this.showModal({text: `Произошла ошибка, попробуйте позже`, seconds: 2});
            }
          );
        }
      },
      showModal({text, seconds = 0, confirm = false}) {
        clearTimeout(this.modal.timer)
        this.modal = {
          show: true,
          text,
          confirm,
          timer: seconds ? setTimeout(() => this.modal.show = false, seconds * 1000) : null,
        }
      }
    },
  }
</script>

<style lang="scss" module>
  .inputPage {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mainWrap {
    display: flex;
    flex-direction: column;
  }
  
  .modalText {
    font-size: 2rem;
  }
  
  .mainContent {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 4vh 0;
  }
  
  .modalButtons {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
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