import { log } from "@/helpers/log";
import { assert } from "@/helpers/utils";
import { getDBKey, setDBKey } from "@/helpers/externals";

/**
 * @typedef ScheduleOptions
 * @type {object}
 * @property {*} [label]
 * @property {'async'|'sync'} [mode='async']
 * @property {number} [delay=false] фывафыва
 * @property {boolean} [debug=false]
 * @property {boolean} [autoStart=true]
 * @property {boolean} [single=false]
 * @property {function} executor
 */

/**
 * @typedef ScheduleItem
 * @type {object}
 * @property {number|string} id
 * @property {string|object} data Объект будет приведён к JSON
 */

export default {
  list: new Map(),
  get size() {
    return this.list.size;
  },
  
  /**
   * Создать очередь
   * @param {function|ScheduleOptions} options
   * @return {Schedule|null}
   */
  create(options) {
    assert(typeof options === "object" || typeof options === "function", 'Не заданы параметры очереди', true);
    
    if (options.label in this.list) {
      log.warn(`Очередь ${schedule.label} не может быть создана с таким же названием. Создание прервано`);
      return null;
    }
    
    if (typeof options === "function") {
      options = { executor: options };
    }
    
    let schedule;
    
    try {
      schedule = new Schedule(options);
    } catch (e) {
      log.error(e);
      return null;
    }
    
    this.list.set(schedule.label, schedule);
    
    if (schedule._autoStart) {
      log.step(`Автозапуск очереди${schedule.label === 'default' ? '' : ' ' + schedule.label}`);
      schedule.start();
    }
    
    return schedule;
  }
};

/**
 * Очередь
 * @param {ScheduleOptions} options
 * @return {string}
 * @constructor
 */
function Schedule(options) {
  const defaultDelay = 20 * 60 * 1000;
  
  const {
    executor,
    label = 'default',
    mode = 'async',
    debug = false,
    delay = defaultDelay,
    autoStart = true,
    single = false
  } = options;
  
  // Флаг отладки
  this._debug = debug;
  
  // Флаг инициализации очереди
  this._init = false;
  
  // Флаг автозапуска
  this._autoStart = Boolean(autoStart);
  
  // Количество выполненных проверок
  this._check = 0;
  
  // Пул очереди
  this._items = [];
  
  // Флаг "выполнить очередь один раз"
  this._single = Boolean(single);
  
  // Уведомление об остановке очереди
  this._announceStop = {
    interval: undefined,
    delay: 60 * 60 * 1000,
  }
  
  // options
  // Название очереди
  this._label = String(label);
  Object.defineProperty(this, 'label', {
    get() {
      return this._label;
    }
  });
  
  const prefixForLog = `Очередь${this.label === 'default' ? '' : ` ${this.label}`}:`;
  
  /**
   * @param {...*} messages
   * @return {Schedule}
   * @private
   */
  this._log = log.step.bind(log, prefixForLog);
  
  /**
   * @param {...*} messages
   * @return {Schedule}
   * @private
   */
  this._logWarning = log.warn.bind(log, prefixForLog);
  
  /**
   * @param {...*} messages
   * @return {Schedule}
   * @private
   */
  this._logException = log.error.bind(log, prefixForLog);
  
  // Исполняющая функция
  if (assert(typeof executor === 'function', 'Не передана функция для выполнения платежа', true)) {
    this._executor = executor;
  }
  
  // Режим работы очереди
  // async - параллельный (по-умолчанию). Запросы с помощью исполняющей функции будут отправляться одновременно
  // sync - последовательный. Запросы с помощью исполняющей функции будут отправляться последовательно
  if (assert(mode === 'async' || mode === 'sync', 'Передан неизвестный режим работы очереди', true)) {
    this._mode = mode;
  }
  
  // Интервал между тактами очереди. В миллисекундах
  if (assert(Number.isNaN(delay) || delay < 1000)
  ) {
    this._log(`Установлен интервал очереди по-умолчанию: ${defaultDelay / 1000} сек.`);
    this._delay = defaultDelay;
  } else {
    this._delay = delay;
  }
  
  // Инициализация индекса
  this._setIndex();
  
  if (this._debug) {
    this._logWarning('Включён режим отладки');
    
    this._delay = 5 * 1000;
    this._logWarning('Установлен отладочный интервал');
  }
  
  this._log('Создание завершено');
}

/**
 * Запуск очереди
 * @return {Schedule}
 */
Schedule.prototype.start = function () {
  this._log(`Запуск (интервал: ${this._delay / 1000} сек.)`);
  
  if (!this._init) {
    this._init = true;
    this._schedule();
    this._log('Инициализация завершена');
  }
  
  this._log('Успешный запуск');
  return this;
};

/**
 * Полная остановка очереди
 * @param {string} reason
 * @return {Schedule}
 */
Schedule.prototype.break = function (reason = 'без причины') {
  this._log(`Полная остановка (${reason})`);
  this._init = false;
  return this;
};

/**
 * Остановка очереди
 * @param {string} reason
 * @return {Schedule}
 */
Schedule.prototype.stop = function (reason) {
  this._log('Запрос на остановку');
  clearTimeout(this._nextCheck);
  
  const announce = () => this._logWarning(`На паузе${reason ? ` по причине: ${reason}` : ''}`);
  announce();
  clearInterval(this._announceStop.interval);
  this._announceStop.interval = setInterval(announce, this._announceStop.delay);
  
  return this;
};

/**
 *
 * @param {ScheduleItem} params
 * @return {boolean}
 */
Schedule.prototype.add = function (params) {
  this._log('Добавляем элемент');
  
  if (
    assert(typeof params === 'object',
      `На добавление в очередь ожидался объект. Получено: ${params}`) !== true
    && assert(typeof params.id === 'number' || typeof params.id === 'string',
    'Поле id ожидалось в виде числа или строки')
  ) {
    return false;
  }
  
  let { data, id } = params;
  
  switch (typeof data) {
    case 'undefined':
      this._logWarning('В объекте на добавление отсутствует поле data');
      data = 'empty';
      break;
    case 'object':
      this._logWarning('Автоматическое приведение объекта к JSON');
      data = JSON.stringify(data);
  }
  
  try {
    this._setItem(id, JSON.stringify({ id, data }));
    this._log('Элемент добавлен');
    return true;
  } catch (e) {
    this._logException(`Ошибка добавления в хранилище:`, e);
    return false;
  }
};

/**
 * Вручную удалить элемент(ы)
 * #Очередь сама удалит элементы, которые были успешно обработаны исполняющей функцией
 * @param {string|number|Array<string|number>} id
 * @return {Schedule}
 */
Schedule.prototype.remove = function (id) {
  if (!Array.isArray(id)) {
    id = [id];
  }
  
  if (!id.length) {
    this._log('Не переданы элементы к удалению');
  } else {
    this._log(`Удаляем элементы (${id.length}): ${id.join(', ')}`);
    
    id.forEach(id => this._deleteItem(id));
    this._log('Элементы удалены из хранилища');
  }
  
  return this;
};

/**
 * Удаление всех элементов очереди
 * @param {string} [reason='без причины']
 * @return {Schedule}
 */
Schedule.prototype.purge = function (reason = 'без причины') {
  this._logWarning(`Очистка (${reason})`);
  
  const index = this._getIndex();
  index.forEach(key => this._deleteItem(key));
  this._setIndex(index.fill(null));
  
  this._logWarning('Очередь очищена');
  
  return this;
};

Schedule.prototype._schedule = async function () {
  const goNext = () => this._nextCheck = setTimeout(() => this._schedule(), this._delay);
  
  this._log('Поиск данных на отправку');
  this._check++;
  this._items = this._getIndex()
    .filter(key => key !== null)
    .map(key => this._getItem(key));
  
  if (!this._items.length) {
    this._log('К отправке ничего нет');
    goNext();
    return;
  }
  
  let ids = [];
  if (this._mode === 'async') {
    this._log('Параллельная отправка запросов');
    const results = this._items.map(item => new Promise(
      resolve => {
        try {
          this._execute(item)
            .then(
              () => {
                this._log(`Успешная обработка элемента (id: ${item.id})`);
                resolve(item.id);
              },
              () => {
                this._log(`Неуспешная обработка элемента (id: ${item.id})`);
                resolve(null);
              }
            )
            .catch(e => {
              this._logException(`Ошибка внутри исполняющей функции элемента (id: ${item.id}):`, e, 'Обработка будет считаться неуспешной');
              resolve(null);
            });
        } catch (e) {
          this._logException(`Ошибка обработки исполняющей функции элемента (id: ${item.id}):`, e);
          resolve(null);
        }
      }
    ));
    const stopWaiting = this._startExecutionWaiting(this._items.map(el => el.id).join(', '));
    let promiseResults;
    try {
      promiseResults = await Promise.all(results);
    } catch (e) {
      this._logException(e);
      promiseResults = [];
    }
    ids = ids.concat(promiseResults.filter(r => r !== null));
    this._log('Все элементы обработаны');
    stopWaiting();
  } else {
    this._log('Последовательная отправка запросов');
    let index = 0;
    const req = async () => {
      if (index === this._items.length) {
        return;
      }
      const item = this._items[index];
      const stopWaiting = this._startExecutionWaiting(item.id);
      const res = await this._execute(item);
      stopWaiting();
      this._log(`Успешная обработка элемента (id: ${item.id})`);
      index++;
      if (res !== null) {
        ids.push(res);
      }
      await req();
    };
    await req();
  }
  
  if (ids.length) {
    this.remove(ids);
  }
  
  if (this._single) {
    this.break('Единственная проверка выполнена');
    return;
  }
  
  if (this._init) goNext();
};

/**
 * Обёртка для безопасной работы с выполняющей функцией
 * @param {{id: number|string, data: string}} item
 * @return {Promise<*|null>}
 * @private
 */
Schedule.prototype._execute = async function (item) {
  const { id } = item;
  let req;
  
  try {
    this._log(`Обработка элемента ${id}`);
    req = this._executor(item);
  } catch (e) {
    this._logException(`Ошибка выполнения на элементе ${id}:`, e);
    return null;
  }
  
  if (!(req instanceof Promise)) {
    this._logException(`Для элемента ${id} обработчик вернул не Promise: ${req}`);
    return null;
  }
  
  return await req;
};

/**
 * Возвращает функцию для очистки интервала
 * @param {number|string} id
 * @return {function(): void}
 * @private
 */
Schedule.prototype._startExecutionWaiting = function (id) {
  let minutes = 0;
  const delay = 20;
  
  const interval = setInterval(() => {
    minutes += delay;
    this._logWarning(`Запрос по элементу ${id} выполняются долго. Прошло минут: ${minutes}`);
  }, delay * 60 * 1000);
  
  return () => clearInterval(interval);
}

/**
 * Сформировать название элемента
 * @param {string|number} id
 * @return {string}
 * @private
 */
Schedule.prototype._formatItemName = function (id) {
  return `schedule_${this.label}_${id}`;
};

/**
 *
 * @param key
 * @return {string|null}
 * @private
 */
Schedule.prototype._getItem = function (key) {
  const i = this._getIndex().findIndex(value => value === key);
  
  if (i !== -1) {
    const raw = getDBKey(this._formatItemName(i));
    try {
      const item = JSON.parse(raw);
      
      try {
        // пытаемся автоматически привести к объекту
        item.data = JSON.parse(item.data);
      } catch (e) {
        // ничего не делаем
      }
      
      return item;
    } catch (e) {
      log.error(`В базе повреждены данные по ключу ${key}: ${raw}`);
      return null;
    }
  } else {
    log.error(`В индексе отсутствует ключ ${key}`);
    return null;
  }
};

/**
 * Удалить элемент из базы
 * @param {string|number} key
 * @private
 */
Schedule.prototype._deleteItem = function (key) {
  this._setItem(key, '');
};

/**
 * Записать элемент в базу
 * @param {string|number} key
 * @param {string} value
 * @private
 */
Schedule.prototype._setItem = function (key, value) {
  const index = this._getIndex();
  let cell;
  
  if (value === '') {
    cell = index.findIndex(value => value === key);
    
    if (cell === -1) {
      log.error(`Не удалось удалить ключ ${key} из базы, т.к. он отсутствует`);
      return;
    } else {
      index[cell] = null;
      log.debug(`Ключ ${key} удалён из индекса`);
    }
  } else {
    cell = index.findIndex(value => value === null);
    
    if (cell === -1) {
      cell = index.push(key) - 1;
    } else {
      index[cell] = key;
    }
    
    log.debug(`Данные по ключу ${key} добавлены в базу`);
  }
  
  this._setIndex(index);
  setDBKey(this._formatItemName(cell), value);
};

/**
 * Получить индекс
 * @returns {array<string|number|null>}
 * @private
 */
Schedule.prototype._getIndex = function () {
  const raw = getDBKey(this._formatItemName('_index'));
  const that = this;
  
  try {
    let index = JSON.parse(raw);
    
    if (!Array.isArray(index)) {
      log.error('Индекс не является массивом');
      index = handleError();
    }
    
    return index;
  } catch (e) {
    return handleError();
  }
  
  function handleError() {
    log.error('Индекс повреждён.', raw);
    
    const newIndex = that._setIndex();
    log.warn('Индекс сброшен');
    
    return newIndex;
  }
};

/**
 * Записать индекс
 * @param {array<string|number|null>} [arr=[]]
 * @return {array<string|number|null>}
 * @private
 */
Schedule.prototype._setIndex = function (arr = []) {
  const json = JSON.stringify(arr);
  log.debug('Запись в индекс.', json);
  setDBKey(this._formatItemName('_index'), json);
  return arr;
};
