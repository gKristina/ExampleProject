using ECash.InfoClinica.Database;
using ECash.Vole.MvcPlugIn;
using Microsoft.AspNetCore.Builder;
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
        /// Настраивает MVC
        /// </summary>
        /// <param name="builder">Настройщик MVC</param>
        public override void ConfigureMvc(IMvcBuilder builder)
        {
            #region [log]
            log.LogTrace("ENTER {0}", nameof(ConfigureMvc));
            #endregion
            base.ConfigureMvc(builder);
            builder.Services.AddScoped<ClientInfoManagementService>();
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
