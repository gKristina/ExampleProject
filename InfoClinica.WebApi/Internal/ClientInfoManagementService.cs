using Ecash.InfoClinica.Database.Data;
using Ecash.InfoClinica.Database.Models;
using ECash.InfoClinica.Database.Internal.Models;
using ECash.InfoClinica.WebApi.Internal.DBModels;
using ECash.InfoClinica.WebApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.Database
{
    public class ClientInfoManagementService
    {
        #region Private fields
        private readonly ApplicationContext db;
        private readonly ILogger log;
        #endregion

        #region Constructors
        public ClientInfoManagementService (ApplicationContext context, ILogger<ClientInfoManagementService> log)
        {
            db = context;
            this.log = log ?? throw new ArgumentNullException(nameof(log));
        }
        #endregion

        #region Public methods



        public async Task<List<Client>> FindClientsInfoByPhone(string prefix, string phone)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(FindClientsInfoByPhone));
            #endregion
            var result = new List<Client>();
            try
            {
                //var test = await db.ClientPhones.Where(p => p.Phone == "5802059" && p.Prefix == "7926").ToListAsync();
                var clientsPhones =  db.ClientPhones.Where(p => p.Phone == phone);
                var clientsPhonesSortedByPrefix = clientsPhones.Where(p => p.Prefix == prefix);
                
                foreach (var dbPhone in clientsPhonesSortedByPrefix)
                {
                    var client = await db.Clients
                        .Where(c => c.ClientCode == dbPhone.ClientCode)
                        .Select(c => new Client(c.ClientCode, c.LastName, c.FirstName, c.MidName, c.FullName))
                        .FirstAsync();
                    result.Add(client);
                }
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(FindClientsInfoByPhone));
                #endregion
                return result;
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                return result;
            }

        }

        public async Task<List<Debt>> GetDebtList(int clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetDebtList));
            #endregion
            var result = new List<Debt>();
            try
            {
                string sqlCommand = @"SELECT * FROM sptreatdolg5 ('01.01.1970',current_date,-1,-1,1,-1,0,30,0,0,{0})";
                var debts = await db.Set<DebtsDB>().FromSqlRaw(sqlCommand, clientCode).ToListAsync();
                if (debts.Count > 0)
                {
                    debts.ForEach(debt => result.Add(
                        new Debt(debt.OrderCode, debt.TreatCode, debt.TreatDate, debt.DebtDaysCount, debt.DoctorCode, debt.ClientCode,
                        debt.FullName, debt.DoctorName, debt.TreatAmount, debt.DebtAmount)));
                }
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetDebtList));
                #endregion
                return result;
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                return result;
            }
        }

        public async Task<List<Debt>> ReceptionPayment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(ReceptionPayment));
            #endregion
            var result = new List<Debt>();
            try
            {
               // var transactionList = new TransactionList;
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(ReceptionPayment));
                #endregion
                return result;
            }
            catch (Exception ex)
            {
                log.LogError(ex.Message);
                return result;
            }
        }

        #endregion

    }
}
