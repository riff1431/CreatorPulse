import { PipraPayService } from '../services/piprapay.service';

export async function handlePipraPayApi(action: string, payload: any, settings: any, secrets: any) {
  if (action === 'test_connection') {
    return await PipraPayService.testConnection(settings, secrets);
  }

  if (action === 'create_charge') {
    return await PipraPayService.createCharge(payload, settings, secrets);
  }

  return { error: `Unsupported PipraPay API action: ${action}` };
}
