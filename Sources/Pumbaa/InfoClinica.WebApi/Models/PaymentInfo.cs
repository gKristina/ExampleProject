using System;
using System.ComponentModel.DataAnnotations;

namespace ECash.InfoClinica.WebApi.Models
{
    public class PaymentInfo
    {
        [Required]
        public long OrderCode { get; set; }

        [Required]
        public long TreatmentCode{ get; set; }

        [Required]
        public DateTime TreatmentDate { get; set; }

        [Required]
        public int DebtDaysCount { get; set; }

        [Required]
        public long DoctorCode { get; set; }

        [Required]
        public long ClientCode { get; set; }

        [Required]
        public string FullName { get; set; }

        [Required]
        public string DoctorName { get; set; }

        [Required]
        public double TreatmentAmount { get; set; }

        [Required]
        public double DebtAmount { get; set; }

        [Required]
        public double Paid { get; set; }
    }
}
