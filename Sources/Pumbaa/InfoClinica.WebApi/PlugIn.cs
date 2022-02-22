using ECash.InfoClinica.Database;
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

        public override void ConfigureServices(IServiceCollection registry, IConfiguration config)
        {
            #region [log]
            log.LogTrace($"ENTER {nameof(ConfigureServices)}");
            #endregion
            base.ConfigureServices(registry, config);
            registry.AddScoped<ClientInfoManagementService>();
            #region [log]
            log.LogTrace($"LEAVE {nameof(ConfigureServices)}");
            #endregion
        }
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
