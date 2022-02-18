using System.ComponentModel.DataAnnotations.Schema;

namespace ECash.InfoClinica.WebApi.Internal.DBModels
{
    public class IdResult
    {
        [Column("ID")]
        public long Id { get; set; }
    }
}
