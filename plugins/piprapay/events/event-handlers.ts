/**
 * PipraPay Event Listeners
 */
export const piprapayEventHandlers = {
  onPaymentSuccess: (event: any) => {
    console.log('[PipraPay Event] Payment Succeeded:', event);
  },
  onPaymentFailed: (event: any) => {
    console.log('[PipraPay Event] Payment Failed:', event);
  }
};
