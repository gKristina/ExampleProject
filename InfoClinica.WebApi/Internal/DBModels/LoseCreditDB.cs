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
    public class LoseCreditDB
    {
        [Key]
        [Column("LCID")]
        public long Id { get; set; }

        [Column("FILIAL")]
        public int Filial { get; set; }

        [Column("LCDATE")]
        public DateTime LoseCreditDate { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("DCODE")]
        public long DoctorCode { get; set; }

        [Column("TREATCODE")]
        public long TreatCode { get; set; }

        [Column("PAYCODE")]
        public Int16 PayCode { get; set; }

        [Column("AMOUNT")]
        public double Amount { get; set; }

        [Column("AMOUNTUSD")]
        public double AmountUSD { get; set; }

        [Column("TYPEAMOUNT")]
        public Int16 TypeAmount { get; set; }

        [Column("ACCESSLEVEL")]
        public Int16 AccessLevel { get; set; }

        [Column("TRANSACTID")]
        public long TransactionId { get; set; }

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; set; }

        [Column("JID")]
        public long Jid { get; set; }

        [Column("CASHID")]
        public long CashId { get; set; }

        [Column("NUMDOC")]
        public long NumDoc { get; set; }

        [Column("BNALPAY")]
        public int BinalPay { get; set; }

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; set; }
    }
}
