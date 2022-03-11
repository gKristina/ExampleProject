using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Ecash.InfoClinica.Database.Data;
using ECash.InfoClinica.WebApi.Internal;
using ECash.InfoClinica.WebApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using db = ECash.InfoClinica.WebApi.Internal.DBModels;

namespace ECash.InfoClinica.Database
{
    public class ClientInfoManagementService
    {
        #region Private fields
        private readonly ApplicationContext _context;
        private readonly ILogger log;
        #endregion

        #region Constructors
        public ClientInfoManagementService (ApplicationContext context, ILogger<ClientInfoManagementService> log)
        {
            _context = context;
            this.log = log ?? throw new ArgumentNullException(nameof(log));
        }
        #endregion

        #region Public methods
        public async Task<List<Client>> FindClientsInfoByPhone(string prefix, string phone)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(FindClientsInfoByPhone));
            log.LogTrace("Searching client with prefix: {0}, phone: {1}", prefix, phone);
            #endregion

            var qryClients = 
                    from c in _context.Clients
                    join p in _context.ClientPhones on c.ClientCode equals p.ClientCode
                    where p.Phone == phone && EF.Functions.Like( p.Prefix, $"%{prefix}%")
                    select new Client
                    {
                        Code = c.ClientCode,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        FullName = c.FullName,
                        MiddleName = c.MidName,
                    };

            var result = await qryClients.ToListAsync();

            #region [log]
            log.LogTrace($"Found clients: {result.Count}");
            log.LogTrace($"LEAVE {nameof(FindClientsInfoByPhone)}");
            #endregion

            return result;
        }
        public async Task<List<Debt>> GetDebtList(int clientCode)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(GetDebtList)}");
            log.LogTrace($"Executing procedure sptreatdolg5 with client code: {clientCode}");
            #endregion

            // sptreatdolg5 is stored procedure
            string sqlCommand = string.Format(@"SELECT * FROM sptreatdolg5 ('01.01.1970',current_date,-1,-1,1,-1,0,30,0,0,{0})", clientCode);
             
            var debts = await _context.Set<db.Debts>()
                .FromSqlRaw(sqlCommand)
                .AsNoTracking()
                .Select(debt => new Debt
                {
                    OrderCode = debt.OrderCode,
                    TreatmentCode = debt.TreatCode,
                    TreatmentDate = debt.TreatDate,
                    DebtDaysCount = debt.DebtDaysCount,
                    DoctorCode = debt.DoctorCode,
                    ClientCode = debt.ClientCode,
                    FullName = debt.FullName,
                    DoctorName = debt.DoctorName,
                    TreatmentAmount = debt.TreatAmount,
                    DebtAmount = debt.DebtAmount

                })
                .ToListAsync();

            #region [log]
            log.LogTrace($"Debt list count from database: {debts.Count}");
            log.LogTrace($"LEAVE {nameof(GetDebtList)}");
            #endregion

            return debts;
        }
        public async Task<bool> MakeFullReceptionPayment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(MakeFullReceptionPayment)}");
            log.LogTrace($"Start full payment with  client code: {info.ClientCode}");
            #endregion

            await using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var transaction = await CreatePaymentTransaction(info.ClientCode);

                var transactionId = transaction.TransactionId;
                var amountUSD = PaymentUtils.ConvertToInfoClinicUSD(info.Paid);

                var loseCredit = new db.LoseCredit
                {
                    Id = transactionId,
                    TransactionId = transactionId,
                    ClientCode = info.ClientCode,
                    DoctorCode = info.DoctorCode,
                    TreatmentCode = info.TreatmentCode,
                    Amount = info.Paid,
                    AmountUSD = amountUSD,
                    NumDoc = transactionId,
                };
                await _context.LoseCredit.AddAsync(loseCredit);

                var jPPayment = new db.JPPayments
                {
                    Id = transactionId,
                    TreatmentCode = transactionId,
                    Amount = info.Paid,
                    AmountUSD = amountUSD,
                    ClientCode = info.ClientCode,
                    DoctorCode = info.DoctorCode,
                    TransactionId = transactionId,
                    ExTreatCode = info.TreatmentCode,
                };
                await _context.JPPayments.AddAsync(jPPayment);

                var jPaymentDet = new db.JPaymentDet
                {
                    Id = transactionId,
                    AmountUSD = amountUSD,
                    Amount = info.Paid,
                    ClientCode = info.ClientCode,
                    TreatCode = transactionId,
                    ExTreatCode = info.TreatmentCode,
                    DoctorCode = info.DoctorCode,
                    PID = transactionId,
                    TransactionId = transactionId,

                };
                await _context.JPaymentDet.AddAsync(jPaymentDet);

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                #region [log]
                log.LogTrace($"LEAVE {nameof(MakeFullReceptionPayment)}");
                #endregion

                return true;
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError($"Error: {ex.Message}. Method: {nameof(MakeFullReceptionPayment)}");
                log.LogTrace($"LEAVE {nameof(MakeFullReceptionPayment)}");
                #endregion

                throw;
            }
        }

        public async Task<bool> MakeUpfrontReceptionPayment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(MakeUpfrontReceptionPayment)}");
            log.LogTrace($"Start upfront payment with client code: {info.ClientCode}");
            #endregion

            await using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var upfontPayment = await CreateUpfrontPaymentTransaction(info);

                var transactionId = upfontPayment.TransactionId;
                var clientCode = info.ClientCode;
                var amountUsd = upfontPayment.AmountUSD;

                var transaction = new db.PaymentTransaction
                {
                    ClientCode = clientCode,
                    TransactionId = transactionId,
                    UID = Constants.UpfrontPayment.Uid,
                    KkmCashPlat = Constants.UpfrontPayment.KkmCashPlat,
                    KkmCredPlat = Constants.UpfrontPayment.KkmCredPlat,
                    KkmCashPlatName = Constants.UpfrontPayment.CashPlatName,
                    KkmCredPlatName = Constants.UpfrontPayment.CredPlatName,
                    PayerCode = Constants.UpfrontPayment.PayerCode,
                };
                await _context.PaymentTransaction.AddAsync(transaction);

                var jPPayment = new db.JPPayments
                {
                    Id = transactionId,
                    TreatmentCode = transactionId,
                    Amount = info.Paid,
                    AmountUSD = amountUsd,
                    ClientCode = info.ClientCode,
                    TransactionId = transactionId
                };
                await _context.JPPayments.AddAsync(jPPayment);

                var jPaymentDet = new db.JPaymentDet
                {
                    Id = transactionId,
                    AmountUSD = amountUsd,
                    Amount = info.Paid,
                    ClientCode = info.ClientCode,
                    TreatCode = transactionId,
                    ExTreatCode = info.TreatmentCode,
                    PID = transactionId,
                    TransactionId = transactionId,
                    Schid = Constants.UpfrontPayment.Shid,
                    OperationType = Constants.UpfrontPayment.OperationType
                };
                await _context.JPaymentDet.AddAsync(jPaymentDet);

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                #region [log]
                log.LogTrace($"LEAVE {nameof(MakeUpfrontReceptionPayment)}");
                #endregion

                return true;
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError($"Error: {ex.Message}. Message: {nameof(MakeUpfrontReceptionPayment)}");
                log.LogTrace($"LEAVE {nameof(MakeUpfrontReceptionPayment)}");
                #endregion

                throw;
            }
        }

        #endregion

        #region Private methods
        private async Task<db.PaymentTransaction> CreatePaymentTransaction(long clientCode)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(CreatePaymentTransaction)}");
            #endregion

            var transactionId = _context.NextValueFor(Constants.Sequences.TransactionId);
            
            var transaction = new db.PaymentTransaction { ClientCode = clientCode, TransactionId = transactionId };
            await _context.PaymentTransaction.AddAsync(transaction);
            
            await _context.SaveChangesAsync();

            #region [log]
            log.LogTrace($"Transaction created with transactionId: {transactionId}");
            log.LogTrace($"LEAVE {nameof(CreatePaymentTransaction)}");
            #endregion

            return transaction;
        }

        private async Task<db.UpfrontPayment> CreateUpfrontPaymentTransaction(PaymentInfo info)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(CreateUpfrontPaymentTransaction)}");
            #endregion
            
            var transactionId = _context.NextValueFor(Constants.Sequences.TransactionId);
            
            var payment = new db.UpfrontPayment
            {
                Id = transactionId,
                ClientCode = info.ClientCode,
                TransactionId = transactionId,
                Amount = info.Paid,
                AmountUSD = PaymentUtils.ConvertToInfoClinicUSD(info.Paid),
                DocumentNumber = transactionId
            };
            await _context.UpfrontPayment.AddAsync(payment);
            
            await _context.SaveChangesAsync();
            
            #region [log]
            log.LogTrace($"Upfront payment transaction created with transactionId: {transactionId}");
            log.LogTrace($"LEAVE {nameof(CreateUpfrontPaymentTransaction)}");
            #endregion
            
            return payment;
        }
        #endregion
    }
}
