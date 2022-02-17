using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace ECash.InfoClinica.Database.Internal.Models
{
    [Table("CLPHONES")]
    public class ClientPhones
    {
        [Key]
        [Column("CLPHONEID")]
        public long PhoneId { get; set; }

        [Column("PCODE")]
        public long ClientCode { get; set; }

        [Column("PHONETYPE")]
        public int PhoneType { get; set; }

        [Column("PHPREFIX")]
        public string Prefix { get; set; }

        [Column("PHONE")]
        public string Phone { get; set; }
    }
}
