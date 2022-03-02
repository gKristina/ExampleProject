/*************************************************
 *  Обработчики вызываемые приложением Terminal  *
 *************************************************/

import store from "@/store/store";
import { sendIsMainPage } from "@/helpers/externals";
import { log } from "@/helpers/log";
import { debounce } from "@/helpers/utils";
import { PAYMENT } from "@/helpers/constants/payment";
import { dino } from "@/helpers/emitters/dino";

const CurrentPageMain = status => sendIsMainPage(status);

/**
 * Переопределяем обработчик запроса статуса находится ли приложение на главной
 */
window.CurrentPageMain = CurrentPageMain;

/**
 * Переход на главную страницу
 * Адаптированная версия под новый интерфейс
 */
window.Main = () => CurrentPageMain(true);

/**
 * Определяет условия по которым терминал считается свободен и может выполнять удаленные команды
 * (Переопределяем обработчик)
 * @return {boolean}
 */
window.IsMain = () => store.state.isMainPage;

/**
 * Переопределяем обработчик запуска легаси-таймаута
 */
window.StartTimeOut = () => {};

/**
 * Вызывается, когда вводится номинал
 * Переопределяем
 * @param {string} sum Размер номинала
 * @param {string} type Тип (banknote / coin)
 */
window.moneyinchange = (sum, type) => {};

/**
 * Переопределяем обработчик обновления количества денег для зачисления на счёт
 * @param {string} sum
 */
window.moneyacctchange = sum => {};

/**
 * Переопределяем обработчик обновления процентов комиссии
 * @param {string} sum
 */
window.moneypercentchange = sum => {};

/**
 * Переопределяем обработчик обновления количества денег для сдачи
 * @param {string} sum
 */
window.moneychange = sum => {};

/**
 * Переопределяем обработчик обновления оставшегося количества денег для ввода
 * @param {string} sum
 */
window.moneyneeded = sum => {};

/***
 * ???
 * @param something
 */
window.Basket_isClientExistResponse = something => {};

/**
 * Получение структуры инкассации после инкассации
 * @param inkassData
 */
window.DoInKass = inkassData => {};

/**
 * ???
 * @param login
 */
window.GetPageAfterDisribution = login => {};

/***
 * ???
 * @param string
 */
window.MoneyInBillNominal = string => {};

/**
 * Переопределяем обработчик отрисовки модального окна
 * @param id ... элемента, который отвечает за модалку(НЕ НУЖНО)
 * @param action 1 - показать, 0 - скрыть
 * @param message текст
 * @param timer *не тестировалось*
 */
window.OnlineDiv = (id, action, message, timer) => {
  if (typeof message === 'string' && message.length) {
    if (message.includes('Please, wait')) {
      return;
    }
    if (message.includes('получится больше')) {
      log.error('Установлен неверный гейт! Платёж будет прерван');
      store.dispatch('payment/interrupt', PAYMENT.INTERRUPT_REASON.INVALID_GATE);
      return;
    }
    
    dino.emit('message', message.replace(/<.+?>/g, ''));
  }
};

/**
 * Переопределяем обработчик для вызова страницы ошибки проведения операции
 */
window.CardFail = () => {
  log.warn('Отказ по карте от банковского модуля');
  store.dispatch('payment/interrupt', PAYMENT.INTERRUPT_REASON.CARD_FAIL);
};

/**
 * Переопределяем обработчик для вызова страницы печати чека по наличной оплате
 */
window.ShowPrintCheckPage = debounce(() => {
  store.dispatch('payment/finalize');
}, 2000);

/**
 * Переопределяем обработчик для вызова страницы печати чека после успешной операции по безналичной оплате
 */
window.PayConfirmNew = debounce(() => {
  store.dispatch('payment/handleCardSuccess');
}, 2000);

/**
 * Обработка полученных со сканера данных
 * @param {String} data
 */
const extHandleBarCode = data => {
  log.info(`Приложение вызвало обработчик баркодов с параметром: ${data}`);
  dino.emit('barcode', data);
};

window.extHandleBarCode = extHandleBarCode;

/**
 * Универсальный обработчик возврата
 * @param actual {String} сумма сколько вышло по факту
 * @param required {String} сумма сколько надо было выдать
 * @param method {boolean} True - безнал, False - нал
 */
const handleRefund = (actual, required, method) => {
  log.step(`Возврат денег закончен. Выдано ${actual} из ${required} по ${method ? 'безналу' : 'налу'}`);
  
  store.dispatch('refund/finalize', {
    sum: {
      actual,
      required,
    },
    type: method ? PAYMENT.TYPE.CARD : PAYMENT.TYPE.CASH,
  });
};

window.handleRefund = handleRefund;

/**
 * Обработчик успешного возврата денег
 * @param actualSum {String} сумма сколько вышло по факту
 * @param requiredSum {String} сумма сколько надо было выдать
 * @param method {boolean} True - безнал, False - нал
 */
window.ReturnSuccess = handleRefund;

/**
 * Обработчик неуспешного возврата денег
 * @param actualSum {String} сумма сколько вышло по факту
 * @param requiredSum {String} сумма сколько надо было выдать
 * @param method {boolean} True - безнал, False - нал
 */
window.ReturnFail = handleRefund;
