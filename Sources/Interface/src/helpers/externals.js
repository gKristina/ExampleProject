/******************************
 *  Запросы к внутренним API  *
 ******************************/

import { log } from "@/helpers/log";
import { generateRandomNumberWithLength } from "@/helpers/utils";
import store from '@/store/store';

/**
 * Является ли исполняемая среда терминалом
 * @returns {boolean}
 */
function isTerminal() {
  return 'START_BILL' in external;
}

/**
 * Базовая функция логирования
 * Рекомендуется использовать функцию log
 * @param {string} text
 */
export function saveLog(text) {
  'SaveErrorInLog' in external && external.SaveErrorInLog(text);
}

/**
 * Включение чтения баркодов
 */
export function enableBarcode() {
  log.info('Отправлена команда на включение чтения баркода');
  'EnableBarCode' in external && external.EnableBarCode();
}

/**
 * Отключение чтения баркодов
 */
export function disableBarcode() {
  log.info('Отправлена команда на отключение чтения баркода');
  'DisableBarCode' in external && external.DisableBarCode();
}

/**
 * Перенаправление на страницу
 * @param url
 */
export function link(url) {
  log.step(`Переход на: ${url}`);
  if (isTerminal()) 'LINK' in external && external.LINK(url);
  else location.href = url;
}

/**
 * Отправка сообщения на бэкенд, что интерфейс жив и перезагружать страницу не нужно
 */
export function pingInterface() {
  'PingInterface' in external && external.PingInterface();
}

/**
 * Запуск купюроприёмника
 */
export function startBill() {
  log.info('Купюроприёмник запущен');
  'START_BILL' in external && external.START_BILL();
}

/**
 * Остановка купюроприёмника. После первой команды нужно повторить её через 5 секунд
 */
export function stopBill() {
  log.info('Купюроприёмник остановлен');
  'STOP_BILL' in external && external.STOP_BILL();
}

/**
 * Получить информацию из локальной БД (sqlite3) по ключу
 * @param key {string}
 * @returns {string}
 */
export function getDBKey(key) {
  key = String(key);
  let data;
  
  const useDevIntegration = store.getters["settings/isDebug"]
    && store.getters["settings/devIntegration"]
    && key.includes('IntegrationVal');
  
  if (useDevIntegration) {
    return store.getters["settings/devIntegrationValues"][key.slice(-1)];
  }
  
  if (isTerminal()) {
    if ('GetKeyForInterface' in external) {
      data = external.GetKeyForInterface(key);
    } else {
      data = null;
    }
  } else {
    if (!('terminalDebugDB' in window)) {
      window.terminalDebugDB = {};
    }
  
    data = window.terminalDebugDB[key];
  }
  
  log.debug(`Получено значение по ключу ${key}: ${data}`);
  return data;
}

/**
 * Записать информацию в локальную БД (sqlite)
 * @param {string} key
 * @param {string|any} value
 */
export function setDBKey(key, value) {
  value = String(value);
  log.debug(`Записываем в базу по ключу ${key} значение ${value}`);
  if (isTerminal()) {
    'SetKeyFromInterface' in external && external.SetKeyFromInterface(key, value);
  } else {
    if (!('terminalDebugDB' in window)) {
      window.terminalDebugDB = {};
    }
    
    window.terminalDebugDB[key] = value;
  }
}

/**
 * Получить текущую введённую сумму
 * @return {number}
 */
export function getPaymentInput() {
  return ('RetACCT' in external && external.RetACCT()) ?? 0;
}

/**
 * -1 = no devices
 * 1 = cup
 * 2 = card only
 * 3 = coins
 * 4 = all
 * @returns {Number}
 */
export function getPaymentMethod() {
  return ('GetTypeOfMoneyIn' in external && external.GetTypeOfMoneyIn()) ?? 4;
}

export function startPinpad() {
  log.info('Пинпад включён');
  'StartPinPad' in external && external.StartPinPad();
}

/**
 * Получить таймаут пинпада
 * @param {number} [debugVal], в миллисекундах
 * @returns {number}
 */
export function getPinpadTimeout(debugVal) {
  try {
    const defaultVal = 90 * 1000;
    let val;
    
    if (debugVal) {
      val = debugVal * 1000;
      log.info(`Получено отладочное значение таймаута пинпада: ${val} мс`);
    } else {
      val = 'GetPinPadTimeOut' in external && external.GetPinPadTimeOut() || defaultVal;
      log.info(`Получено значение таймаута пинпада: ${val} мс`);
    }
    
    return val;
  } catch (e) {
    log.error(e);
  }
}

/**
 * Установить сумму к оплате
 * @param {number} sum
 */
export function setPaymentSum(sum) {
  log.info(`Установлена необходимая сумма для оплаты: ${sum}`);
  
  sum = Number(sum);
  
  'SetFixedSumTxt' in external && external.SetFixedSumTxt(sum);
  addPaymentParameters("Acct", sum);
  addPaymentParameters("FixedSum", sum);
}

/**
 * Получить текущую сумму к оплате
 * @return {number}
 */
export function getPaymentSum() {
  let val = ('RetFixedSum' in external && external.RetFixedSum()) ?? 0;
  
  if (typeof val === "string") {
    val = val.replace(',', '.');
  }
  
  val = Number(val);
  if (Number.isNaN(val)) {
    val = 0;
  }
  
  return val;
}

/**
 * **Отладочная функция**<br>
 * Установка введённой суммы на этапе оплаты наличными
 * @param {number} sum - целочисленное
 */
export function setInputSum(sum) {
  sum = Number(sum);
  
  if (Number.isNaN(sum)) {
    sum = 0;
  }
  
  'SetXrub' in external && external.SetXrub(sum);
}

/**
 * Начинает новую транзакцию<br>
 * *существующий объект транзакции в приложении перезаписывается*
 * @param {number} gateID
 * @returns 0 - если печать доступна и -1 если печать чека в обратном случае
 */
export function startPayCycle(gateID) {
  log.info(`Самир, спешу сообщить, что мы вызвали StartPayCycle с гейтом ${gateID}`);
  
  gateID = parseInt(String(gateID));
  
  if (isNaN(gateID)) {
    log.warn('Переданный gateID не является числом');
    gateID = -1;
  }
  
  let result;
  if (isTerminal() && 'StartPayCycleJavaInt' in external) {
    result = external.StartPayCycleJavaInt(0, gateID);
  } else {
    startPayCycle.value = generateRandomNumberWithLength(21);
  }
  log.info(`Отправлен запрос на старт платёжного цикла с параметрами 0 и gateID '${gateID}.`);
  
  return result;
}

/**
 * Установить значение шага
 * @param {number} stepnum
 * @param value
 */
export function setStepValue(stepnum, value) {
  value = String(value);
  log.info(`Установлено значение шага № ${stepnum}: ${value}`);
  'SetStepVal' in external && external.SetStepVal(stepnum, value);
}

/**
 * Получить значение шага
 * @param {number} number
 * @returns {*|undefined}
 */
export function getStepValue(number) {
  return ('RetStepVal' in external && external.RetStepVal(number)) ?? undefined;
}

/**
 * Получить параметр платежа по ключу
 * @param key
 * @return {string || undefined}
 */
export function getPaymentParameters(key) {
  let value;
  if ('RetAdditionalPaymentParameters' in external) {
    value = external.RetAdditionalPaymentParameters(key);
  } else {
    value = undefined;
  }
  
  log.info(`Получен дополнительный параметр шага № ${key}: ${value}`);
  return value;
}

/**
 * Установить параметр платежа по ключу
 * @param {string} key
 * @param {number|string} value
 */
export function addPaymentParameters(key, value) {
  log.info(`Установлен дополнительный параметр шага № ${key}: ${value}`);
  'AddAdditionalPaymentParameters' in external && external.AddAdditionalPaymentParameters(key, value);
}

/**
 * Установить параметр чека
 * @param {string} key Если добавить дефис перед ключом, то ключ будет проигнорирован
 * @param {string} value
 */
export function addCheckParameter(key, value) {
  'AddCheckParameter' in external && external.AddCheckParameter(key, value);
  log.info(`Установлена дополнительная строчка чека - ${key}: ${value}`);
}

/**
 * Отмена платежа по наличной оплате
 */
export function sendPaymentCancel() {
  log.debug('PaymentCancel вызван');
  'PaymentCancel' in external && external.PaymentCancel();
}

export function sendPayConfirmNew() {
  if ('PayConfirmNew' in external) {
    'PayConfirmNew' in external && external.PayConfirmNew();
    return true;
  } else {
    log.error('external.PayConfirmNew не существует');
    if (!isTerminal()) {
      setTimeout(window.ShowPrintCheckPage);
    }
    return false;
  }
}

/**
 * Выполнить прямую продажу через кассу
 * @param {number} cashbox Номер кассы (отсчёт с нуля)
 * @param {number} sum Сумма
 * @param {number} taxgroup Налоговая группа
 * @param {number} amount Количество
 * @param {number} department Отдел
 * @param {number} operation Название позиции
 * @param {number} paymentoption 1 - наличные, 2 - МИР, 3 - VISA, 4 - MasterCard
 * @param {number} [discount=0] Скидка на позицию
 */
export function executeDirectPaymentSingle(cashbox, sum, taxgroup, amount, department, operation, paymentoption, discount) {
  log.debug(`${cashbox}, ${sum}, ${taxgroup}, 0, 0, 0, ${amount}, ${department}, ${operation}, ${paymentoption}, ${discount}`);
  'admmenukkmsale' in external && external.admmenukkmsale(cashbox, sum, taxgroup, 0, 0, 0, amount, department, operation, paymentoption, discount);
}

/**
 * Выполнить прямую продажу через кассу
 * @param {number} cashbox Номер кассы (отсчёт с нуля)
 * @param {CASH|CARD} type тип оплаты
 * @param {Array<GoodsListItem>|string} goodslist номенклатура
 */
function executeDirectPayment(cashbox, type, goodslist) {
  log.debug(cashbox + ', ' + type + ', ' + goodslist);
  
  if (Array.isArray(goodslist)) {
    goodslist = JSON.stringify(goodslist);
  }
  
  'admmenukkmsale2' in external && external.admmenukkmsale2(cashbox, type, goodslist);
}

/**
 * Генерация уникального GUID
 * @return {string}
 */
export function generateGUID() {
  if (isTerminal() && 'RetNewGuid' in external) {
    return external.RetNewGuid();
  } else {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // noinspection EqualityComparisonWithCoercionJS
      let r = Math.random() * 16 | 0,
        v = c == 'x'
            ? r
            : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Получить текущий номер сессии
 * @return {String}
 */
export function getCurrentSession() {
  if ('RetCurrentSession' in external) {
    return external.RetCurrentSession();
  } else {
    if (getCurrentSession.payCycle !== startPayCycle.value) {
      getCurrentSession.payCycle = startPayCycle.value;
      getCurrentSession.value = generateRandomNumberWithLength(21);
    }
    
    return getCurrentSession.value;
  }
}

/**
 * Получить ID дилера в платёжной системе
 * @return {*}
 */
export function getDealerID() {
  return 'RetGetDealerID' in external && external.RetGetDealerID();
}

/**
 * Получить текущий номер инкассации
 * @return {*}
 */
export function getCurrentEncashment() {
  return 'RetCollectionCheckNumber' in external && external.RetCollectionCheckNumber();
}

/**
 * Получить номер терминала
 * @return {*}
 */
export function getTerminalNumber() {
  return 'RetTerminalNumberSystemMini' in external && external.RetTerminalNumberSystemMini();
}

/**
 * Получить имя терминала
 * @return {*}
 */
export function getTerminalName() {
  return 'RetTerminalName' in external && external.RetTerminalName();
}

/**
 * Получить статус готовности кассы
 * (Базовая функция) Используйте extGetPaymentReady
 * @return {*}
 */
export function getKKMReady() {
  if (isTerminal()) {
    return 'CanIStartNewPayment' in external && external.CanIStartNewPayment();
  } else {
    return true;
  }
}

/**
 * Принудительная очистка кэша
 * #ОСТОРОЖНО!
 * ##Вызывает модальное окно поверх окна терминала
 */
export function clearCache() {
  'ClearInetCash' in external && external.ClearInetCash();
}

/**
 * Отправить запрос на печать
 */
export function printPDF() {
  'KDL_PrintPDF' in external && external.KDL_PrintPDF();
}

/**
 * Поменять текущий интерфейс
 * @param {string} skinName
 */
export function changeInterface(skinName) {
  'ChangeInterface' in external && external.ChangeInterface(skinName);
}

/**
 * Перенаправление на страницу
 * @param url
 */
export function linkTo(url) {
  log.step('Переход на: ' + url);
  if ('LINK' in external) external.LINK(url);
  else {
    log.error('external.LINK не существует');
    location.href = url;
  }
}

/**
 * (Переопределяем функцию)
 * Отправка на бэк статуса на главной ли интерфейс
 * @param {boolean} status true - на главной, false - на другой странице
 */
export function sendIsMainPage(status) {
  'CurrentPageMain' in external && external.CurrentPageMain(status);
}

/**
 * Произвести возврат денег
 * @param {number} sum сумма
 * @param {string} [nomenclature='Выдача'] номенклатура
 * @param {number} refNumber номер ссылки (0, если нал)
 * @param {number} authCode код авторизации (0, если нал)
 * @param {number} paymentType тип оплаты (1 - безнал, 0 - нал)
 * @param {string} goodsList
 */
export function returnPayment(sum, nomenclature = 'Выдача', refNumber, authCode, paymentType, goodsList) {
  const isReturn = 1; // должен быть 1
  log.debug('returnPayment');
  nomenclature = nomenclature.replace(/'/g, "\\'");
  
  setTimeout(() => { // откладываем выполнение запросов на бэк в конец очереди, чтобы его тяжелые операции не прервали JS-команды отправленные ранее
    'IsReturn' in external && external.IsReturn(); // выполняется в любом случае перед ReturnPaymentDo
    log.info(`external.ReturnPaymentDo(${sum}, '${nomenclature}', ${refNumber}, ${authCode}, ${paymentType}, '${goodsList}', ${isReturn})`);
    'ReturnPaymentDo' in external && external.ReturnPaymentDo(sum, `'${nomenclature}'`, refNumber, authCode, paymentType, `'${goodsList}'`, isReturn);
  });
}

/**
 * Произвести возврат денег
 * @param {number} cashbox Номер кассы (отсчёт с нуля)
 * @param {number} sum сумма
 * @param {number} taxgroup Налоговая группа
 * @param {number} amount Количество
 * @param {number} department Отдел
 * @param {string} operation Название позиции
 * @param {number}paymentoption 1 - наличные, 2 - МИР, 3 - VISA, 4 - MasterCard
 * @param {string} json Номенклатура
 * @param {number} accountingItem Признак предмета расчёта
 * @param {number} accountingType Признак способа расчёта
 */
export function refundADM(cashbox, sum, taxgroup, amount,
                          department, operation, paymentoption, json,
                          accountingItem, accountingType) {
  try {
    sum = String(sum).replace('.', ',');
    amount = String(amount).replace('.', ',');
    if ('admmenukkmreturn' in external) {
      external.admmenukkmreturn(cashbox, sum, taxgroup, 0, 0, 0, amount, department, operation,
        paymentoption, json, 1, accountingItem, accountingType);
    }
  } catch (e) {
    log.error(e);
  }
}

/**
 * Печать произвольного текста на чек
 * @param str {string}
 */
export function printCustomCheck(str) {
  if (typeof str === 'string' && str.length) {
    log.info('Отправлена команда на печать чека со следующим содержимым:\n' + str);
    'PrintFromInterface' in external && external.PrintFromInterface(str);
  } else log.error('На печать передана не строка или пустая строка');
}

/**
 * Получить самый главный GroupID, в котором находится интерфейс
 * @param [debugId] {number}
 * @return {number}
 */
export function getTopLevelGroupID(debugId) {
  if (debugId) return debugId;
  return 'RetTopLevelGroupID' in external && external.RetTopLevelGroupID();
}

/**
 * Получить гейты группы
 * @param {number} groupID
 */
export function getGroupGates(groupID) {
  return 'RetGatesForGroup' in external && external.RetGatesForGroup(groupID);
}

/**
 * Получить подгруппы группы
 * @param {number} groupID
 */
export function getGroupSubgroups(groupID) {
  return 'RetSubGroups' in external && external.RetSubGroups(groupID);
}

/**
 * Закрыть приложение терминала
 */
export function closeTerminal() {
  'Exit' in external && external.Exit();
}

/**
 * Узнать сколько денег в кассе
 * @param {number} cashbox - номер кассы
 * @return {number}
 */
export function getKKMCash(cashbox) {
  return 'GetKKMCashRegister' in external && external.GetKKMCashRegister(cashbox);
}

/**
 * Внести деньги в кассу
 * @param {number} cashbox - номер кассы
 * @param {number} amount - сумма для внесения
 */
export function addKKMCash(cashbox, amount) {
  'KKMCashIncome' in external && external.KKMCashIncome(cashbox, amount);
}

/**
 * Получить json по выбранному гейту
 * @param {number|string} id ID гейта
 * @returns {string}
 */
export function getGateJSON(id) {
  return 'RetGateJSON' in external && external.RetGateJSON(id) || '{}';
}

/**
 * Получить данные гейта
 * @param id ID гейта
 * @returns {object|null}
 */
export function getGateData(id) {
  id = Number(id);
  
  if ('RetGateJSON' in external) {
    const obj = JSON.parse(external.RetGateJSON(id));
    
    if ('GateID' in obj && obj.GateID === id) {
      return obj;
    }
  }
  
  return null;
}

/**
 * Получить номер терминала у дилера
 * @returns {number}
 */
export function getDealerTerminalNumber() {
  log.info('Получаем номер терминала у дилера');
  return Number('RetTerminalNumber' in external && external.RetTerminalNumber()) || 0;
}

/**
 * Адрес терминала
 * @returns {string}
 */
export function getTerminalAddress() {
  log.info('Получаем адрес терминала');
  return 'RetAddress' in external && external.RetAddress() || '';
}

/**
 * Номер терминала в платёжной системе
 * @returns {number}
 */
export function getPaymentSystemTerminalNumber() {
  log.info('Получаем номер терминала в платёжной системе');
  return Number('RetTerminalNumberSystemMini' in external && external.RetTerminalNumberSystemMini()) || 0;
}

/**
 * Возвращает пользователей текущего дилера
 * @return {string}
 */
export function getUsers() {
  return 'GetUsersJson' in external && external.GetUsersJson();
}

/**
 * Отправляет в личный кабинет для статистики информацию во время считывания баркодов
 * @param action
 * @param description
 */
export function sendUserEvent(action, description) {
  'UserActionAdd' in external && external.UserActionAdd(action, description);
  log.step(`Отправлено событие '${action}' с описанием '${description}'`);
}

/**
 * Получить SKUD-последовательность
 * @returns {number|null}
 */
export function getSkudSequence() {
  if (!isTerminal()) return 121;
  return 'RetSecretClick' in external && external.RetSecretClick() || null;
}

/**
 * Получить номер телефона техподдержки
 * @returns {string}
 */
export function getSupportPhone() {
  if (!isTerminal()) return '+7(123)456-78-90 ';
  return 'RetPhone' in external && external.RetPhone() || '';
}

/**
 * Получить SKUD-пароль
 * @param {string} [pass='0']
 */
export function checkSkudPass(pass = '0') {
  try {
    log.debug(`checkSkudPass(${pass}`);
    'InterCode' in external && external.InterCode(pass);
  } catch {
    // бэк выбрасывает нам ошибку, если передать пустую строку - игнорируем
  }
}

/**
 * Получить полученные номиналы по оплате
 * @returns {object}
 */
export function getPaymentNominals() {
  const nominals = {};
  let data;
  
  try {
    data = JSON.parse('GetCurrentNominals' in external && external.GetCurrentNominals());
  } catch {
    return nominals;
  }
  
  data.forEach(obj => {
    if (obj.hasOwnProperty('Nominal') && obj.hasOwnProperty('Count')) {
      nominals[obj.Nominal] = obj.Count;
    }
  });
  
  return nominals;
}

/**
 * Получить структуру монет в хоппере
 * @return {Object}
 */
export function getHopperNominals() {
  let data;
  const raw = 'GetCoinsFromHopper' in external && external.GetCoinsFromHopper();
  
  try {
    data = Object
      .entries(JSON.parse(raw))
      .reduce((obj, pair) => {
        const key = pair[0].replace('Coin', '');
        obj[key] = pair[1];
        return obj;
      }, {});
  } catch {
    log.error(`Экстернал GetCoinsFromHopper вернул не JSON: ${raw}`);
    data = {};
  }
  
  return data;
}

/**
 * Выбрать кассу<br>
 * (для работы с мультимерчант)
 * @param {string} inn
 * @return {Boolean} true - если касса найдена, false - если касса не найдена или экстернал отсутствует
 */
export function selectKKM(inn) {
  inn = String(inn);
  return 'SelectMultiMerchant' in external && Boolean(external.SelectMultiMerchant(inn)) || false;
}

/**
 * Получить параметры чека
 * @return {Object}
 */
export function getCheckParameters() {
  const params = {};
  
  if (isTerminal() && 'RetAdditionalPaymentParametersForCheck' in external) {
    const raw = external.RetAdditionalPaymentParametersForCheck() || '';
    
    if (!raw.length) return params;
    
    const result = Object.fromEntries(
      raw.split(';')
        .reduce((array, val, index) => {
          if (index % 2) {
            array.at(-1).push(val);
          } else {
            array.push([val]);
          }
          
          return array;
        }, [])
    );
    
    Object.assign(params, result);
  }
  
  return params;
}
