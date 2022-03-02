import { log } from '@/helpers/log';

export const apiMockService = {
  findClientsByPhone: async function () {
    log.info('Получаем информацию о клиенте из моков');
    return await fetch('/mocks/getClientInfo.json')
           .then( res => res.json())
           .then(info => info.result);
  },
  getDebts: async function () {
    log.info('Получаем список долгов из моков');
    return await fetch('/mocks/getDebts.json')
      .then(res => res.json())
      .then(info => info.result);
  },
  pay: async function () {
    log.info('Используем моки для оплаты');
    return await fetch('/mocks/pay.json')
      .then(res => res.json())
      .then(info => info.success);
  }
};