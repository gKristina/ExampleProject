/***********************
 * Платёжные константы *
 ***********************/
export const PAYMENT = Object.freeze({
  /**
   * Типы оплаты
   */
  TYPE: {
    CASH: 0,
    CARD: 1,
    COMBO: -2,
  },
  
  /**
   * Признаки способа расчёта:
   */
  TYPE_SIGN: {
    FULL_PREPAY: 1, // Предоплата 100%
    PARTIAL_PREPAY: 2, // Частичная предоплата
    ADVANCE: 3, // Аванс
    FULL_PAYMENT: 4, // Полный расчет
    PARTIAL_PAYMENT_AND_CREDIT: 5, // Частичный расчет и кредит
    TRANSFER_FOR_CREDIT: 6, // Передача в кредит
    CREDIT_PAYMENT: 7, // Оплата кредита
  },
  
  /**
   * Признаки предмета расчёта
   */
  ITEM_SIGN: {
    PRODUCT: 1, // Товар
    EXCISABLE_PRODUCT: 2, // Подакцизный товар
    WORK: 3, // Работа
    SERVICE: 4, // Услуга
    GAMBLING_BID: 5, // Ставка азартной игры
    GAMBLING_WIN: 6, // Выигрыш азартной игры
    LOTTERY_TICKET: 7, // Лотерейный билет
    LOTTERY_WIN: 8, // Выигрыш лотереи
    PROVISION_OF_RESULT_OF_INTELLECTUAL_ACTIVITY: 9, // Предоставление РИД
    PAYMENT: 10, // Платеж
    AGENT_COMISSION: 11, // Агентское вознаграждение
    COMPOSITE_PAYMENT_ITEM: 12, // Составной предмет расчета
    ANOTHER_PAYMENT_ITEM: 13, // Иной предмет расчета
    PROPERTY_RIGHT: 14, // Имущественное право
    NON_OPERATING_INCOME: 15, // Внереализационный доход
    INSURANCE_PAYMENT: 16, // Страховые взносы
    TRADE_FEE: 17, // Торговый сбор
    RESORT_FEE: 18, // Курортный сбор
  },
  
  /**
   * Причины прерывания платежа
   */
  INTERRUPT_REASON: {
    INVALID_GATE: 'invalidGate',
    CARD_FAIL: 'cardFail',
  },
});
