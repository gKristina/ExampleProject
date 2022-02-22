using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ECash.InfoClinica.Database;
using ECash.InfoClinica.WebApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ECash.InfoClinica.WebApi.Controllers
{
    /// <summary>
    /// WebAPI управления пользователями
    /// </summary>
    [ApiController]
    [Produces("application/json")]
    [Route("clientsManagement")]
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
        public async Task<DataListResponse<Client>> GetClientInfo(string prefix, string phone)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetClientInfo));
            #endregion

            var success = false;
            var error = string.Empty;
            var result = new List<Client>();

            try
            {
                if (string.IsNullOrEmpty(prefix) || string.IsNullOrEmpty(phone))
                {
                    error = "Parameters prefix and phone must not be empty";
                }
                else 
                {
                    result = await _clientInfoManagementService.FindClientsInfoByPhone(prefix, phone);
                    success = true;
                }
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError(ex, $"Error processing {nameof(GetClientInfo)} request");
                #endregion

                error = ex.Message;
            }

            #region [log]
            log.LogTrace("LEAVE {0}", nameof(GetClientInfo));
            #endregion

            return new DataListResponse<Client> { Success = success, Error = error, Result = result };
        }
        /// <summary>
        /// Возвращает список всех долгов клиента
        /// </summary>
        /// <param name="clientCode">Уникальный код клиента</param>
        /// <returns></returns>
        [Route("getDebts")]
        [HttpGet]
        public async Task<DataListResponse<Debt>> GetDebts(string clientCode)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(GetDebts));
            #endregion

            var success = false;
            var error = string.Empty;
            var result = new List<Debt>();

            try
            {
                if (string.IsNullOrEmpty(clientCode))
                {
                    error = "Parameter clientCode must not be empty";
                }
                else
                {
                    result = await _clientInfoManagementService.GetDebtList(int.Parse(clientCode));
                    success = true;
                }
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError(ex, $"Error processing {nameof(GetDebts)} request");
                #endregion

                error = ex.Message;
            }

            #region [log]
            log.LogTrace("LEAVE {0}", nameof(GetDebts));
            #endregion

            return new DataListResponse<Debt> { Success = success, Error = error, Result = result };
        }
        /// <summary>
        /// Производит полную оплату одного приема
        /// </summary>
        /// <param name="info">Информация по оплачиваемому приему</param>
        /// <returns></returns>
        [Route("fullPay")]
        [HttpPost]
        public async Task<Response> PayTreatment(PaymentInfo info)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(PayTreatment));
            #endregion

            var isPaymentSuccess = false;
            var error = string.Empty;
            
            try
            {  
                isPaymentSuccess = await _clientInfoManagementService.MakeFullReceptionPayment(info);
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError(ex, $"Error processing {nameof(PayTreatment)} request");
                #endregion

                error = ex.Message;
            }
            
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(PayTreatment));
            #endregion
            
            return new Response { Success = isPaymentSuccess, Error = error };
        }
        [Route("upfrontPay")]
        [HttpPost]
        public async Task<Response> UpfrontPay(PaymentInfo info)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(UpfrontPay));
            #endregion

            var isPaymentSuccess = false;
            var error = string.Empty;

            try
            {
                isPaymentSuccess = await _clientInfoManagementService.MakeUpfrontReceptionPayment(info);
            }
            catch (Exception ex)
            {
                #region [log]
                log.LogError(ex, $"Error processing {nameof(UpfrontPay)} request");
                #endregion

                error = ex.Message;
            }

            #region [log]
            log.LogTrace("LEAVE {0}", nameof(UpfrontPay));
            #endregion

            return new Response { Success = isPaymentSuccess, Error = error };
        }
        #endregion
    }
}
