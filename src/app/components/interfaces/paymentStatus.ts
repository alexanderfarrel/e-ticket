export interface PaymentStatusInterface {
  id?: string;
  status: string;
  name: string;
  email: string;
  order_id: string;
  event_id: string;
  ticket: number;
  event_name: string;
}
