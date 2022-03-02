import { isPojo } from "@/helpers/utils";

/**
 * Элемент GoodsList для старого бэкенда
 * @param {String|Object} name Название позиции или объект со всеми параметрами
 * @param {Number} [price] Цена позиции
 * @param {Number} [amount=1] Количество товаров/услуг по позиции
 * @param {Array<Number>|Number} [tax=env.payment.defaults.taxGroup] Налоговые группы. Либо массив вида [Tax1,Tax2,Tax3,Tax4] либо число Tax1
 * @param {Number} [paymentItemSign=env.payment.defaults.itemSign]
 * @param {Number} [paymentTypeSign=env.payment.defaults.typeSign]
 * @param {Number} [discount=0] Cкидка на цену
 * @param {Number} [department=1] Отдел
 * @constructor
 */
export function GoodsListItem(name, price, amount, tax, paymentItemSign, paymentTypeSign, discount, department) {
  if (isPojo(name)) {
    const obj = name;
  
    if (obj.hasOwnProperty('name')) {
      name = obj.name;
    } else {
      throw new ReferenceError('Отсутствует необходимое поле price');
    }
  
    if (obj.hasOwnProperty('price')) {
      price = obj.price;
    } else {
      throw new ReferenceError('Отсутствует необходимое поле price');
    }
    
    department = obj.department ?? 1;
    amount = obj.amount ?? 1;
    discount = obj.discount ?? 0;
  
    if (obj.hasOwnProperty('tax')) {
      tax = obj.tax;
    } else {
      throw new ReferenceError('Отсутствует необходимое поле tax');
    }
  
  
    if (obj.hasOwnProperty('paymentTypeSign')) {
      paymentTypeSign = obj.paymentTypeSign;
    } else {
      throw new ReferenceError('Отсутствует необходимое поле paymentTypeSign');
    }
  
    if (obj.hasOwnProperty('paymentItemSign')) {
      paymentItemSign = obj.paymentItemSign;
    } else {
      throw new ReferenceError('Отсутствует необходимое поле paymentItemSign');
    }
  }
  
  amount = amount ?? 1;
  discount = discount ?? 0;
  
  if (typeof tax === "undefined") {
    throw new ReferenceError('Отсутствует необходимое поле tax');
  }
  
  if (typeof paymentTypeSign === "undefined") {
    throw new ReferenceError('Отсутствует необходимое поле paymentTypeSign');
  }
  
  if (typeof paymentItemSign === "undefined") {
    throw new ReferenceError('Отсутствует необходимое поле paymentItemSign');
  }
  
  department = typeof department === "number" ? department : 1;
  
  this.Name = name;
  this.Price = price;
  this.Discount = discount;
  this.Quantity = amount;
  if (Array.isArray(tax)) {
    this.Tax1 = tax[0] || 0;
    this.Tax2 = tax[1] || 0;
    this.Tax3 = tax[2] || 0;
    this.Tax4 = tax[3] || 0;
  } else {
    this.Tax1 = tax;
    this.Tax2 = 0;
    this.Tax3 = 0;
    this.Tax4 = 0;
  }
  this.Department = department;
  this.PaymentTypeSign = paymentTypeSign;
  this.PaymentItemSign = paymentItemSign;
}
