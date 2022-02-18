using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Response
    {
        public bool Success { get; init; }
        public string Error { get; init; }   
    }
    public class Response<T> : Response
    {
        public T Result { get; init; }
    }

    public class DataListResponse<T> : Response
    {
        public List<T> Result { get; init; }
    }

}
