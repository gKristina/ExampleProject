
using System;

namespace ECash.InfoClinica.WebApi.Internal
{
    internal static class Constants
    {
        public const string InfoClinicaSettings = "InfoClinica";

        internal static class Sequences
        {
            public const string TransactionId = "PAYTERMINAL_GEN";
        }

        internal static class UpfrontPayment
        {
            public const long Uid = 10000001;
            public const long ChekNum = 0;
            public const long CheckPrint = 0;
            public const long PaymentNum = 0;
            public const long CashTM = 0;
            public const string PlatName = "";
            public const int KkmCashPlat = 1;
            public const int KkmCredPlat = 2;
            public const string CashPlatName = "";
            public const string CredPlatName = "";
            public const long PayerCode = 0;
            public const long OperationType = 0;
            public const long Shid = -1;
        }
    }

    internal static class PaymentUtils
    {
        internal static double ConvertToInfoClinicUSD(double value) 
        {
            return Math.Round(value / 3, 2);
        }
    }


}
