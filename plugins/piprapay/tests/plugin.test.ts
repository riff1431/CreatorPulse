import { PipraPayGatewayAdapter } from '../services/piprapay-adapter';
import { PipraPayService } from '../services/piprapay.service';

describe('PipraPayGatewayAdapter', () => {
  it('should initialize PipraPay adapter with correct ID', () => {
    const adapter = new PipraPayGatewayAdapter();
    expect(adapter.id).toBe('plugin-piprapay');
  });

  it('should map completed status correctly', () => {
    const adapter = new PipraPayGatewayAdapter();
    expect(adapter.mapStatus('completed')).toBe('Completed');
    expect(adapter.mapStatus('paid')).toBe('Completed');
    expect(adapter.mapStatus('failed')).toBe('Failed');
  });
});
