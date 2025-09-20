export {};
declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: SnapResult) => void;
          onPending?: (result: SnapResult) => void;
          onError?: (result: SnapResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export interface SnapResult {
  transaction_status: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  fraud_status?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  [key: string]: unknown;
}
