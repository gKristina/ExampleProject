/*****************************
 *  Вспомогательные функции  *
 *****************************/

import { log } from '@/helpers/log';
import store from '@/store/store';
import {
  addCheckParameter,
  addPaymentParameters,
  getCurrentSession,
  getDBKey,
  getKKMReady,
  getPaymentParameters,
  setDBKey
} from '@/helpers/externals';
import { ExternalBasket } from '@/helpers/mappers/ExternalBasket';
import { CashboxPayment } from '@/helpers/mappers/CashboxPayment';
import { PaymentInfo } from '@/helpers/mappers/PaymentInfo';
import axios from 'axios';

/**
 * Ожидание проверки готовности кассы
 * @return {Promise<*>}
 */
export function waitPaymentReady() {
  try {
    if (store.getters["settings/mockEnabled"]) {
      log.debug('Имитируем готовность кассы');
      return Promise.resolve();
    } else return new Promise(resolve => {
      log.step('Начинаем проверять готовность ККМ к проведению следующего платежа и печати');
      
      const maxChecks = 60;
      let check = 0;
      
      const polling = setInterval(() => {
        if (check++ >= maxChecks) {
          log.warn('Таймаут ожидания готовности ККМ');
          clearInterval(polling);
          resolve();
        }
        
        if (getKKMReady()) {
          log.step('ККМ готова');
          clearInterval(polling);
          resolve();
        }
      }, 1000);
    });
  } catch (e) {
    log.error(e);
    return Promise.resolve();
  }
}

/**
 * Внесение недостающей суммы в кассу
 * @param {number} sumToAdd сумма для внесения
 * @param {number} cashbox касса, по умолчанию 0 (первая)
 * @return {Promise<>}
 */
/**
export async function addMissingMoneyToKKM(sumToAdd, cashbox = 0) {
  log.debug('Внесение недостающей суммы в кассу');
  
  sumToAdd = Number(sumToAdd);
  if (Number.isNaN(sumToAdd)) {
    return Promise.reject();
  }
  
  log.step(`Проверяем наличие ${sumToAdd} руб. в кассе \
  const cashboxSum = await new Promise(resolve => {
    const sum = getKKMCash(cashbox);
    log.step(`В кассе сейчас: ${sum}`);
    
    setTimeout(async () => {
      await waitPaymentReady();
      resolve(sum);
    }, 200);
  })
  
  if (Number(cashboxSum) < sumToAdd) {
    log.step('В кассе нехватает денег');
    
    return new Promise(resolve => {
      log.step('Вносим указанную сумму в кассу');
      addKKMCash(cashbox, sumToAdd);
      setTimeout(async () => {
        await waitPaymentReady();
        resolve();
      }, 200);
    });
  } else {
    log.step('В кассе достаточно денег');
    return Promise.resolve();
  }
}

/**
 * Возвращает случайное целое число между min (включительно) и max (не включая max)
 * @param min минимум
 * @param max максимум
 * @return {Number}
 */
export function getRandomIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Установить корзину для старого бэкенда
 * (в текущей реализации предполагается, что разработчик сам переписывает функцию под себя. Это можно как-то улучшить)
 * @param {object} list объект списка корзины или подобный ему
 * @return {String} итоговый JSON номенклатуры
 */
export function setBasket(list) {
  log.step(`Устанавливаем корзину${list ? ' через параметр' : ''}`);
  
  const basketList = Object.keys(list)
    .map(id => list[id])
    .map(({
            id: gate,
            name,
            price,
            amount
          }) => ({
      gate,
      name,
      price,
      amount,
    }));
  
  let basketStr = '<?xml version="1.0" encoding="utf-16"?><ArrayOfInterfaceBasketStructure>';
  basketList.forEach(item => {
    for (let i = 0; i < item.amount; i++) {
      basketStr += '<InterfaceBasketStructure>' +
        `<GateID>${item.gate}</GateID>` +
        `<ExecutorID>621</ExecutorID>` +
        `<Summ>${item.price}</Summ>` +
        `<Steps>${item.name};</Steps>` +
        `</InterfaceBasketStructure>`;
    }
  });
  basketStr += '</ArrayOfInterfaceBasketStructure>';
  
  addPaymentParameters('InterfaceBasket', basketStr);
}

/**
 * Ожидает, когда бэкенд заполнит BasketStr и возвращает его в resolve в случае успеха и строку 'timeout' в reject в случае таймаута
 * @param {Number} [timeout=30] таймаут, в секундах (по умолчанию 30)
 * @param {Number} [delay=300] задержка проверки, в миллисекундах (по умолчанию 300)
 * @return {Promise<ExternalBasket>}
 */
export function waitBasket(timeout = 30, delay = 300) {
  log.step('BasketStr отсутствует, ждём бекэнд');
  
  return new Promise((resolve, reject) => {
    let trynum = 0;
    const maxtries = Math.round(timeout * 1000 / delay);
    check();
    
    function check() {
      trynum++;
      if (trynum < maxtries) {
        const xml = getPaymentParameters('BasketStr')
          .replace(/&#x1;/g, '');
        
        if (xml.length) {
          log.step(`BasketStr получен (длина xml: ${xml.length})`);
          const basket = require('fast-xml-parser').parse(xml)?.BasketStructure || {};
          basket.source = xml;
          resolve(new ExternalBasket(basket));
        } else {
          setTimeout(check, delay);
        }
      } else {
        log.step('Таймаут ожидания BasketStr');
        resolve(new ExternalBasket());
      }
    }
  });
}

/**
 * Получить информацию по последнему проведённому платежу
 * @return {Promise<PaymentInfo>}
 */
export async function getLastPayment() {
  const payment = await getLastPaymentFromCashbox(store.getters["settings/cashboxDebug"]);
  const basket = await waitBasket();
  log.debug(JSON.stringify(payment, null, 2));
  
  return new PaymentInfo(payment, basket);
}

/**
 * Получить данные последнего платежа из бд кассы
 * @param {boolean} [debug] Будет использоваться база кассы, которая лежит рядом с php-скриптом
 * @return {Promise<CashboxPayment|String>}
 */
export function getLastPaymentFromCashbox(debug) {
  log.step('Получаем номер чека из базы данных кассы');
  
  const session = getCurrentSession();
  const url = `${resolveLocalApi()}/get_last_payment.php`;
  const body = {
    dbNumber: store.getters["settings/dbNumber"],
    dev: Boolean(debug)
  };
  const options = {
    method: 'post',
    headers: {
      'Pragma': 'no-cache',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: queryParams(body),
  };
  
  return axios(url, options)
    .then(async result => {
      log.debug('Ответ сервера по запросу на номер чека: ', result);
      result = result.data;
      
      if (typeof result !== "string" && result.status) {
        return new CashboxPayment(result.body);
      } else {
        log.error(`Не удалось получить номер чека (№ сессии: ${session}). Причина (из PHP): ${result?.error ?? result}`);
        return {};
      }
    })
    .catch((response, options) => {
      if (typeof response.data === "string") {
        log.error(`Сервер вернул не JSON: ${response.data}`);
        return {};
      }
      
      const httpCode = response.status;
      
      if (!httpCode) {
        log.error('Не удалось выполнить запрос');
        return {};
      }
      
      const responseDataRaw = response.data.body;
      
      if (!(httpCode >= 200 && httpCode < 300)) {
        // Сервер ответил кодом не 2xx
        log.error(`Ошибка выполнения запроса, код ответа: ${httpCode}:
          ${responseDataRaw}`);
        log.debug(`Конфигурация запроса: ${JSON.stringify(options, null, 2)}`);
        return {};
      }
      
      if (typeof response.data === "string") {
        return response.data;
      } else {
        log.warn(`Сервер вернул не JSON: ${response.data.body}`);
        return {};
      }
    });
}

/**
 * Преобразует секунды в минуты и секунды
 * @param number секунды
 * @returns {number[]} массив вида [минуты, секунды]
 */
export function secondsToMinutesSeconds(number) {
  if (typeof number === 'string') number = Number(number);
  return [Math.floor(number / 60), number % 60]
}

/**
 * Возвращает подходящее название для указанного времени
 * @param number количество секунд/минут/...
 * @param array массив строк, типа ['минута', 'минуты', 'минут'] или ['minute', 'minutes']
 * @param lang язык ru/en
 * @returns string
 */
export function timeToString(number, array, lang) {
  if (typeof number === 'string') number = Number(number);
  if (typeof array === 'string') return array;
  if (lang === 'ru') {
    let tens = number % 100;
    let ones = number % 10;
    if (tens > 10 && tens < 20) return array[2];
    if (ones > 1 && ones < 5) return array[1];
    if (ones === 1) return array[0];
    return array[2];
  } else if (lang === 'en') {
    if (number === 1) return array[1];
    else return array[0];
  }
}

/**
 * Функция пересчёта номенклатуры, если итоговая сумма уменьшена (например, за счёт скидок или бонусов)
 * @param {String|Array<Object>} JSONArray
 * @return {Array<Object>}
 */
export function scatterPrice(JSONArray) {
  const priceLabel = 'Цена',
    amountLabel = 'Количество',
    sumLabel = 'СуммаВсего',
    nameLabel = 'Товар',
    
    department = 1,
    taxGroup = 4,
    tax2 = 0,
    tax3 = 0,
    tax4 = 0;
  
  let goods;
  const integralQuantities = [];
  
  if (Array.isArray(JSONArray)) {
    goods = JSONArray;
  } else if (typeof JSONArray === 'string') {
    goods = JSON.parse(JSONArray);
  } else {
    throw new TypeError('В качестве JSONArray ожидался массив или его JSON');
  }
  
  goods
    .filter(function (item) {
      return !(item[amountLabel] % 1); // получаем массив с целыми количествами
    })
    .forEach(function (item) {
      const price = Number(item[priceLabel]);
      const count = Number(item[amountLabel]);
      const total = Number(item[sumLabel]) * 100; // переходим к работе с копейками
      const solidPrice = Math.floor(total / count);
      const prices = [];
      
      for (let i = 0; i < count; i++) {
        prices.push(solidPrice);
      }
      
      let remainder = total % count;
      if (remainder > 0.0001) {
        let j = 0;
        while (remainder > 0) {
          prices[j]++;
          remainder--;
          j++;
          if (j === prices.length) j = 0;
        }
      }
      
      let outPrices = {};
      prices.forEach(function (item) {
        if (!(item in outPrices)) {
          outPrices[item] = 1;
        } else {
          outPrices[item]++;
        }
      });
      
      for (let tPrice in outPrices) {
        integralQuantities.push({
          Department: department,
          Name: item[nameLabel].substr(0, 100),
          Price: Number(tPrice) / 100,
          Quantity: outPrices[tPrice],
          Tax1: taxGroup,
          Tax2: 0,
          Tax3: 0,
          Tax4: 0,
          Discount: Math.round(price * count * 100 - total) / 100
        });
      }
    });
  
  const decimalQuantities = goods
    .filter(function (item) {
      return item[amountLabel] % 1; // получаем массив с дробными количествами
    })
    .map(function (item) {
      const price = Number(item[priceLabel]);
      const count = Number(item[amountLabel]);
      const total = Number(item[sumLabel]) * 100; // переходим к работе с копейками
      return {
        Department: department,
        Name: item[nameLabel].substr(0, 100),
        Price: item[priceLabel],
        Quantity: item[amountLabel],
        Tax1: taxGroup,
        Tax2: tax2,
        Tax3: tax3,
        Tax4: tax4,
        Discount: Math.round(price * count * 100 - total) / 100
      };
    });
  
  return integralQuantities.concat(decimalQuantities);
}

/**
 * Пересчёт позиций номенклатуры вниз по количеству бонусов (пересчёт происходит НЕравномерно)
 * Функция не меняет исходные объекты
 * @param {Array<Object>} nomenclature номенклатура
 * @param {Number} bonuses разница между номинальной суммой и требуемой к оплате
 * @param {Object} labels имена полей в передаваемой номенклатуре
 * @returns {Object} Объект в формате { nomenclature: Object, bonuses: Number }, где bonuses - количество оставшихся бонусов
 */
export function calcdownNomenclatureWithBonuses(nomenclature, bonuses, labels) {
  const sumLabel = labels.sum;
  const priceLabel = labels.price;
  const amountLabel = labels.amount;
  const nameLabel = labels.name;
  
  if (!Array.isArray(nomenclature)) {
    throw new TypeError('Номенклатура должна быть массивом');
  }
  
  if (!nomenclature.every(isPojo)) {
    throw new TypeError('Позиции в номенклатуре должны быть объектами');
  }
  
  bonuses = Number(bonuses);
  if (isNaN(bonuses) || bonuses < 0) {
    throw new TypeError(`Бонусы не являются валидным числом или не могут быть приведены к нему: ${bonuses}`);
  }
  
  nomenclature = nomenclature.map(function (sourcePosition, i) {
    if (!sourcePosition.hasOwnProperty(sumLabel)
      || !sourcePosition.hasOwnProperty(priceLabel)
      || !sourcePosition.hasOwnProperty(amountLabel)
      || !sourcePosition.hasOwnProperty(nameLabel)
    ) {
      log.warn(`В позиции (индекс в массиве ${i}) не найдены все необходимые поля. Пересчёт для неё не будет выполнен`);
      return sourcePosition;
    }
    
    const position = JSON.parse(JSON.stringify(sourcePosition));
    
    if (bonuses && position[sumLabel] > 0) {
      if (position[sumLabel] < bonuses) {
        bonuses -= position[sumLabel];
        position[priceLabel] = 0;
        position[sumLabel] = 0;
      } else {
        position[sumLabel] = mathRound(position[sumLabel] - bonuses);
        bonuses = 0;
        
        const price = position[sumLabel] / position[amountLabel];
        if (price === Number(price.toFixed(2))) { // деление происходит без остатка по копейкам
          position[priceLabel] = price;
        } else {
          position[priceLabel] = position[sumLabel];
          position[nameLabel] += ` ${position[amountLabel]} шт.`;
          position[amountLabel] = 1;
        }
      }
    }
    
    return position;
  });
  
  return {
    nomenclature: nomenclature,
    bonuses: bonuses,
  };
  
  function mathRound(value, decimals) {
    if (decimals < 0 || decimals === undefined) decimals = 2;
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
  }
}

/**
 * Включает работу с кассой через старый бэк
 */
export function enableLegacyCashbox() {
  log.step('Включена работа с кассой через старый бэк');
  setDBKey('isFiskal', '1');
}

/**
 * Выключает работу с кассой через старый бэк
 */
export function disableLegacyCashbox() {
  log.step('Отключена работа с кассой через старый бэк');
  setDBKey('isFiskal', '0');
}

/**
 * Проверяет является ли переданное значение объектом
 * @param {*} obj
 * @returns {boolean}
 */
export function isPojo(obj) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  
  return Object.getPrototypeOf(obj) === Object.prototype;
}

/**
 * Является ли строка валидным URL-адресом
 * @param {string} url
 * @returns {boolean}
 */
export function isValidURL(url) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  
  return !!pattern.test(url);
}

/**
 * Является ли исполняемая среда терминалом
 * @returns {boolean}
 */
export function isTerminal() {
  return 'START_BILL' in external;
}

/**
 * Включена ли работы с несколькими кассами
 * @returns {boolean}
 */
export function isMultiMerchant() {
  return getDBKey('isMultiMerchant').toLowerCase() === 'true';
}

/**
 * Составить строку параметров из объекта
 * @param {object} source
 * @return {string}
 */
export function queryParams(source) {
  return Object.entries(source)
    .map(pair => `${encodeURIComponent(pair[0])}=${encodeURIComponent(pair[1])}`)
    .join('&');
}

/**
 * @param fn
 * @param ms
 * @return {function}
 */
export function debounce(fn, ms) {
  let prevent = false;
  
  return (...args) => {
    if (prevent) return;
    
    prevent = true;
    fn.apply(this, args);
    
    setTimeout(() => prevent = false, ms);
  };
}

export function resolveLocalApi() {
  return 'http://ecashier';
}

/**
 * Подготовить квитанцию (на нефискальном режиме)
 * ##Не вызывать больше одного раза за жизненный цикл
 * @param {object} data Объект опций вида<br/>
 * {
 *   nomenclature: [
 *    {
 *     name: 'Товар',
 *     quantity: 2,
 *     price: 10,
 *     sum: 20,
 *     discount: 0 // опционально
 *    },
 *    ...
 *   ],
 *   labels: {
 *     name: 'name',
 *     quantity: 'quantity',
 *     price: 'price',
 *     sum: 'sum',
 *     discount: 'discount', // опционально
 *   }
 * }
 */
export function prepareReceipt(data) {
  const maxLength = 35; // прописывается вручную
  const breakLine = '{br}';
  
  if (
    typeof data !== "object"
    || !Array.isArray(data.nomenclature)
    || typeof data.labels !== "object"
  ) {
    log.error('Передана неверная структура данных\n' + JSON.stringify(data, null, 2));
    return;
  }
  
  Object.values(data.nomenclature).forEach(function (el, i) {
    let name = el[data.labels.name];
    let index = maxLength;
    
    while (maxLength > 0 && name.substring(index).length > maxLength) {
      const substr = name.substring(0, index);
      const lastSpace = substr.lastIndexOf(' ');
      
      if (lastSpace !== -1) {
        name = substr.substring(0, lastSpace) + breakLine + name.substring(lastSpace + breakLine.length);
        index += breakLine.length;
      }
      
      index += maxLength;
    }
    
    const quantity = el[data.labels.quantity];
    const discount = el[data.labels.discount];
    const sum = el[data.labels.sum];
    const amountSpacer = ' '.repeat(maxLength - String(quantity).length - 2);
    const sumSpacer = ' '.repeat(maxLength - String(sum).length - 7);
    
    let text = name + breakLine +
      amountSpacer + 'x ' + quantity + breakLine +
      sumSpacer + 'ИТОГО: ' + sum;
    
    if (discount) {
      text += breakLine + ' '.repeat(maxLength - String(discount).length - 8) + 'СКИДКА: ' + discount;
    }
    
    addCheckParameter('-' + i, text);
  });
}

export function generateRandomNumberWithLength(length) {
  let number = '';
  
  if (typeof length !== "number" || isNaN(length)) {
    length = 1;
  }
  
  while (length) {
    const current = length > 15 ? 15 : length;
    number += genSafeNumber(current);
    length -= current;
  }
  
  return number;
  
  function genSafeNumber(length) {
    const order = Math.pow(10, length - 1);
    return Math.floor(order + Math.random() * 9 * order)
  }
}

/**
 * Проверка утверждения
 * @param {*} assertion утверждение
 * @param {*} [message=Assertion failed] сообщение
 * @param {boolean} [throwException=false] true - выбросить ошибку, false - сообщение в лог
 * @return {Boolean}
 */
export function assert(assertion, message, throwException = false) {
  if (assertion) {
    return true;
  } else {
    if (throwException) {
      throw new Error(message || 'Assertion failed');
    } else {
      if (message) {
        log.warn(message);
      }
      
      return false;
    }
  }
}

/**
 * Округлить число
 * @param {number|string} value
 * @param {number} [decimals=2]
 * @return {number}
 */
export function mathRound(value, decimals) {
  if (decimals < 0 || decimals === undefined) decimals = 2;
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

/**
 * Выделить телефон и префикс из строки
 * @param {string} value
 * @returns {{phone: string, prefix: string}}
 */
export function parsePhoneNumber(value) {
  const numLength = value.length;
  const phoneLength = 7;
  const prefixEndIndex = numLength - phoneLength;
  return {
    prefix: value.substring(0, prefixEndIndex),
    phone: value.substring(prefixEndIndex, numLength)
  };
}
