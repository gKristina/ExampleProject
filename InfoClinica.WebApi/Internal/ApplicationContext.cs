using ECash.Rafiki.Abstraction;
using Ecash.InfoClinica.Database.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ECash.InfoClinica.Database.Internal.Data;
using ECash.InfoClinica.Database.Internal.Models;
using ECash.InfoClinica.WebApi.Internal.DBModels;
using ECash.InfoClinica.WebApi.Utils;

namespace Ecash.InfoClinica.Database.Data 
{
    public class ApplicationContext : DbContext
    {
        
        private readonly ISettingsStore _store;

        #region Constructors
        public ApplicationContext()
        {
        }
        public ApplicationContext(ISettingsStore store, DbContextOptions<ApplicationContext> options)
            :base (options)
        {
            _store = store ?? throw new ArgumentNullException(nameof(store));
        }
        #endregion

        public DbSet<ClientsDB> Clients { get; set; }
        public DbSet<ClientPhonesDB> ClientPhones { get; set; }
        public DbSet<TransactionListDB> TransactionList { get; set; }
        public DbSet<LoseCreditDB> LoseCredit { get; set; }
        public DbSet<JPPaymentsDB> JPPayments { get; set; }
        public DbSet<JPaymentDetDB> JPaymentDet { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //var settings = _store.GetSettings<ApplicationContextSettings>(Constants.InfoClinicaSettings).Result;
            //var connectionString = settings.ConnectionString;
            optionsBuilder.UseFirebird("User ID=sysdba;Password=masterkey;DataSource=83.102.204.8;Port=7779;Database=test;Server Type=0;charset=utf8;", 
                providerOptions => providerOptions
                .WithExplicitStringLiteralTypes(false)
               .WithExplicitParameterTypes(false));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
          
            modelBuilder.Entity<ClientsDB>().ToTable("CLIENTS");
            modelBuilder.Entity<ClientPhonesDB>().ToTable("CLPHONES");
            modelBuilder.Entity<TransactionListDB>().ToTable("TRANSACTLIST");
            modelBuilder.Entity<LoseCreditDB>().ToTable("LOSECREDIT");
            modelBuilder.Entity<JPPaymentsDB>().ToTable("JPPAYMENTS");
            modelBuilder.Entity<JPaymentDetDB>().ToTable("JPAYMDET");
            modelBuilder.Entity<DebtsDB>().HasNoKey().ToView(null);

            base.OnModelCreating(modelBuilder);
            
        }


    }
}
