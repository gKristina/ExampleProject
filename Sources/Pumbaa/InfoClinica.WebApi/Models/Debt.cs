using System;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Debt
    {
        public long OrderCode { get; init; }
        public long TreatmentCode { get; init; }
        public DateTime TreatmentDate { get; init; }
        public int DebtDaysCount { get; init; }
        public long DoctorCode { get; init; }
        public long ClientCode { get; init; }
        public string FullName { get; init; }
        public string DoctorName { get; init; }
        public double TreatmentAmount { get; init; }
        public double DebtAmount { get; init; }
    }
}
