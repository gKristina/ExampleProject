using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Response<T>
    {
        public bool Success { get; init; }
        public string Error { get; init; }  
        public List<T> Result { get; init; }   
    }
}
