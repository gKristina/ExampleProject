using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    [Table("LOSECREDIT")]
    public class LoseCredit
    {
        [Key]
        [Column("LCID")]
        public long Id { get; init; }

        [Column("FILIAL")]
        public int Filial { get; init; } = 1;

        [Column("LCDATE")]
        public DateTime Date { get; init; } = DateTime.Now.Date;

        [Column("PCODE")]
        public long ClientCode { get; init; }

        [Column("DCODE")]
        public long DoctorCode { get; init; }

        [Column("TREATCODE")]
        public long TreatmentCode { get; init; }

        [Column("PAYCODE")]
        public Int16 PayCode { get; init; } = 1;

        [Column("AMOUNTRUB")]
        public double Amount { get; init; }

        [Column("AMOUNT")]
        public double AmountUSD { get; init; }

        [Column("TYPEAMOUNT")]
        public Int16 TypeAmount { get; init; } = 2;

        [Column("ACCESSLEVEL")]
        public Int16 AccessLevel { get; init; } = 1;

        [Column("TRANSACTID")]
        public long TransactionId { get; init; } 

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; init; } = DateTime.Now;

        [Column("JID")]
        public long Jid { get; init; } = 100;

        [Column("AGRID")]
        public long Agrid { get; init; } = 2;

        [Column("CASHID")]
        public long CashId { get; init; } = 1;

        [Column("NUMDOC")]
        public long NumDoc { get; init; }

        [Column("BNALPAY")]
        public int BinalPay { get; init; } = 0;

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; init; } = 3;

    }
}
