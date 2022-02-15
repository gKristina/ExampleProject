using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    [Table("JPAYMDET")]
    public class JPaymentDetDB
    {
        [Key]
        [Column("PDID")]
        public long Id { get; set; }

        [Column("AMOUNT")]
        public double AmountUSD { get; set; }

        [Column("AMOUNTRUB")]
        public double Amount { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("TREATCODE")]
        public long TreatCode { get; set; }

        [Column("EXTREATCODE")]
        public long ExTreatCode { get; set; }

        [Column("PID")]
        public long PID { get; set; }

        [Column("DCODE")]
        public long DoctorCode { get; set; }

        [Column("PMDATE")]
        public DateTime PaymentDate { get; set; }

        [Column("MODIFYDATE")]
        public DateTime ModifyDate { get; set; }

        [Column("TRANSACTID")]
        public long TransactionId { get; set; }
    }
}
