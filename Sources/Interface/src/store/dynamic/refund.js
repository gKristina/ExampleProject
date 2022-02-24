import { log } from '@/helpers/log';
import { getLastPayment } from '@/helpers/utils';
import { returnPayment, selectKKM, startPayCycle } from '@/helpers/externals';
import { REFUND } from '@/helpers/constants/refund';
import moment from 'moment';

const state = () => ({
  done: false,
  type: null,
  info: null,
  inn: null,
  sum: {
    actual: null,
    required: null,
  },
  timers: {
    refund: undefined,
  },
  response: null,
  readyRequestRunning: false,
});

const getters = {};

const actions = {
  execute({ state, rootState, commit, dispatch }, { request, stopGlobalTimer, startGlobalTimer }) {
    return new Promise(async (resolve, reject) => {
      if (
        typeof request !== "object"
        || typeof stopGlobalTimer !== "function"
        || typeof startGlobalTimer !== "function"
      ) {
        log.error('Не переданы все параметры для старта возврата');
        reject();
        return;
      }
  
      startPayCycle(rootState.settings.gateId);
      
      let linkNum, authCode;
      if (request.type === REFUND.TYPE.CARD) {
        if (
          'card' in request
          && 'linkNum' in request.card
          && 'authCode' in request.card
        ) {
          linkNum = request.card.linkNum;
          authCode = request.card.authCode;
        } else {
          log.error('Не переданы все параметры по карте для старта возврата');
          reject();
          return;
        }
        
      } else {
        linkNum = 0;
        authCode = 0;
      }
      
      if (state.inn !== null) {
        const isKKMSelected = await dispatch('payment/selectKKM', state.inn);
        
        if (!isKKMSelected) {
          log.error('Возврат не может быть выполнен');
          reject();
          return;
        }
      }
      
      stopGlobalTimer();
      returnPayment(request.sum, request.description || '', linkNum, authCode, request.type, JSON.stringify(request.goodsList));
      
      const startTime = moment();
      const startTimeString = startTime.format('DD.MM.YYYY HH:mm:ss');
      let lastNotificationTime = startTime;
      const timer = setInterval(() => {
        const timeNow = moment();
        
        if (state.done) {
          clearInterval(timer);
          startGlobalTimer();
          resolve();
        } else {
          if (Math.ceil(moment.duration(startTime.diff(timeNow)).as('minutes')) * -1 > 30) {
            if (moment.duration(lastNotificationTime.diff(timeNow)).as('minutes') * -1 > 10) {
              lastNotificationTime = timeNow;
              log.warn(`Выдача средств на возврате (${startTimeString}) производится слишком долго`);
            }
          }
        }
      }, 500);
      // не предполагается, что при штатной работе бэк не вызовет обработчики возврата, поэтому тайм-аута нет
    });
  },
  
  selectKKM({ commit }, inn) {
    log.step(`Выбираем для возврата кассу с ИНН ${inn}`);
    
    if (selectKKM(inn)) {
      commit('SET_INN', inn);
      log.step(`Касса выбрана`);
      return true;
    } else {
      log.warn(`Невозможно выбрать кассу`);
      return false;
    }
  },
  
  finalize: async ({ commit, rootState }, data) => {
    if (rootState.settings.refund.getAllInfo) {
      const refundInfo = await getLastPayment();
      
      if (refundInfo !== null) {
        commit('SET_REFUND_INFO', refundInfo);
      } else {
        log.warn('Не получены все данные по проведённому возврату');
      }
    }
    
    commit('SET_FINISHED_REFUND_DATA', data);
  }
};

const mutations = {
  SET_REFUND_INFO(state, info) {
    state.info = info;
  },
  SET_INN(state, inn) {
    state.inn = inn;
  },
  SET_FINISHED_REFUND_DATA(state, { sum, type }) {
    state.sum = sum;
    state.type = type;
    state.done = true;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
