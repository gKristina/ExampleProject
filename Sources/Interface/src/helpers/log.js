import { isTerminal } from "@/helpers/utils";

const saveLog = text => external['SaveErrorInLog'](text);

/**
 * @param {string} type
 * @returns {function(...*): void}
 */
const makeLogger = type => {
  let prefix,
    fnc = type,
    logger;
  
  switch (type) {
    case 'log':
      prefix = 'Шаги';
      break;
    case 'warn':
      prefix = 'Предупреждение';
      break;
    case 'debug':
      prefix = 'Отладка';
      break;
    case 'error':
      prefix = 'Ошибка';
      break;
    case 'info':
      prefix = 'Инфо';
      break;
  }
  
  if (isTerminal()) {
    logger = (...args) => {
      args = args.map(el => {
        if (el instanceof Error) {
          return el.message + '\n' + el.stack;
        }
    
        if (typeof el === "object") {
          return JSON.stringify(el, null, 2);
        }
        
        return el;
      });

      saveLog(`[${ prefix }] ${args.join(' ')}`);
    }
  } else {
    logger = console[fnc].bind(console, `[${ prefix }]`);
  }
  
  return logger;
}

export const log = {
  /**
   * ##Краткие, лаконичные сообщения<br>
   * Текст должен быть лаконичным и без специфичных терминов,
   * чтобы техподдержка могла полностью понять понять смысл сообщения
   * @param message
   */
  step: makeLogger('log'),
  
  /**
   * ##Сообщения о неожиданном или опасном поведении приложения<br>
   * Текст должен быть лаконичным и без специфичных терминов,
   * чтобы техподдержка могла полностью понять понять смысл сообщения
   * @param message
   */
  warn: makeLogger('warn'),
  
  /**
   * ##Сообщения об ошибках и исключениях<br>
   * Текст должен быть лаконичным и без специфичных терминов,
   * чтобы техподдержка могла полностью понять понять смысл сообщения
   * @param message
   */
  error: makeLogger('error'),
  
  /**
   * ##Отладочные сообщения
   * В любом виде и формате
   * @param message
   */
  debug: makeLogger('debug'),
  
  /**
   * ##Максимально подробные сообщения<br>
   * Комментируется "каждый чих"
   * @param message
   */
  info: makeLogger('info'),
}
