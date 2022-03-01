import Schedule from "@/helpers/plugin/Schedule";
import { apiService } from '@/services/api/apiService';

export const PaymentSchedule = Schedule.create(
  ({id, data}) => new Promise((resolve, reject) => {
    apiService.pay(data)
      .then(result => result ? resolve() : reject())
      .catch(reject)
  })
)