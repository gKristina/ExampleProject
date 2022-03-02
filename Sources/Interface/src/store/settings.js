import { getDBKey } from '@/helpers/externals';
import { CASHBOX_MODE } from '@/helpers/constants/cashboxMode';

 const state = {
  debug: {
    on: 0,
    mock: 1,
    devIntegration: 0,
    integration: { // отладочные настройки интеграции
      A: 'http://localhost:5000/clientsManagement/',
      B: '',
      C: '',
      D: '',
      E: '',
      F: '',
    },
  },
  log: {
    on: 1,
    step: 1,
    warning: 1,
    exception: 1,
    debug: 1,
  },
  gateId: 755248,
  timeout: 60 * 1000,
  clock: true,
  payment: {
    allowChange: false,
    allowPartial: {
      cash: false,
      card: false,
    },
    autoFinish: false,
    getAllInfo: false,
    combo: false,
    cashboxMode: CASHBOX_MODE.LEGACY,
    online: {
      settings: {
        auth: {
          companyId: 0,
          userLogin: '',
          password: '',
        },
        data: {
          getFiscalData: true,
          getCheckLink: false,
          getQRCode: false,
        },
        database: {
          username: '',
          password: '',
          database: '',
        },
        check: {
          taxSystemType: 1,
        }
      }
    }
  },
  refund: {
    getAllInfo: false
  },
  cashbox: {
    debug: false,
    dbNumber: 0,
  }
};

const getters = {
  mockEnabled: state => state.debug.on && state.debug.mock,
  isDebug: state => Boolean(state.debug.on),
  cashboxDebug: state => state.cashbox.debug,
  dbNumber: state => state.cashbox.dbNumber,
  devIntegration: state => state.debug.devIntegration,
  devIntegrationValues: state => state.debug.integration
};

const actions = {
  initializeGateId: ({ commit }) => {
      commit('UPDATE_GATE_ID', getDBKey('IntegrationValB'))
  },
  async updateAppSettings({ commit }) {
    await fetch('/appSettings/settings.json')
        .then( res => res.json())
        .then(config => {commit('UPDATE_APP_SETTINGS', config)});
  }
}

const mutations = {
  UPDATE_GATE_ID: (state, gateId) => {
    state.gateId = gateId
  },
  UPDATE_APP_SETTINGS: (state, settings) => {
    Object.assign(state, settings);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
