export interface PipraPayTransactionRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  gatewayReference: string;
  createdAt: string;
}
