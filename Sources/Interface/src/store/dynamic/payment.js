import { log } from "@/helpers/log";
import {
  addPaymentParameters,
  getDBKey,
  getPaymentInput,
  getPaymentSum,
  getPinpadTimeout,
  sendPayConfirmNew,
  sendPaymentCancel,
  setDBKey,
  setPaymentSum,
  startBill,
  startPinpad,
  stopBill
} from "@/helpers/externals";
import { getLastPayment, isTerminal, waitPaymentReady } from "@/helpers/utils";
import { CASHBOX_MODE } from "@/helpers/constants/cashboxMode";
import { PAYMENT } from "@/helpers/constants/payment";
import { GoodsListItem } from "@/helpers/mappers/GoodsListItem";
import Vue from 'vue';

const getDefaultPaymentState = () => ({
  is: false,
  info: null,
  success: false,
  type: null,
  finished: false,
  sum: {
    input: 0,
    total: 0,
  },
  polling: {
    timer: null,
    delay: 200,
  },
  pinpadDone: null,
  goodsList: null,
  infinite: false,
  combo: null,
  autoFinishCalled: false,
  cashboxMode: CASHBOX_MODE.LEGACY,
  cashConfirmDelay: isTerminal() ? 9 * 1000 : 400,
  additionalParameters: null
});

const state = getDefaultPaymentState();

const getters = {
  remainingSum: state => {
    const sum = state.sum.total - state.sum.input;
    return sum < 0 ? 0 : sum;
  },
  changeSum: state => {
    const change = state.sum.total - state.sum.input;
    return change < 0 ? Math.abs(change) : 0;
  },
  receivedSum: state => {
    if (state.type === PAYMENT.TYPE.CASH) {
      if (isNaN(Number(state.sum.input)) || isNaN(Number(state.sum.total))) {
        return 0;
      }
      
      if (state.sum.input < state.sum.total) {
        return state.sum.input;
      } else {
        return state.sum.total;
      }
    }
    
    if (state.type === PAYMENT.TYPE.CARD) {
      return state.sum.total;
    }
    
    return 0;
  },
};

const actions = {
  async start({ state, commit, dispatch, rootState }, { goodsList, type = state.type, sum, }) {
    return new Promise(async (resolve, reject) => {
      log.step('Подготавливаем платёж');
      
      if (goodsList === undefined) {
        log.error('Платёж не может быть начат - отсутствует GoodsList');
        reject();
        return;
      } else {
        dispatch('setGoodsList', goodsList);
      }
      
      try {
        await dispatch('setType', type);
      } catch (e) {
        log.error('Платёж не может быть начат - не задан тип платежа');
        reject();
        return;
      }
      
      if (state.infinite && state.goodsList.length > 1) {
        log.error('Номенклатура не может состоять из более чем одной позиции при неограниченной оплате наличными');
        reject();
        return;
      }
      
      let sumToPay;
      if (state.infinite && state.type === PAYMENT.TYPE.CASH) {
        sumToPay = 0;
      } else {
        sumToPay = sum;
        
        if (sumToPay === 0) {
          if (state.type === PAYMENT.TYPE.CARD) reject();
          
          log.error('Сумма оплаты на ' + (state.type === PAYMENT.TYPE.CARD ? 'без' : '') + 'нале ' +
            'не может быть равна нулю' +
            (state.type === PAYMENT.TYPE.CASH ? '. Возможно вы хотели воспользоваться методом enableInfinite' : ''));
          reject();
          return;
        }
      }
      if (sumToPay !== 0 && sumToPay !== Number(sumToPay.toFixed(2))) {
        log.error(`Неверная сумма ${sumToPay}. Нужно округлить до второго знака после запятой`);
        reject();
        return;
      }
      
      commit('SET_PAYMENT_SUM', sumToPay)
      setPaymentSum(sumToPay);
      
      commit('UPDATE_PAYMENT_STATUS', true);
      let stopCardWatcher, timeoutSeconds, decreaseSeconds;
      let prevInput = 0;
      
      switch (state.type) {
        case PAYMENT.TYPE.CASH:
          startBill();
          
          commit('SET_POLLING_TIMER',
            setInterval(function () {
              let inputSum;
              if (isTerminal()) {
                inputSum = getPaymentInput();
              } else {
                inputSum = state.sum.input;
              }
              
              if (prevInput !== inputSum) {
                prevInput = inputSum;
                commit('UPDATE_INPUT_SUM', inputSum)
                const totalSum = state.sum.total;
                
                if (rootState.settings.payment.autoFinish
                  && inputSum >= totalSum
                  && !state.infinite
                ) {
                  clearInterval(state.polling.timer);
                  dispatch('confirmCash');
                }
              }
            }, state.polling.delay)
          );
          break;
        case PAYMENT.TYPE.CARD:
          startPinpad();
          
          timeoutSeconds = Vue.observable({
            value: getPinpadTimeout() / 1000,
          });
          decreaseSeconds = setInterval(() => {
            timeoutSeconds.value--
            if (timeoutSeconds.value <= 0) {
              clearInterval(decreaseSeconds);
            }
          }, 1000);
          
          stopCardWatcher = this.watch(
            () => {
              return state.success
                || state.pinpadDone
                || timeoutSeconds.value <= 0;
            },
            () => {
              stopCardWatcher();
              
              if (timeoutSeconds.value <= 0) {
                log.warn('Интерфейсный таймаут пинпада');
                commit('UPDATE_PAYMENT_STATUS', false);
                reject();
                return;
              }
              
              if (state.success) {
                dispatch('sendGoodsList');
                sendPayConfirmNew();
                resolve();
              } else {
                commit('UPDATE_PINPAD_STATUS', false);
                commit('UPDATE_PAYMENT_STATUS', false);
                reject();
              }
            }
          );
          
          if (!isTerminal()) {
            // setTimeout(window.PayConfirmNew, 2000);
          }
          break;
        default:
          log.error(`Не задан валидный тип оплаты. Текущий тип: ${state.type}`);
      }
      
      log.step('Платёж подготовлен');
    });
  },
  
  async interrupt({ state, commit }, reason) {
    log.step(`Прерываем оплату по причине: ${reason}`)
    
    if (state.type === PAYMENT.TYPE.CARD) {
      commit('UPDATE_PINPAD_STATUS', true);
    } else {
      return new Promise(resolve => {
        stopBill();
        setTimeout(() => {
          stopBill();
          
          
        }, state.cashConfirmDelay)
      });
    }
  },
  
  /**
   * Вызов успешного платежа с наличной оплаты
   * @returns {Promise}
   * resolve - в случае передачи управления на бэк с уходом на ShowPrintCheckPage
   * reject - в случае полного отказа от проведения. Управление сразу передаётся интерфейсу
   */
  confirmCash({ state, commit, dispatch, rootState }) {
    log.info('Вызов успешного платежа с наличной оплаты в хранилище');
    
    return new Promise((resolve, reject) => {
      if (state.is === true) {
        if (state.type !== PAYMENT.TYPE.CASH) {
          log.error('Попытка вызова успешного завершения приёма купюр вне наличной оплаты');
          reject();
          return;
        }
        
        log.step('Вызван обработчик успешного выполнения наличной оплаты');
        
        stopBill();
        setTimeout(() => {
          commit('UPDATE_PAYMENT_STATUS', false);
          
          stopBill();
          clearInterval(state.polling.timer);
          
          if (
            rootState.settings.payment.allowPartial.cash
            ? state.sum.input > 0
            : state.sum.input >= state.sum.total
          ) {
            commit('SET_PAYMENT_SUCCESS');
            dispatch('sendGoodsList');
            
            if (isTerminal()) {
              sendPayConfirmNew();
            } else {
              setTimeout(window.ShowPrintCheckPage);
            }
            
            resolve();
            return;
          } else {
            if (state.sum.input === 0) {
              log.error('Отсутствуют принятые деньги');
              reject();
              return;
            } else {
              log.warn('Отказ проведения платежа, т.к. введённая сумма недостаточна');
              
              if (isTerminal()) {
                sendPaymentCancel();
              } else {
                setTimeout(window.ShowPrintCheckPage);
              }
              
              resolve();
              return;
            }
          }
        }, state.cashConfirmDelay);
      } else {
        log.error('Попытка вызвать успешное завершение платежа, когда оплата неактивна');
        reject();
        return;
      }
    });
  },
  
  /**
   * Вызов отмены платежа с наличной оплаты
   * @returns {Promise}
   * resolve - в случае передачи управления на бэк с уходом на ShowPrintCheckPage
   * reject - в случае полного отказа от проведения. Управление сразу передаётся интерфейсу
   */
  cancelCash({ state, commit, dispatch, rootState }) {
    log.info('Вызов отмены платежа с наличной оплаты в хранилище');
    
    return new Promise(resolve => {
      if (state.is === true) {
        if (state.type !== PAYMENT.TYPE.CASH) {
          log.error('Попытка вызова отмены завершения приёма купюр вне наличной оплаты');
          resolve(true);
          return;
        }
        
        log.step('Вызван обработчик отмены выполнения наличной оплаты');
        
        stopBill();
        setTimeout(() => {
          commit('UPDATE_PAYMENT_STATUS', false);
          
          stopBill();
          clearInterval(state.polling.timer);
          
          if (state.sum.input === 0) {
            resolve(true);
            return;
          } else {
            log.warn('При отмене присутствовали деньги');
            
            if (state.sum.input >= state.sum.total) {
              log.step('Денег достаточно, проводим оплату');
              commit('SET_PAYMENT_SUCCESS');
              dispatch('sendGoodsList');
              
              if (isTerminal()) {
                sendPayConfirmNew();
              } else {
                setTimeout(window.ShowPrintCheckPage);
              }
              
              resolve(false);
              return;
            } else {
              log.step('Денег недостаточно, возвращаем деньги');
              
              if (isTerminal()) {
                sendPaymentCancel();
              } else {
                setTimeout(window.ShowPrintCheckPage);
              }
              
              resolve(false);
              return;
            }
          }
        }, state.cashConfirmDelay);
      } else {
        log.error('Попытка вызвать отмену платежа, когда оплата неактивна');
        resolve(true);
        return;
      }
    });
  },
  
  /**
   * Обработка успешной оплаты по банковскому модулю
   * @param state vuex
   * @param commit vuex
   */
  handleCardSuccess({ state, commit }) {
    log.step('Получен успех от банковского модуля');
    
    commit('SET_CARD_SUCCESS');
  },
  
  /**
   * Завершить платёж
   */
  finalize({ state, commit, rootState }) {
    commit('UPDATE_PAYMENT_STATUS', false);
    
    waitPaymentReady()
      .catch(log.error)
      .finally(async () => {
        try {
          if (rootState.settings.payment.getAllInfo && rootState.settings.payment.cashboxMode === CASHBOX_MODE.LEGACY) {
            const paymentInfo = await getLastPayment()
            
            if (paymentInfo !== null) {
              commit('SET_PAYMENT_INFO', paymentInfo);
            } else {
              log.warn('Не получены все данные по проведённому платежу');
            }
          }
          
          setTimeout(() => {
            log.step('Проведение оплаты завершено');
            commit('SET_PAYMENT_FINISHED');
          }, 4 * 1000);// 4 секунды - минимальное время для бэка, чтобы отправить платёж в личный кабинет
        } catch (e) {
          log.error(e);
        }
      });
  },
  
  /**
   * Установить режим работы с кассой
   */
  setCashboxMode({ commit }, mode) {
    if (state.is) {
      log.warn('Нельзя менять режим работы с кассой на этапе приёма денег');
      return;
    }
    
    const name = Object.entries(CASHBOX_MODE)
      .find(arr => arr[1] === mode)?.[0] || '(режим не найден в словаре)';
    log.step(`Меняем режим работы с кассой на ${name}`);
    
    switch (mode) {
      case CASHBOX_MODE.LEGACY:
        enableLegacyCashbox();
        log.step('Установлен режим работы с кассой через старый бэк');
        break;
      case CASHBOX_MODE.NO_CASHBOX:
        disableLegacyCashbox();
        log.step('Отключена работа с кассой');
        break;
      case CASHBOX_MODE.KIT_ONLINE:
        disableLegacyCashbox();
        log.step('Установлен режим работы с кассой через модуль Kit Online');
        break;
      default:
        log.warn(`Установлен неизвестный режим работы с кассой: [${name}: ${mode}]`
          + '. Для работы с кассой будет использован старый бэк');
        enableLegacyCashbox();
        mode = CASHBOX_MODE.LEGACY;
    }
    
    commit('SET_CASHBOX_MODE', mode);
    
    /**
     * Включает работу с кассой через старый бэк
     */
    function enableLegacyCashbox() {
      log.step('Включена работа с кассой через старый бэк');
      setDBKey('isFiskal', '1');
    }
    
    /**
     * Выключает работу с кассой через старый бэк
     */
    function disableLegacyCashbox() {
      log.step('Отключена работа с кассой через старый бэк');
      setDBKey('isFiskal', '0');
    }
  },
  
  setType({ state, commit }, type) {
    return new Promise((resolve, reject) => {
      const name = Object.entries(PAYMENT.TYPE)
        .find(arr => arr[1] === type)?.[0];
      
      if (!name) {
        log.error(`Попытка установить неизвестный тип оплаты: ${type}`);
        reject();
        return;
      }
      
      log.step(`Устанавливаем тип оплаты: ${name}`);
      commit('SET_TYPE', type);
      resolve();
    })
  },
  
  /**
   *
   * @param state
   * @param commit
   * @param goodsList{Array<GoodsListItem>|GoodsListItem}
   */
  setGoodsList({ state, commit }, goodsList) {
    if (!Array.isArray(goodsList)) {
      goodsList = [goodsList];
    }
    
    commit('SET_GOODSLIST',
      goodsList
        .filter(el => typeof el === "object")
        .map(el => new GoodsListItem(el))
    );
  },
  
  sendGoodsList({ state, commit }) {
    if (state.infinite && state.type === PAYMENT.TYPE.CASH) {
      commit('UPDATE_GOODSLIST_INFINITE');
    }
    
    addPaymentParameters('GoodsList', JSON.stringify(state.goodsList));
  },
  
  /**
   * Выбрать кассу<br>
   * (для работы с мультимерчант)
   * @param state
   * @param {string} inn
   * @return {boolean} true - если касса найдена, false - если касса не найдена или произошла ошибка
   */
  selectKKM({ state }, inn) {
    inn = String(inn);
    log.step(`Выбираем кассу по ИНН ${inn}`);
    
    if (state.is === true) {
      log.error('Нельзя выбрать ККМ, если начат приём средств');
      return false;
    }
    
    if (getDBKey('isMultiMerchant') !== 'True') {
      log.warn('Нельзя выбрать ККМ, если не включён мультимерчант');
      return false;
    }
    
    let found = false;
    
    if (isTerminal()) {
      found = Boolean('SelectMultiMerchant' in external && external.SelectMultiMerchant(inn) || false); // экстернал возвращает 1 или 0
    } else {
      found = true;
    }
    
    if (!found) {
      log.warn('Касса не найдена / Касса не выбрана');
    }
    
    return found;
  },
  
  /**
   * Установить имя плательщика
   * @param context
   * @param {string} name
   */
  setPayerName(context, name) {
    addPaymentParameters('payerNameTag', String(name));
  },
  
  /**
   * Установить ИНН плательщика
   * @param context
   * @param {string|number} inn
   */
  setPayerInn(context, inn) {
    addPaymentParameters('payerINNTag', String(inn));
  },
  
  /**
   * Установить Email или номер телефонаплательщика
   * @param context
   * @param {string|number} email или номер телефона
   */
  setPayerEmailPhone(context, email) {
    addPaymentParameters('payerEmailTag', String(email));
  },
  
  /**
   * Установить тег для оплаты вручную
   * @param context
   * @param {number|string} tagNumber
   * @param {number|string} value
   */
  setCustomTag(context, tagNumber, value) {
    addPaymentParameters(`tag${tagNumber}`, String(value));
  },
  
  debugAddInputSum({ commit, rootState }, sum) {
    if (Number.isNaN(Number(sum))) {
      log.warn(`Внесённая отладочная сумма ${sum} не является числом`);
      return;
    }
    
    if (rootState.settings.debug.on) {
      commit('DEBUG_ADD_INPUT_SUM', sum);
    } else {
      log.warn('Нельзя внести отладочную сумму вне режима отладки');
    }
  },
  setSumToPay({ commit }, sum) {
    commit('SET_SUM_TO_PAY', sum);
  },
  
  clearPaymentState({ commit }) {
    commit('CLEAR_PAYMENT_STATE');
  }
};

const mutations = {
  SET_CASHBOX_MODE(state, mode) {
    state.cashboxMode = mode;
  },
  SET_TYPE(state, type) {
    state.type = type;
  },
  SET_SUM_TO_PAY(state, sum) {
    state.sumToPay = sum;
  },
  SET_CARD_SUCCESS(state) {
    state.success = true;
    state.pinpadDone = true;
  },
  SET_PAYMENT_SUCCESS(state) {
    state.success = true;
  },
  SET_PAYMENT_FINISHED(state) {
    state.finished = true;
  },
  SET_PAYMENT_SUM(state, sum) {
    state.sum.total = sum;
  },
  SET_PAYMENT_INFO(state, info) {
    state.info = info;
  },
  SET_GOODSLIST(state, goodsList) {
    state.goodsList = goodsList;
  },
  SET_POLLING_TIMER(state, timer) {
    state.polling.timer = timer;
  },
  UPDATE_PAYMENT_STATUS(state, status) {
    state.is = Boolean(status);
  },
  UPDATE_PINPAD_STATUS(state, status) {
    state.pinpadDone = Boolean(status);
  },
  UPDATE_INPUT_SUM(state, sum) {
    state.sum.input = sum;
  },
  UPDATE_GOODSLIST_INFINITE(state) {
    state.goodsList[0].Price = state.sum.input;
  },
  DEBUG_ADD_INPUT_SUM(state, sum) {
    state.sum.input += sum;
  },
  CLEAR_PAYMENT_STATE(state) {
    Object.assign(state, getDefaultPaymentState());
    log.step(`Очищен модуль стора: payment`);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
