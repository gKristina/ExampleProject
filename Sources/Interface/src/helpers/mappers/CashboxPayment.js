/**
 * Платёж в БД кассы
 * @param raw Сырой объект из кассы
 * @constructor
 */
export function CashboxPayment(raw) {
  if (typeof raw === 'string') return;
  
  this.id = raw.id ?? null;
  this.fdNumber = raw.fdnumber ?? null;
  this.check = raw.rectext ?? null;
  this.fiscalSign = raw.fiscalsign ?? null;
  this.date = new Date(raw?.recdatetime);
  this.docType = raw.rectype ?? null;
  this.shiftNumber = raw.session ?? null;
  this.shiftCheckNumber = raw.recinsession ?? null;
  this.checkNumber = raw.recnumber ?? null;
  this.operator = raw.operator ?? null;
  this.sum = raw.summ ?? null;
  this.taxType = raw.taxtype ?? null;
}
