import { log } from "@/helpers/log";

const state = () => ({
  clientsInfo: [],
  clientCode: null
});

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
      log.warn(`На добавление в корзину передан невалидный объект ${JSON.stringify(client)}`);
    }
  }
};

const mutations = {
  ADD_CLIENT_INFO(state, client) {
    state.clientsInfo.push(client);
  },
  SELECT_CLIENT(state, clientCode) {
    state.clientCode = clientCode;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
