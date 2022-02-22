using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    public class UpfrontPayment
    {
        [Key]
        [Column("ID")]
        public long Id { get; init; }

        [Column("PCODE")]
        public long ClientCode { get; init; }

        [Column("PAYDATE")]
        public DateTime PayDate { get; init; } = DateTime.Now.Date;

        [Column("AMOUNTRUB")]
        public double Amount { get; init; }

        [Column("AMOUNTUE")]
        public double AmountUSD { get; init; }

        [Column("CURRTYPE")]
        public double CurrType { get; init; } = 1;

        [Column("TYPEOPER")]
        public long OperationType { get; init; } = 3;

        [Column("DCODE")]
        public long DoctorCode { get; init; } = -1;

        [Column("FILIAL")]
        public long Filial { get; init; } = 1;

        [Column("ACCESSLEVEL")]
        public long AccessLevel { get; init; } = 1;

        [Column("TRANSACTID")]
        public long TransactionId { get; init; }

        [Column("MODIFYDATE")]
        public DateTime ModyfyDate { get; init; } = DateTime.Now;

        [Column("UID")]
        public long Uid { get; init; } = 10000001;

        [Column("NUMDOC")]
        public long DocumentNumber { get; init; }

        [Column("JID")]
        public long Jid { get; init; } = 100;

        [Column("AGRID")]
        public long Agrid { get; init; } = 2;

        [Column("CASHID")]
        public long CashId { get; init; } = 1;

        [Column("BNALPAY")]
        public long BinalPay { get; init; } = 0;

        [Column("PLANID")]
        public long PlanId { get; init; } = 0;

        [Column("GROUPPLANID")]
        public long GroupPlanId { get; init; } = 0;

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; init; } = 3;

        [Column("TRANS_FAMILY")]
        public long TransFamily { get; init; } = 0;

        [Column("AVANSTYPE")]
        public long UpfrontPaymentType { get; init; } = 2;

    }
}
