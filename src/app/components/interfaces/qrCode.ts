export interface QrCodeInterface {
  id?: string;
  email: string;
  isScanned: boolean;
  // isScanned: Record<string, boolean>[];
  name: string;
  qr_code: string;
  id_event: string;
  transaction_id: string;
  transaction_time: string;
  payment_type: string;
  ticket: number;
  order_id: string;
  event_name: string;
  scanned_at: string;
  action: string;
}

export interface CustDataInterface {
  data: QrCodeInterface;
  qrIndex: number;
  key: string;
  message?: string;
}
