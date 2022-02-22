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
}
