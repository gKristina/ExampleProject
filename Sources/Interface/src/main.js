import Vue from 'vue'
import App from './App.vue'
import store from './store/store'

import PortalVue from 'portal-vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import './helpers/handlers';

import 'normalize.css';
import './helpers/polyfills/object.fromEntries';

import { isTerminal } from "@/helpers/utils";
import { log } from "@/helpers/log";

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.directive('visible', (el, { value }) => {
  el.style.visibility = value ? 'visible' : 'hidden';
});

Vue.config.productionTip = false;

Vue.use(PortalVue);

if (isTerminal()) {
  Vue.config.errorHandler = function (err, vm, info) {
    log.error('[Vue]', err);
  };
  Vue.config.warnHandler = function (msg, vm, trace) {
    log.warn('[Vue]', msg);
  };
}

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');
