/**
 * Платёж
 * [старый бэк]
 * @param {CashboxPayment} cashboxPayment
 * @param {ExternalBasket} basket
 * @constructor
 */
import { log } from "@/helpers/log";

export function PaymentInfo(cashboxPayment, basket) {
  try {
    this.id = cashboxPayment.id;
    this.fdNumber = cashboxPayment.fdNumber;
    this.check = cashboxPayment.check;
    this.fiscalSign = cashboxPayment.fiscalSign;
    this.date = cashboxPayment.date;
    this.docType = cashboxPayment.docType;
    this.shiftNumber = cashboxPayment.shiftNumber;
    this.shiftCheckNumber = cashboxPayment.shiftCheckNumber;
    this.checkNumber = cashboxPayment.checkNumber;
    this.operator = cashboxPayment.operator;
    this.sum = cashboxPayment.sum;
    this.taxType = cashboxPayment.taxType;
    
    this.basketSession = basket.basketSession;
    this.isCard = basket.isCard;
    this.cardType = basket.cardType;
    this.basketCheck = basket.basketCheck;
    this.changeTotal = basket.changeTotal;
    this.changeActual = basket.changeActual;
    this.changeMissed = basket.changeMissed;
    this.authCode = basket.authCode;
    this.linkNumber = basket.linkNumber;
    this.invoiceNumber = basket.invoiceNumber;
    
    if (this.basketCheck) {
      this.cardNumber = this.basketCheck
        ?.match(/\*\*\*\*\*\d+/)?.[0]
        .substring(5)
        || null;
    } else {
      this.cardNumber = null;
    }
  } catch (e) {
    log.error(e);
  }
}
