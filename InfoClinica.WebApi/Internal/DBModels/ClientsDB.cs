using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Ecash.InfoClinica.Database.Models
{
    [Table("CLIENTS")]
    public class ClientsDB
    {
        [Key]
        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("LASTNAME")]
        public string LastName { get; set; }

        [Column("FIRSTNAME")]
        public string FirstName { get; set; }

        [Column("MIDNAME")]
        public string MidName { get; set; }

        [Column("FULLNAME")]
        public string FullName { get; set; }

    }
}
