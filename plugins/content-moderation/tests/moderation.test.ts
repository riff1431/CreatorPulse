import { ModerationService } from '../services/moderation-service';

describe('ModerationService', () => {
  it('should scan clean text and return allow', async () => {
    const res = await ModerationService.scanText('Hello world, nice to meet you!');
    expect(res.flagged).toBe(false);
    expect(res.action).toBe('allow');
  });

  it('should detect prohibited keywords', async () => {
    const res = await ModerationService.scanText('This is malware and phishing');
    expect(res.flagged).toBe(true);
    expect(res.action).toBe('block');
  });
});
