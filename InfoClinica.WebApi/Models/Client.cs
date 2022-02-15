using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Client
    {
        public long Code { get; set; }

        public string LastName { get; set; }

        public string FirstName { get; set; }

        public string MiddleName { get; set; }

        public string FullName { get; set; }

        public Client (long code, string lastName, string firstName, string middleName, string fullName)
        {
            Code = code;
            LastName = lastName;
            FirstName = firstName;
            MiddleName = middleName;
            FullName = fullName;
        }
    }
}
