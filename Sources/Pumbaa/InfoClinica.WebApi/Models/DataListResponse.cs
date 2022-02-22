using System.Collections.Generic;

namespace ECash.InfoClinica.WebApi.Models
{
    public class DataListResponse<T> : Response
    {
        public List<T> Result { get; init; }
    }
}
