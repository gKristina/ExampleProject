using System;

namespace ECash.InfoClinica.WebApi.Internal
{
    internal static class PaymentUtils
    {
        internal static double ConvertToInfoClinicUSD(double value) 
        {
            return Math.Round(value / 3, 2);
        }
    }
}
