import defaultRequest from "@/services/api/DefaultAxiosInstance";
import { log } from "@/helpers/log";

export const apiService = {
  findClientsByPhone: (prefix, phone) => {
    return defaultRequest({ url: `/getClientInfo?prefix=${prefix}&phone=${phone}`})
      .then(response => {
        try {
          log.debug(`[Информация о клиенте] Код ответа сервера: ${response.status}`);
          log.info('Информация о клиенте] Получили ответ от сервера: ', JSON.stringify(response.data).substring(0,300));
          
          const catalog = response.data.value;
          
          if (Array.isArray(catalog)) {
            return catalog;
          } else {
            log.error('Информация о клиенте] Получили не объект')
            throw response;
          }
        } catch (e) {
          log.error(`Информация о клиенте] Не удалось распаковать данные: ${JSON.stringify(response.data, null, 2)}, ошибка: `, e)
          throw e;
        }
      })
      .catch(e => {
        log.error('Информация о клиенте] Не удалось получить данные. Ошибка: ', e)
        throw e;
      });
  }
}

