import Vue from 'vue'
import Vuex from 'vuex'

import settings from "@/store/settings";

import { sendIsMainPage } from "@/helpers/externals";

Vue.use(Vuex);

const initialState = () =>  ({
  isMainPage: true,
  external: {
    backendMessage: null,
    barcode: null,
  },
  dataListType: ''
});

const state = initialState();

const actions = {
  loadInitialState({ commit }) {
    commit('RESET_STATE');
  },
  setMainPageStatus: ({ commit }, status) => {
    commit('SET_MAIN_PAGE_STATUS', status);
    sendIsMainPage(status);
  },
  setDataListType({commit}, type) {
    commit('SET_DATALIST_TYPE', type);
  }
};

const mutations = {
  RESET_STATE() {
    Object.assign(state, initialState())
  },
  SET_MAIN_PAGE_STATUS: (state, status) => {
    state.isMainPage = Boolean(status);
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
