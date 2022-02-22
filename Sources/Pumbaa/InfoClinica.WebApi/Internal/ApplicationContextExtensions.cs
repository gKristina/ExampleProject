using System.Linq;
using Ecash.InfoClinica.Database.Data;
using Microsoft.EntityFrameworkCore;
using db = ECash.InfoClinica.WebApi.Internal.DBModels;

namespace ECash.InfoClinica.WebApi.Internal
{
    internal static class ApplicationContextExtensions
    {
        /// <summary>
        /// Возращает следующее значение последовательности
        /// </summary>
        /// <param name="context"></param>
        /// <param name="genName">Название последовательности</param>
        /// <returns></returns>
        internal static long NextValueFor(this ApplicationContext context, string genName)
        {
            var sql = $"SELECT NEXT VALUE FOR {genName} AS Id FROM RDB$DATABASE";

            return context.Set<db.IdResult>()
                .FromSqlRaw(sql)
                .AsNoTracking()
                .First()
                .Id;
        }
    }
}
