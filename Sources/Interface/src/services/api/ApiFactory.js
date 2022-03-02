import { apiMockService } from '@/services/api/apiMockService';
import { apiService } from '@/services/api/apiService';
import store from '@/store/store';

export const api = {
  instance: null,
  
  createInstance: function () {
    if (!this.instance) {
      const appMode = getMode();
      ApiFactory.init(appMode);
      this.instance = ApiFactory.create();
    }
  }
};

const ApiFactory = {
  init: function (mode) {
    this.mode = mode;
    return this;
  },
  
  create: function () {
    switch (this.mode) {
      case modeTypes.debug:
        return Object.create(apiMockService);
      case modeTypes.prod:
        return Object.create(apiService);
      default:
        throw `ApiFactory error: invalid mode: ${this.mode}`;
    }
  }
};

const getMode = function () {
  return store.getters["settings/isDebug"] ? modeTypes.debug : modeTypes.prod;
};


const modeTypes = {
  debug: 'debug',
  prod: 'prod',
};