using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class ClientPhone
    {
        public long PhoneId { get; init; }
        public long PCode { get; init; }
        public int PhoneType { get; init; }
        public string Prefix { get; init; }
        public string Phone { get; init; }

    }
}
