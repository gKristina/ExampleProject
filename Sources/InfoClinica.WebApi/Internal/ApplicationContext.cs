using ECash.Rafiki.Abstraction;
using Ecash.InfoClinica.Database.Models;
using Microsoft.EntityFrameworkCore;
using System;
using ECash.InfoClinica.Database.Internal.Data;
using ECash.InfoClinica.Database.Internal.Models;
using ECash.InfoClinica.WebApi.Internal.DBModels;
using ECash.InfoClinica.WebApi.Internal;

namespace Ecash.InfoClinica.Database.Data 
{
    public class ApplicationContext : DbContext
    {
        #region Private fields
        private readonly ISettingsStore _store;
        #endregion

        #region Constructors
        public ApplicationContext(ISettingsStore store, DbContextOptions<ApplicationContext> options)
            :base (options)
        {
            _store = store ?? throw new ArgumentNullException(nameof(store));
        }
        #endregion

        #region DBSets
        internal DbSet<Clients> Clients { get; set; }
        internal DbSet<ClientPhones> ClientPhones { get; set; }
        internal DbSet<TransactionList> TransactionList { get; set; }
        internal DbSet<LoseCredit> LoseCredit { get; set; }
        internal DbSet<JPPayments> JPPayments { get; set; }
        internal DbSet<JPaymentDet> JPaymentDet { get; set; }
        #endregion

        #region Overrides
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var settings = _store.GetSettings<ApplicationContextSettings>(Constants.InfoClinicaSettings).Result;
            var connectionString = settings.ConnectionString;
            optionsBuilder.UseFirebird(connectionString, providerOptions => providerOptions.WithExplicitParameterTypes(false));
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Clients>().ToTable("CLIENTS");
            modelBuilder.Entity<ClientPhones>().ToTable("CLPHONES");
            modelBuilder.Entity<Debts>().HasNoKey().ToView(null);
            modelBuilder.Entity<IdResult>().HasNoKey().ToView(null);
            modelBuilder.Entity<LoseCredit>().ToTable("LOSECREDIT");
            modelBuilder.Entity<JPPayments>().ToTable("JPPAYMENTS");
            modelBuilder.Entity<JPaymentDet>().ToTable("JPAYMDET");
            modelBuilder.Entity<TransactionList>().ToTable("TRANSACTLIST");

            base.OnModelCreating(modelBuilder);
        }
        #endregion
    }
}
