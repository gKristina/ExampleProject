import Vue from 'vue'
import Vuex from 'vuex'

import settings from "@/store/settings";

import { sendIsMainPage } from "@/helpers/externals";

Vue.use(Vuex);

let initialState = {};

const state = {
  isMainPage: true,
  external: {
    backendMessage: null,
    barcode: null,
  },
  input: {
    orderNum: ''
  },
  dataListType: ''
};

const actions = {
  saveInitialState({ commit, state }) {
    commit('SAVE_INITIAL_STATE', state);
  },
  loadInitialState({ commit }) {
    if (Object.keys(initialState).length) { // initialState был записан хотя бы раз
      commit('RESET_STATE');
    }
  },
  setMainPageStatus: ({ commit }, status) => {
    commit('SET_MAIN_PAGE_STATUS', status);
    sendIsMainPage(status);
  },
  updateBackendMessage: ({ commit }, message) => {
    commit('UPDATE_BACKEND_MESSAGE', message);
  },
  updateOrderNum: ({commit}, order) => {
    commit('UPDATE_ORDER_NUM', order)
  },
  setDataListType({commit}, type) {
    commit('SET_DATALIST_TYPE', type);
  }
};

const mutations = {
  SAVE_INITIAL_STATE(state, newState) {
    initialState = JSON.parse(JSON.stringify(newState));
  },
  RESET_STATE() {
    store.replaceState(JSON.parse(JSON.stringify(initialState)));
  },
  SET_MAIN_PAGE_STATUS: (state, status) => {
    state.isMainPage = Boolean(status);
  },
  UPDATE_BACKEND_MESSAGE: (state, message) => {
    state.external.backendMessage = message;
  },
  UPDATE_ORDER_NUM: (state, order) => {
    state.input.orderNum = order
  },
  SET_DATALIST_TYPE(state, type) {
    state.dataListType = type;
  }
};

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  modules: {
    settings,
  },
  strict: process.env.NODE_ENV === 'development',
});

export default store;
