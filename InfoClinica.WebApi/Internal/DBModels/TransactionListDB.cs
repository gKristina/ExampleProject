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
    public class TransactionListDB
    {
        [Key]
        [Column("TRANSACTID")]
        public long TransactionId { get; set; }

        [Column("COMMENT")]
        public string Comment { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("ADATE")]
        public DateTime TransactionDate { get; set; }

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; set; }

        [Column("CASHID")]
        public long CashId { get; set; }

        [Column("CLINICID")]
        public long ClinicId { get; set; }

        [Column("MONEYCASHID")]
        public long MoneyCashId { get; set; }

        public TransactionListDB(long transactionId, long clientCode, DateTime transactionDate) 
        {
            TransactionId = transactionId;
            Comment = "платеж через терминал";
            ClientCode = clientCode;
            TransactionDate = transactionDate;
            CashId = 1;
            ClinicId = 1;
            MoneyCashId = 3;

        }

    }
}
