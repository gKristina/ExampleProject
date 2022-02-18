using ECash.Vole.MvcPlugIn;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;


namespace ECash.InfoClinica.WebApi
{
    public class PlugIn : MvcPlugInBase
    {
        #region Constructors
        public PlugIn(ILogger<PlugIn> log)
            : base(log)
        {
        }
        #endregion

        #region Overrides
        /// <summary>
        /// Регистрирует службы в коллекции служб
        /// </summary>
        /// <param name="registry">Коллекция регистраций служб</param>
        /// <param name="config">Конфигурация приложения</param>
        public override void ConfigureServices(IServiceCollection registry, IConfiguration config)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(ConfigureServices));
            #endregion
            base.ConfigureServices(registry, config);
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(ConfigureServices));
            #endregion
        }
        /// <summary>
        /// Настраивает MVC
        /// </summary>
        /// <param name="builder">Настройщик MVC</param>
        public override void ConfigureMvc(IMvcBuilder builder)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(ConfigureMvc));
            #endregion

            base.ConfigureMvc(builder);

            builder.AddApplicationPart(typeof(PlugIn).Assembly);


            #region [log]
            log.LogTrace("LEAVE {0}", nameof(ConfigureMvc));
            #endregion

        }
        #endregion

        #region Private methods
        private void Configure (IApplicationBuilder app) 
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(Configure)}");
            #endregion
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
            #region [log]
            log.LogTrace("LEAVE {0}", nameof(Configure));
            #endregion
        }

        #endregion
    }
}
