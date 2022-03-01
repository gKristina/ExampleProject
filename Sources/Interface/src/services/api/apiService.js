import defaultRequest from "@/services/api/DefaultAxiosInstance";
import { log } from "@/helpers/log";

export const apiService = {
  findClientsByPhone: params => {
    return defaultRequest.get(`/getClientInfo?prefix=${params.prefix}&phone=${params.phone}`)
      .then(response => {
        try {
          log.debug(`[Информация о клиенте] Код ответа сервера: ${response.status}`);
          log.info('[Информация о клиенте] Получили ответ от сервера: ', JSON.stringify(response.data).substring(0,300));
          
          const { success, error, result } = response.data;
          
          if (success) {
            return result;
          } else {
            log.error(`[Информация о клиенте]  произошла ошибка: ${error}`)
            throw error;
          }
        } catch (e) {
          log.error(`[Информация о клиенте] Не удалось распаковать данные: ${JSON.stringify(response.data, null, 2)}, ошибка: `, e);
          throw e;
        }
      })
      .catch(e => {
        log.error('[Информация о клиенте] Не удалось получить данные. Ошибка: ', e)
        throw e;
      });
  },
  
  getDebts: code => {
    return defaultRequest.get(`/getDebts?clientCode=${code}`)
      .then( response => {
        try {
          log.debug(`[Информация о задолженностях] Код ответа сервера: ${response.status}`);
          log.info('[Информация о задолженностях] Получили ответ от сервера: ', JSON.stringify(response.data));
        
          const { success, error, result } = response.data;
        
          if (success) {
            return result;
          } else {
            log.error(`[Информация о задолженностях] произошла ошибка: ${error}`);
            throw error;
          }
        } catch (e) {
          log.error(`[Информация о задолженностях] Не удалось распаковать данные: ${JSON.stringify(response.data, null, 2)}, ошибка: `, e);
          throw e;
        }
      })
      .catch(e => {
        log.error('[Информация о задолженностях] Не удалось получить данные. Ошибка: ', e)
        throw e;
      });
  },
  pay: paymentData => {
    const url = paymentData.paid === paymentData.treatmentAmount ? `/fullPay` : `/upfrontPay`;
    return defaultRequest.post( url, paymentData)
      .then( response => {
        try {
          log.debug(`[Оплата] Код ответа сервера: ${response.status}`);
          log.info('[Оплата] Получили ответ от сервера: ', JSON.stringify(response.data));
        
          const {success, error} = response.data;
        
          if (success) {
            return success;
          } else {
            log.error(`[Оплата] произошла ошибка: ${error}` );
            throw error;
          }
        } catch (e) {
          log.error(`[Оплата] Не удалось распаковать данные: ${JSON.stringify(response.data, null, 2)}, ошибка: `, e);
          throw e;
        }
      })
      .catch(e => {
        log.error('[Оплата] Не удалось получить данные. Ошибка: ', e);
        throw e;
      });
  }
}

