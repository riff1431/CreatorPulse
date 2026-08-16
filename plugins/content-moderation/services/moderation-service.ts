export interface ModerationRule {
  id: string;
  keyword: string;
  action: 'block' | 'flag' | 'blur' | 'notify';
  severity: 'low' | 'medium' | 'high';
}

export interface ModerationLog {
  id: string;
  contentType: 'post' | 'comment' | 'message' | 'story' | 'image';
  contentId: string;
  creatorId: string;
  triggeredKeywords: string[];
  actionTaken: 'blocked' | 'flagged' | 'blurred' | 'allowed';
  confidenceScore: number;
  timestamp: string;
}

export class ModerationService {
  private static BLOCKED_KEYWORDS = [
    'hate', 'scam', 'phishing', 'exploit', 'malware', 'violence'
  ];

  public static async scanText(text: string): Promise<{
    flagged: boolean;
    severity: 'none' | 'low' | 'medium' | 'high';
    matchedKeywords: string[];
    action: 'allow' | 'flag' | 'block';
  }> {
    const matched: string[] = [];
    const lower = text.toLowerCase();

    for (const kw of this.BLOCKED_KEYWORDS) {
      if (lower.includes(kw)) {
        matched.push(kw);
      }
    }

    if (matched.length > 1) {
      return { flagged: true, severity: 'high', matchedKeywords: matched, action: 'block' };
    }
    if (matched.length === 1) {
      return { flagged: true, severity: 'medium', matchedKeywords: matched, action: 'flag' };
    }
    return { flagged: false, severity: 'none', matchedKeywords: [], action: 'allow' };
  }
}

export class ReportService {
  public static async submitReport(report: {
    targetType: string;
    targetId: string;
    reason: string;
    reportedBy: string;
  }) {
    console.log('[Content Moderation] Report submitted:', report);
    return { success: true, reportId: `rep-${Date.now()}` };
  }
}

export class KeywordService {
  public static getKeywords(): string[] {
    return ['hate', 'scam', 'phishing', 'exploit', 'malware', 'violence'];
  }
}

export class RuleEngineService {
  public static evaluateRules(text: string) {
    return ModerationService.scanText(text);
  }
}

export class ModerationLogService {
  public static getLogs(): ModerationLog[] {
    return [];
  }
}
