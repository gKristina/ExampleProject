using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Client
    {
        public long Code { get; init; }
        public string LastName { get; init; }
        public string FirstName { get; init; }
        public string MiddleName { get; init; }
        public string FullName { get; init; }

    }
}
