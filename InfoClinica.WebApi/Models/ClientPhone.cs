using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class ClientPhone
    {
        public long PhoneId { get; set; }
        public long PCode { get; set; }
        public int PhoneType { get; set; }
        public string Prefix { get; set; }
        public string Phone { get; set; }

        public ClientPhone (string phone, string prefix)
        {
            Phone = phone;
            Prefix = prefix;
        }
    }
}
