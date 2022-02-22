using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ecash.InfoClinica.Database.Models
{
    public class Clients
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
