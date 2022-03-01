import { log } from "@/helpers/log";

const defaultClientsState = () => ({
  clientsInfo: [],
  currentClient: null,
  clientDebts: [],
  selectedDebt: null
})

const state = defaultClientsState();

const actions = {
  addClientInfo({ commit }, client) {
    if (client) {
      commit('ADD_CLIENT_INFO', client);
    } else {
      log.warn(`На добавление в корзину передан невалидный объект ${JSON.stringify(client)}`);
    }
  },
  selectClient({ commit }, clientCode) {
    if (clientCode) {
      commit('SELECT_CLIENT', clientCode);
    } else {
      log.warn(`На добавление в корзину передан невалидный объект ${JSON.stringify(clientCode)}`);
    }
  },
  setClientsDebt({ commit }, debts) {
    if (debts) {
      commit('SET_CLIENTS_DEBT', debts);
    }
  },
  selectDebt({ commit }, debt) {
    if (debt) {
      commit('SELECT_DEBT', debt);
    }
  },
  clearClientsState({ commit },) {
    commit('CLEAR_CLIENTS_STATE');
  }
};

const mutations = {
  ADD_CLIENT_INFO(state, client) {
    state.clientsInfo.push(client);
  },
  SELECT_CLIENT(state, clientCode) {
    const client = state.clientsInfo.find(client => client.code === clientCode);
    state.currentClient = JSON.parse(JSON.stringify(client));
    log.step(`Выбран клиент ${JSON.stringify(client)}`);
  },
  SET_CLIENTS_DEBT(state, debts) {
    state.clientDebts.push(debts);
  },
  SELECT_DEBT(state, orderCode) {
    const debt = state.clientDebts.find(debt => debt.orderCode === orderCode);
    state.selectedDebt = JSON.parse(JSON.stringify(debt));
    log.step(`Выбрана задолженность для оплаты ${JSON.stringify(debt)}`);
  },
  CLEAR_CLIENTS_STATE(state) {
    Object.assign(state, defaultClientsState());
    log.step(`Очищен модуль clients`);
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
