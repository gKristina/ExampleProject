﻿using Ecash.InfoClinica.Database.Data;
using Ecash.InfoClinica.Database.Models;
using ECash.InfoClinica.Database.Internal.Models;
using db = ECash.InfoClinica.WebApi.Internal.DBModels;
using ECash.InfoClinica.WebApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ECash.InfoClinica.WebApi.Internal;
using Sequences = ECash.InfoClinica.WebApi.Internal.Utils.Sequences;

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
            #endregion
            var qryClients = 
                    from c in _context.Clients
                    join p in _context.ClientPhones on c.ClientCode equals p.ClientCode
                    where p.Phone == phone && p.Prefix == prefix
                    select new Client
                    {
                        Code = c.ClientCode,
                        FirstName = c.FirstName,
                        LastName = c.LastName,
                        FullName = c.FullName,
                        MiddleName = c.MidName,
                    };
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(qryClients));
            #endregion
            return await qryClients.ToListAsync().ConfigureAwait(false);
        }  

        public async Task<List<Debt>> GetDebtList(int clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetDebtList));
            #endregion
            var result = new List<Debt>();
            string sqlCommand = string.Format(@"SELECT * FROM sptreatdolg5 ('01.01.1970',current_date,-1,-1,1,-1,0,30,0,0,{0})", clientCode);
            var debts = await _context.Set<db.Debts>().FromSqlRaw(sqlCommand).AsNoTracking().ToListAsync();
            if (debts.Count > 0)
            {
                debts.ForEach(debt => result.Add(
                     new Debt
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

                     }));
            }
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(GetDebtList));
            #endregion
            return result;
        }


        public async Task<bool> MakeFullReceptionPayment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(MakeFullReceptionPayment));
            #endregion
            await using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transaction = await CreatePaymentTransaction(info.ClientCode);
                var transactionId = transaction.TransactionId;
                var amountUSD = Math.Round(info.Paid / 3, 2);
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
                dbTransaction.Commit();
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(MakeFullReceptionPayment));
                #endregion
                return true;
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(MakeFullReceptionPayment));
                #endregion
                dbTransaction.Rollback();
                throw;
            }
        }

        #endregion

        #region Private methods
        private async Task<db.TransactionList> CreatePaymentTransaction(long clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(CreatePaymentTransaction));
            #endregion
            var transactionId = _context.NextValueFor(Sequences.TransactionId);
            var transaction = new db.TransactionList { ClientCode = clientCode, TransactionId = transactionId };
            await _context.TransactionList.AddAsync(transaction);
            await _context.SaveChangesAsync();
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(CreatePaymentTransaction));
            #endregion
            return transaction;
        }

        #endregion 

    }
}
