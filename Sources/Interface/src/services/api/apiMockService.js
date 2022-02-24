import { log } from '@/helpers/log';

export const apiMockService = {
  findClientsByPhone: async function (prefix, phone) {
    return await fetch('/mocks/getClientInfo.json')
           .then( res => res.json())
           .then(info => info.result);
  }
}