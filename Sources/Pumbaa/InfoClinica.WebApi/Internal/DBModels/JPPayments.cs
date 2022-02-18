using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    [Table("JPPAYMENTS")]
    public class JPPayments
    {
        [Key]
        [Column("PID")]
        public long Id { get; init; }

        [Column("JID")]
        public long Jid { get; init; } = 100;

        [Column("TREATCODE")]
        public long TreatmentCode { get; init; }

        [Column("PMDATE")]
        public DateTime Date { get; init; } = DateTime.Now.Date;

        [Column("AMOUNT")]
        public double AmountUSD { get; init; }

        [Column("PCODE")]
        public long ClientCode { get; init; }

        [Column("DCODE")]
        public long DoctorCode { get; init; }

        [Column("AMOUNTRUB")]
        public double Amount { get; init; }

        [Column("UID")]
        public long UID { get; init; } = 10000001;

        [Column("EXTREATCODE")]
        public long ExTreatCode { get; init; }

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; init; } = DateTime.Now;

        [Column("TRANSACTID")]
        public long TransactionId { get; init; }

        [Column("OPERTYPE")]
        public string OperationType { get; init; } = "1";

        [Column("AGRID")]
        public long Agrid { get; init; } = 2;

        [Column("FILIAL")]
        public long Filial { get; init; } = 1;

        [Column("ACCESSLEVEL")]
        public long AccessLevel { get; init; }

        [Column("BNALPAY")]
        public int BinalPay { get; init; } = 0;

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; init; } = 3;

        [Column("CASHID")]
        public long CashId { get; init; } = 1;

        [Column("PLANID")]
        public long PlanId { get; init; } = 0;

        [Column("GROUPPLANID")]
        public long GroupPlanId { get; init; } = 0;
    }
}
