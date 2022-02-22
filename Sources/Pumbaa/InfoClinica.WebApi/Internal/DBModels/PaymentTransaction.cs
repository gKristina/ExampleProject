using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    public class PaymentTransaction
    {
        [Key]
        [Column("TRANSACTID")]
        public long TransactionId { get; init; }

        [Column("COMMENT")]
        public string Comment { get; init; } = "платеж через терминал";

        [Column("PCODE")]
        public long ClientCode { get; init; }

        [Column("ADATE")]
        public DateTime TransactionDate { get; init; } = DateTime.Now.Date;

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; init; } = DateTime.Now;

        [Column("CASHID")]
        public long CashId { get; init; } = 1;

        [Column("CLINICID")]
        public long ClinicId { get; init; } = 1;

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; init; } = 3;

        [Column("CHECKNUMI")]
        public long CheckNum { get; init; }

        [Column("CHECKPRINT")]
        public long CheckPrint { get; init; }

        [Column("PAYMENTNUM")]
        public long PaymentNum { get; init; }

        [Column("CASHTM")]
        public long CashTM { get; init; }

        [Column("PLATNAME")]
        public string PlatName { get; init; }

        [Column("UID")]
        public long UID { get; init; }

        [Column("KKM_CASHPLAT")]
        public int KkmCashPlat { get; init; }

        [Column("KKM_CASHPLATNAME")]
        public string KkmCashPlatName { get; init; }

        [Column("KKM_CREDPLATNAME")]
        public string KkmCredPlatName { get; init; }

        [Column("KKM_CREDPLAT")]
        public int KkmCredPlat { get; init; }

        [Column("PAYERPCODE")]
        public long PayerCode { get; init; }

    }
}
