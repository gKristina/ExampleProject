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
        /// <returns></returns>
        /// 
        [Route("getClientInfo")]
        [HttpGet]
        public async Task<Response<Client>> GetClientInfo(string prefix, string phone)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetClientInfo));
            #endregion
            if (!string.IsNullOrEmpty(prefix) && !string.IsNullOrEmpty(phone))
            {
                var clients = await _clientInfoManagementService.FindClientsInfoByPhone(prefix, phone);
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetClientInfo));
                #endregion
                return new Response<Client>(true, clients);
            }
            return new Response<Client>(false, "Parameters prefix and phone must not be empty");
        }
            

        /// <summary>
        /// Возвращает список задолженостей клиента по уникальному коду
        /// </summary>
        /// <returns></returns>
        /// 
        [Route("getDebts")]
        [HttpGet]
        public async Task<Response<Debt>> GetDebts(string clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetDebts));
            #endregion
            if(!String.IsNullOrEmpty(clientCode))
            {
                var debts = await _clientInfoManagementService.GetDebtList(int.Parse(clientCode));
                #region [log]
                log.LogTrace("LEAVE {0}", nameof(GetDebts));
                #endregion
                return new Response<Debt>(true, debts);
            }
            return new Response<Debt>(false, "Parameter clientCode must not be empty");
        }


        /// <summary>
        /// Возвращает данные пользователя с заданным идентификатором
        /// </summary>
        /// <param name="userId">Идентификатор пользователя</param>
        /// <returns></returns>
        [Route("pay")]
        [HttpPost]
        public async Task<Response<PaymentInfo>> PayTreatment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(PayTreatment));
            #endregion

//            var paymentResult = 
          

            #region [log]
            log.LogTrace("LEAVE {0}", nameof(PayTreatment));
            #endregion
            return null;
        }
        #endregion
    }
}
