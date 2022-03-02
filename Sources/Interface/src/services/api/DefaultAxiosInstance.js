import axios from "axios";
import { log } from "@/helpers/log";
import { getDBKey } from '@/helpers/externals';

const defaultRequest = axios.create({
  baseURL: getDBKey('IntegrationValB'),
  timeout: 60 * 1000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-store',
  }
});

defaultRequest.interceptors.request.use(config => {
  const { url, baseURL, method, headers, data, timeout } = config;
  
  log.debug('Выполняем запрос: ', {
    url,
    baseURL,
    method,
    headers,
    data,
    timeout
  });
  
  return config;
});

defaultRequest.interceptors.response.use(
  response => {
    let str;
    
    if (typeof response === "object") {
      str = JSON.stringify(response, null, 2);
    } else {
      str = response;
    }
    
     log.debug(`Ответ сервера: ${str}`);
    
    return response;
  },
  function (error) {
    if (error.response) {
      log.warn('Нестандартный ответ сервера');
      log.warn(error.response.data);
      log.warn(error.response.status);
      log.warn(error.response.headers);
    } else if (error.request) {
      log.warn('Нет ответа от сервера');
      log.info(error.request);
    } else {
      log.error(error);
    }
    
    console.error(error.config);
    
    return Promise.reject(error);
  }
);

export default defaultRequest;
