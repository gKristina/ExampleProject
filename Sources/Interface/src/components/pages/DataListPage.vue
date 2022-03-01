<template>
  <div :class="$style.confirmPage">
    <portal to="header">
      <HeaderContent :step="'Подтвердите данные'"/>
    </portal>
    <portal to="modal">
      <BaseModal
        v-if="modal.show"
        :allow-user-close="false"
      >
        <div v-if="modal.type === modalTypes.text">{{modal.text}}</div>
        <BaseLoader  v-if="modal.type === modalTypes.loader">
          Пожалуйста подождите...
        </BaseLoader>
        <div v-if="modal.type === modalTypes.input" :class="$style.inputModal">
          <div :class="$style.inputTitle">Введите сумму для оплаты</div>
          <InputPage
            :pageAsModal="true"
            @closeModal="closeModal"
            @inputSum="onInputSum"
            :inputSumPlaceholder="`Cумма должна быть больше или равна ${selectedDebt.treatmentAmount}`"
          />
        </div>
      </BaseModal>
    </portal>
    <h2
      :class="$style.dataTitle"
    >
      {{titleContent}}
    </h2>
    <div :class="$style.ifSuccessBlock" v-if="data.length">
      <div :class="$style.mainSection">
        <div
          :class="[$style.wrapper]"
          ref="wrap"
        >
          <div :class="$style.columnTitles">
            <div v-if="rows.doctorName" :class="$style.columnRow">Доктор</div>
            <div v-if="rows.treatmentDate" :class="$style.columnRow">Дата приема</div>
            <div v-if="rows.treatmentAmount" :class="$style.columnRow">Стоимость</div>
          </div>
          <div
            :class="[$style.dataWrap, {[$style.active]: selectedRow === (item.code || item.orderCode) }]"
            v-for="(item, index) in data"
            :key="index"
            @click="selectRow(item)"
          >
            <div v-if="rows.fullName" :class="$style.columnRow">
              {{item.fullName}}
            </div>
            <div v-if="rows.doctorName" :class="$style.columnRow">
              {{item.doctorName}}
            </div>
            <div v-if="rows.treatmentDate" :class="$style.columnRow">
              {{item.treatmentDate}}
            </div>
            <div v-if="rows.treatmentAmount" :class="$style.columnRow">
              {{item.treatmentAmount}} руб.
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else :class="$style.dataError" > Данные не найдены</div>
    <div :class="$style.listArrows" v-if="data.length">
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
          @click="onClickBack"
        >Назад
        </BaseButton>
        <BaseButton
          :active="selectedRow"
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
  import { mapActions, mapState } from 'vuex';
  import BaseModal from "@/components/base/BaseModal";
  import BaseLoader from "@/components/base/BaseLoader";
  import { DATALIST_TYPE } from '@/helpers/constants/clients';
  import InputPage from '@/components/pages/InputPage';
  
  export default {
    name: "DataListPage",
    components: { InputPage, HeaderContent, MainFooter, BaseButton, BaseModal, BaseLoader},
    inject: {
      api: 'api'
    },
    data() {
      return {
        data: '',
        DATALIST_TYPE,
        modal: {
          show: false,
          type: '',
          text: '',
          timer: null
        },
        modalTypes: {
          loader: 'loader',
          input: 'input',
          text: 'text'
        },
        rows: {
          fullName: false,
          doctorName: false,
          treatmentDate: false,
          treatmentAmount: false,
        },
        scrollValue: 200,
        selectedRow: null
      }
    },
    methods: {
      ...mapActions({
        setDataListType: 'setDataListType',
        selectClient: 'clients/selectClient',
        clearClientsState: 'clients/clearClientsState',
        setClientsDebt: 'clients/setClientsDebt',
        selectDebt: 'clients/selectDebt',
        setSumToPay: 'payment/setSumToPay',

      }),
      scrollDown() {
        this.$refs.wrap.scrollTop += this.scrollValue
      },
      scrollUp() {
        this.$refs.wrap.scrollTop -= this.scrollValue
      },
      selectRow(item) {
        const code = this.dataListType === DATALIST_TYPE.CLIENTS ? item.code : item.orderCode;
        return this.selectedRow === code ? this.selectedRow = 0 : this.selectedRow = code;
      },
      onClickNext() {
        if (!this.selectedRow) return;
        this.showLoader();
        if (this.dataListType === DATALIST_TYPE.CLIENTS) {
          this.selectClient(this.selectedRow);
          this.getClientDebts();
        }
        if (this.dataListType === DATALIST_TYPE.DEBTS) {
          this.selectDebt(this.selectedRow);
          this.askPaymentPrice();
        }
      },
      async getClientDebts() {
        const api = await this.api;
        api.getDebts(this.currentClient.code).then(
          debts => {
            debts.forEach(debt =>  this.setClientsDebt(debt));
            this.configureDebtsTable(debts);
            this.setDataListType(DATALIST_TYPE.DEBTS);
          }, () => {
            this.showModal({text: `Не удалось получить данные по задолженностям`, type: this.modalTypes.text});
          }
        ).finally(() => {
          this.closeModal();
          this.selectedRow = null;
        });
      },
      askPaymentPrice() {
        this.modal.show = true;
        this.modal.type = this.modalTypes.input;
      },
      onInputSum(value) {
        if (value < this.selectDebt.treatmentAmount) return;
        this.setSumToPay(Number(value));
        this.$emit('changePage', require('@/components/pages/PaymentPickPage'))
      },
      onClickBack() {
        this.clearClientsState();
        this.$emit('changePage', require('@/components/pages/InputPage'))
      },
      showLoader() {
        this.modal.show = true;
        this.modal.type = this.modalTypes.loader;
      },
      showModal({text, seconds = 0, type}) {
        clearTimeout(this.modal.timer)
        this.modal = {
          show: true,
          text,
          type,
          timer: seconds ? setTimeout(() => this.modal.show = false, seconds * 1000) : null,
        }
      },
      closeModal() {
        this.modal.show = false;
        this.modal.type = '';
      },
      configureClientsTable() {
        this.rows.fullName = true;
        this.data = this.client;
      },
      configureDebtsTable() {
        this.rows.fullName = false;
        this.rows.doctorName = true;
        this.rows.treatmentDate = true;
        this.rows.treatmentAmount = true;
        this.data = this.clientDebts;
      }
    },
    computed: {
      ...mapState({
        selectedDebt: state => state.clients.selectedDebt,
        dataListType: state => state.dataListType,
        client: state => state.clients.clientsInfo,
        currentClient: state => state.clients.currentClient,
        clientDebts: state => state.clients.clientDebts
      }),
      titleContent() {
        return this.dataListType === DATALIST_TYPE.CLIENTS ? "Выберите клиента" : "Выберете задолженность для оплаты";
      }
    },
    created() {
      if (this.dataListType === DATALIST_TYPE.CLIENTS) {
        this.configureClientsTable();
      }
      if (this.dataListType === DATALIST_TYPE.DEBTS) {
        this.configureDebtsTable();
      }
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
    
    .inputModal {
      display: flex;
      flex-direction: row;
    }
    
    .inputTitle {
      text-align: center;
      font-weight: bold;
      font-size: 2.5rem;
    }
  
    .columnTitles {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
    }
    .columnTitles > div {
      min-width: 15rem;
    }
    
    .dataTitle {
      font-size: 1.5rem;
      margin-bottom: 20px;
      text-align: center;
    }
    .dataTitle > div {
      min-width: 15rem;
    }
    
    .dataError {
      font-size: 2.8rem;
      text-align: center;
      margin-bottom: 30rem;
    }
    
    .columnRow {
      width: 30%;
      text-align: center;
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
    width: 95vw;
    width: 95vw;
    max-height: 43vh;
    background-color: $ecMainLight;
    box-shadow: $ecCardShadow;
    border-radius: 15px;
    padding: 2rem;
  
    .columnTitles {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      margin-bottom: 2rem;
    }
    
    .groups {
      &.list {
        width: 100%;
        padding: 2rem;
      }
    }

    
    .dataWrap {
      display: flex;
      justify-content:  space-around;
      width: 100%;
      box-shadow: $ecLightGrey 0px 0px 0px 3px;
      padding: 1rem 0 1rem 2rem;
      font-weight: bold;
      margin-bottom: 1rem;
      border-radius: 15px;
      
      &:first-child {
        padding-top: 0;
      }
  
      &.active{
        border: 2px solid $ecAccentLight;
        border-radius: 15px;
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