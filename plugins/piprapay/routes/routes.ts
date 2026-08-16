export const piprapayRoutes = [
  {
    path: '/api/plugins/piprapay/test-connection',
    method: 'POST',
    description: 'Diagnose connection to PipraPay Gateway API'
  },
  {
    path: '/api/payments/webhook/piprapay',
    method: 'POST',
    description: 'Receive real-time IPN payment webhooks'
  },
  {
    path: '/api/payments/checkout',
    method: 'POST',
    description: 'Central payment creation gateway'
  }
];

export default piprapayRoutes;
