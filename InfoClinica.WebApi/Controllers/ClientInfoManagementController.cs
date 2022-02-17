using AutoMapper;
using ECash.InfoClinica.Database;
using ECash.InfoClinica.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Controllers
{
    /// <summary>
    /// WebAPI управления пользователями
    /// </summary>
    [ApiController]
    [Produces("application/json")]
    [Route("cm")]
    public class ClientInfoManagementController : ControllerBase
    {
        #region Private fields
        /// <summary>
        /// Логгер
        /// </summary>
        private readonly ILogger log;
        /// <summary>
        /// Служба управления пользователями
        /// </summary>
        private readonly ClientInfoManagementService _clientInfoManagementService;
        #endregion

        #region Constructors
        /// <summary>
        /// Создаёт экземпляр класса
        /// </summary>
        /// <param name="log">Логгер</param>
        /// <param name="clientInfoManagementService">Служба управления информацией о клиентах</param>
        public ClientInfoManagementController(ILogger<ClientInfoManagementController> log,
            ClientInfoManagementService clientInfoManagementService)
        {
            this.log = log ?? throw new ArgumentNullException(nameof(log));
            _clientInfoManagementService = clientInfoManagementService
                ?? throw new ArgumentNullException(nameof(clientInfoManagementService));
        }
        #endregion

        #region Actions
        /// <summary>
        /// Возвращает список клиентов по префиксу и номеру телефона
        /// </summary>
        /// <param name="prefix"></param>
        /// <param name="phone"></param>
        /// <returns></returns>
        [Route("getClientInfo")]
        [HttpGet]
        public async Task<Response<Client>> GetClientInfo(string prefix, string phone)
        {
            try
            {
                #region [log]
                log.LogTrace("ENTER {0}", nameof(GetClientInfo));
                #endregion
                if (string.IsNullOrEmpty(prefix) || string.IsNullOrEmpty(phone))
                {
                    #region [log]
                    log.LogTrace("LEAVE {0}", nameof(GetClientInfo));
                    #endregion
                    return new Response<Client> { Success = false, Error = "Parameters prefix and phone must not be empty" };
                }
                var clients = await _clientInfoManagementService.FindClientsInfoByPhone(prefix, phone);
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetClientInfo));
                #endregion
                return new Response<Client> { Success = true, Result = clients };
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetClientInfo));
                #endregion
                return new Response<Client> { Success = false, Error = ex.Message };
            }
           
        }
            

        /// <summary>
        /// Возвращает список всех долгов клиента
        /// </summary>
        /// <param name="clientCode">Уникальный код клиента</param>
        /// <returns></returns>
        [Route("getDebts")]
        [HttpGet]
        public async Task<Response<Debt>> GetDebts(string clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetDebts));
            #endregion
            try
            {
                if (String.IsNullOrEmpty(clientCode))
                {
                    #region [log]
                    log.LogTrace("LEAVE {0}", nameof(GetDebts));
                    #endregion
                    return new Response<Debt> { Success = false, Error = "Parameter clientCode must not be empty" };
                }
                var debts = await _clientInfoManagementService.GetDebtList(int.Parse(clientCode));
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetDebts));
                #endregion
                return new Response<Debt> { Success = true, Result = debts };
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetDebts));
                #endregion
                return new Response<Debt> { Success = false, Error = ex.Message };
            }
        }


        /// <summary>
        /// Производит полную оплату одного приема
        /// </summary>
        /// <param name="info">Информация по оплачиваемому приему</param>
        /// <returns></returns>
        [Route("fullPay")]
        [HttpPost]
        public async Task<Response<bool>> PayTreatment(PaymentInfo info)
        {
            try
            {
                #region [log]
                log.LogTrace("ENTER {0}", nameof(PayTreatment));
                #endregion
                var paymentResult = await _clientInfoManagementService.MakeFullReceptionPayment(info);
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(PayTreatment));
                #endregion
                return new Response<bool> { Success = paymentResult };
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(PayTreatment));
                #endregion
                return new Response<bool> { Success =  false, Error = ex.Message };
            }
            
        }
        #endregion
    }
}
