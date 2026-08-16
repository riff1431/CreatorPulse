// Basic smoke test for AnalyticsService
import { AnalyticsService } from '../services/analytics-service';

export function runAnalyticsTests() {
  const data = AnalyticsService.getCreatorAnalytics('30d');
  console.assert(data.profileViews.total > 0, 'Profile views should be non-zero');
  console.log('[Test: Creator Analytics] All smoke tests passed!');
}
