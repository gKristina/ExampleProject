using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Debt
    {
        public long OrderCode { get; set; }
        public long TreatmentCode { get; set; }
        public DateTime TreatmentDate { get; set; }
        public int DebtDaysCount { get; set; }
        public long DoctorCode { get; set; }
        public long ClientCode { get; set; }
        public string FullName { get; set; }
        public string DoctorName { get; set; }
        public double TreatmentAmount { get; set; }
        public double DebtAmount { get; set; }

        public Debt(long orderCode, long treadCodeNumber, DateTime treadDate,int debtsDaysCount, long doctorCode, 
            long clientCode, string fullName, string doctorName, double treatAmount, double debtAmount )
        {
            OrderCode = orderCode;
            TreatmentCode = treadCodeNumber;
            TreatmentDate = treadDate;
            DebtDaysCount = debtsDaysCount;
            DoctorCode = doctorCode;
            FullName = fullName;
            ClientCode = clientCode;
            DoctorName = doctorName;
            TreatmentAmount = treatAmount;
            DebtAmount = debtAmount;
        }
    }
}
