using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    [Table("TRANSACTLIST")]
    public class TransactionList
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

    }
}
