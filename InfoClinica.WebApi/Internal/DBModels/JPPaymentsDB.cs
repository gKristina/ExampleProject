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
    public class JPPaymentsDB
    {
        [Key]
        [Column("PID")]
        public long Id { get; set; }

        [Column("TREATCODE")]
        public long TreatCode { get; set; }

        [Column("PMDATE")]
        public DateTime PaymentDate { get; set; }

        [Column("AMOUNT")]
        public double AmountUSD { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("DCODE")]
        public long DoctorCode { get; set; }

        [Column("AMOUNTRUB")]
        public double Amount { get; set; }

        [Column("UID")]
        public long UID { get; set; }

        [Column("EXTREATCODE")]
        public long ExTreatCode { get; set; }

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; set; }

        [Column("TRANSACTID")]
        public long TransactionId { get; set; }
    }
}
