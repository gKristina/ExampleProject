using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    public class Debts
    {
        [Column("ORDERNO")]
        public long OrderCode { get; set; }

        [Column("TREATCODE")]
        public long TreatCode { get; set; }

        [Column("TREATDATE")]
        public DateTime TreatDate { get; set; }

        [Column("DAYSCOUNT")]
        public int DebtDaysCount { get; set; }

        [Column("DCODE")]
        public long DoctorCode { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("FULLNAME")]
        public string FullName { get; set; }

        [Column("DNAME")]
        public string DoctorName { get; set; }

        [Column("AMOUNTRUB")]
        public double TreatAmount { get; set; }

        [Column("DOLGRUB")]
        public double DebtAmount { get; set; }
    }
}
