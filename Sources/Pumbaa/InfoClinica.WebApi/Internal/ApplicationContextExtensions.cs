using Ecash.InfoClinica.Database.Data;
using Microsoft.EntityFrameworkCore;
using System.Linq;
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
            string sql = string.Format("SELECT NEXT VALUE FOR {0} AS Id FROM RDB$DATABASE", genName);
            return context.Set<db.IdResult>().FromSqlRaw(sql).AsNoTracking().First().Id;
        }
    }
}
