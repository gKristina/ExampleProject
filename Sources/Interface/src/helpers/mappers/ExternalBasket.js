/**
 * Basket на стороне бэка
 * [старый бэк]
 * @param [basket = {}] {Object}
 * @constructor
 */
export function ExternalBasket(basket = {}) {
  this.basketSession = basket.BasketSession ?? null;
  this.isCard = basket.isCard ?? null;
  this.cardType = basket.CardType ?? null;
  this.basketCheck = basket.CardTerminalCheck ?? null;
  this.changeTotal = basket.Summ_Change ?? null;
  this.changeActual = basket.Summ_Change_Out ?? null;
  this.changeMissed = basket.Summ_Change_Error ?? null;
  this.authCode = basket.AuthorizationCode ?? null;
  this.linkNumber = basket.ReferenceNumber ?? null;
  this.invoiceNumber = basket.InvoiceNumber ?? null;
}
