using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ECash.InfoClinica.WebApi.Models
{
    public class Response<T>
    {
        public bool Success { get; set; }
        public string Error { get; set; }  
        public List<T> Result { get; set; }   

        public Response (bool success, string error)
        {
            Success = success;
            Error = error;
        }

        public Response(bool success, List<T> result)
        {
            Success = success;
            Result = result;
        }
    }
}
