using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    public class JPaymentDet
    {
        [Key]
        [Column("PDID")]
        public long Id { get; init; }

        [Column("JID")]
        public long Jid { get; init; } = 2;

        [Column("AMOUNT")]
        public double AmountUSD { get; init; }

        [Column("AMOUNTRUB")]
        public double Amount { get; init; }

        [Column("SCHID")]
        public long Schid { get; init; } = - 2;

        [Column("PCODE")]
        public long ClientCode { get; init; }

        [Column("SCOUNT")]
        public int SCount { get; init; } = 1;

        [Column("TOOTHCODE")]
        public long ToothCode { get; init; } = 0;

        [Column("FILIAL")]
        public long Filial { get; init; } = 1;

        [Column("REALCOUNT")]
        public long RealCount { get; init; } = 1;

        [Column("ACCESSLEVEL")]
        public long AccessLevel { get; init; } = 1;

        [Column("CASHID")]
        public long CashId { get; init; } = 1;

        [Column("TREATCODE")]
        public long TreatCode { get; init; }

        [Column("BNALPAY")]
        public long BinalPay { get; init; } = 1;

        [Column("EXTREATCODE")]
        public long ExTreatCode { get; init; }

        [Column("DCODE")]
        public long DoctorCode { get; init; }

        [Column("PID")]
        public long PID { get; init; }

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; init; } = 3;

        [Column("PMDATE")]
        public DateTime Date { get; init; } = DateTime.Now.Date;

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; init; } = DateTime.Now;

        [Column("TRANSACTID")]
        public long TransactionId { get; init; }
    }
}
