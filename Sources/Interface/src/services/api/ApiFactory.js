import settings from '@/store/settings';
import { apiMockService } from '@/services/api/apiMockService';
import { apiService } from '@/services/api/apiService';

export const api = {
  instance: null,
  
  createInstance: function () {
    if (!this.instance) {
      ApiFactory.init();
      this.instance = ApiFactory.create();
    }
  }
};

const ApiFactory = {
  init: function () {
    this.mode =  settings.state.debug.on ? modeTypes.debug : modeTypes.prod;
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

const modeTypes = {
  debug: 'debug',
  prod: 'prod'
};