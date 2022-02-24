import { log } from "@/helpers/log";

const state = () => ({
  list: {},
});

const getters = {
  size: state => Object.keys(state.list).length,
  sum: state => Object.values(state.list).reduce((acc, el) => acc + el.price * el.quantity, 0),
};

const actions = {
  add({ commit }, obj) {
    if (isDataValid(obj)) {
      commit('ADD', obj);
    } else {
      log.warn(`На добавление в корзину передан невалидный объект ${JSON.stringify(obj)}`);
    }
  },
  remove({ commit }, params) {
    if (typeof params === "number") {
      params = {
        id: params,
        quantity: 1,
      }
    }
    
    commit('REMOVE', params);
  },
  purge({ commit }) {
    log.step('Очищаем корзину');
    commit('PURGE');
  }
};

const mutations = {
  ADD(state, obj) {
    const { id, quantity } = obj;
  
    if (id in state.list) {
      state.list[id].quantity += quantity;
      log.step(`Увеличиваем количество позицию`)
    } else {
      state.list = {
        ...state.list,
        [id]: obj,
      };
      log.step(`Добавляем в корзину позицию `)
    }
  },
  REMOVE(state, { id, quantity }) {
    if (id in state.list) {
      if (quantity >= state.list[id].quantity) {
        log.step(`Удаляем из корзины позицию` )
        state.list = Object.fromEntries(Object.entries(state.list).filter(pair => pair[0] !== id));
      } else {
        log.step(`Уменьшаем количество позиций `)
        state.list[id].quantity -= quantity;
      }
    } else {
      log.warn(`В корзине отсутствует элемент с id ${id}`);
    }
  },
  PURGE(state) {
    state.list = {};
  },
};

const isDataValid = obj =>
  typeof obj === 'object'
  && obj !== null
  && ['id', 'name', 'price', 'quantity'].every(param => param in obj)
  && (typeof obj.id === "string" || typeof obj.id === "number")
  && typeof obj.name === 'string'
  && typeof obj.price === "number"
  && typeof obj.quantity === "number";

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
