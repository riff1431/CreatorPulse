export interface EmailTemplateVariable {
  key: string;
  label: string;
  example: string;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  category: 'auth' | 'membership' | 'payout' | 'notification' | 'moderation';
  subject: string;
  bodyHtml: string;
  enabled: boolean;
  variables: EmailTemplateVariable[];
  updatedAt: string;
}

const STORAGE_EMAIL_TEMPLATES_KEY = 'creatorpulse_email_templates';

export const COMMON_VARIABLES: EmailTemplateVariable[] = [
  { key: '{{user_name}}', label: 'User Full Name', example: 'Sarah Jenkins' },
  { key: '{{user_email}}', label: 'User Email', example: 'sarah@designcode.com' },
  { key: '{{site_name}}', label: 'Platform Name', example: 'CreatorPulse' },
  { key: '{{app_url}}', label: 'Platform URL', example: 'https://creatorpulse.io' },
  { key: '{{action_url}}', label: 'Primary Action Link', example: 'https://creatorpulse.io/auth/verify?token=xyz' },
  { key: '{{support_email}}', label: 'Support Email', example: 'support@creatorpulse.com' },
  { key: '{{date}}', label: 'Current Date', example: 'August 15, 2026' }
];

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    slug: 'signup_welcome',
    name: 'Signup Welcome Email',
    category: 'auth',
    subject: 'Welcome to {{site_name}}, {{user_name}}! 🎉',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{login_url}}', label: 'Login Link', example: 'https://creatorpulse.io/auth/login' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #4f46e5, #ec4899); padding: 32px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Welcome to {{site_name}}</h1>
      <p style="margin-top: 8px; opacity: 0.9; font-size: 14px;">Your digital creator journey begins here</p>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hi <strong>{{user_name}}</strong>,</p>
      <p>Thank you for creating your account on <strong>{{site_name}}</strong>! We are thrilled to have you join our vibrant creator & supporter community.</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="{{action_url}}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Explore CreatorPulse Hub</a>
      </div>
      <p style="font-size: 13px; color: #64748b;">If you have any questions, feel free to contact us at <a href="mailto:{{support_email}}" style="color: #4f46e5;">{{support_email}}</a>.</p>
    </div>
    <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
      &copy; {{date}} {{site_name}}. All rights reserved.
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'tpl-2',
    slug: 'email_verification',
    name: 'Email Address Verification',
    category: 'auth',
    subject: 'Verify your email address for {{site_name}}',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{verification_code}}', label: '6-Digit Code', example: '894-102' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: #1e293b; padding: 24px; text-align: center; color: white;">
      <h2 style="margin: 0; font-size: 20px;">Verify Your Email Address</h2>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hello <strong>{{user_name}}</strong>,</p>
      <p>Please confirm your email address (<code>{{user_email}}</code>) to activate full access to {{site_name}}.</p>
      <div style="background-color: #f1f5f9; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #4f46e5;">
        {{verification_code}}
      </div>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="{{action_url}}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block;">Verify Account Now</a>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'tpl-3',
    slug: 'password_reset',
    name: 'Password Reset Instruction',
    category: 'auth',
    subject: 'Reset your password for {{site_name}}',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{reset_link}}', label: 'Password Reset URL', example: 'https://creatorpulse.io/auth/reset?token=abc' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <h2 style="margin-top: 0; color: #4f46e5;">Password Reset Request</h2>
      <p>Hi {{user_name}},</p>
      <p>We received a request to reset your password for {{site_name}}. Click the button below to choose a new password:</p>
      <div style="margin: 28px 0; text-align: center;">
        <a href="{{reset_link}}" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'tpl-4',
    slug: 'membership_activated',
    name: 'VIP Membership Activated',
    category: 'membership',
    subject: 'Your VIP Membership for {{creator_name}} is Active! 🌟',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{creator_name}}', label: 'Creator Name', example: 'Sarah Jenkins' },
      { key: '{{plan_name}}', label: 'Membership Plan', example: 'VIP Inner Circle' },
      { key: '{{amount}}', label: 'Plan Price', example: '$25.00/mo' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 32px; text-align: center; color: white;">
      <h2 style="margin: 0;">VIP Membership Confirmed!</h2>
      <p style="margin-top: 6px; opacity: 0.9;">You unlocked exclusive posts & perks</p>
    </div>
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <p>Hi {{user_name}},</p>
      <p>Your subscription to <strong>{{creator_name}}</strong> ({{plan_name}} - {{amount}}) has been successfully activated.</p>
      <div style="margin: 24px 0; text-align: center;">
        <a href="{{action_url}}" style="background-color: #ec4899; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Access Creator Feed</a>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'tpl-5',
    slug: 'payout_processed',
    name: 'Payout Processed Notice',
    category: 'payout',
    subject: 'Payout Processed: {{amount}} sent to your bank account',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{amount}}', label: 'Payout Amount', example: '$1,250.00' },
      { key: '{{payout_method}}', label: 'Payout Method', example: 'Bank Transfer (Stripe)' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <h2 style="margin-top: 0; color: #059669;">Payout Dispatched</h2>
      <p>Hello {{user_name}},</p>
      <p>Great news! Your payout request of <strong>{{amount}}</strong> via {{payout_method}} has been processed and sent to your account.</p>
      <div style="background-color: #ecfdf5; padding: 16px; border-radius: 12px; border: 1px solid #a7f3d0; margin: 20px 0;">
        <strong style="color: #047857;">Transfer Details:</strong><br />
        Amount: {{amount}}<br />
        Date: {{date}}<br />
        Status: Completed
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'tpl-6',
    slug: 'system_notification',
    name: 'System Notification Announcement',
    category: 'notification',
    subject: 'Important System Announcement from {{site_name}}',
    enabled: true,
    updatedAt: '2026-08-15 00:00:00',
    variables: [
      ...COMMON_VARIABLES,
      { key: '{{message_content}}', label: 'Custom Message', example: 'We have updated our terms of service.' }
    ],
    bodyHtml: `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f5f7; padding: 30px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="padding: 32px; color: #1e293b; line-height: 1.6;">
      <h2 style="margin-top: 0; color: #4f46e5;">Platform Update</h2>
      <p>Dear {{user_name}},</p>
      <div style="padding: 16px; background-color: #f8fafc; border-left: 4px solid #4f46e5; margin: 20px 0;">
        {{message_content}}
      </div>
      <p style="font-size: 13px; color: #64748b;">Thank you for being a valued part of {{site_name}}.</p>
    </div>
  </div>
</body>
</html>`
  }
];

export function getEmailTemplates(): EmailTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_EMAIL_TEMPLATES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_EMAIL_TEMPLATES_KEY, JSON.stringify(DEFAULT_EMAIL_TEMPLATES));
      return DEFAULT_EMAIL_TEMPLATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_EMAIL_TEMPLATES;
  }
}

export function saveEmailTemplate(template: EmailTemplate): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getEmailTemplates();
    const updated = current.map((t) => (t.id === template.id ? { ...template, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) } : t));
    localStorage.setItem(STORAGE_EMAIL_TEMPLATES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('creatorpulse_email_templates_updated'));
  } catch (e) {
    console.error('Failed to save email template', e);
  }
}

export function renderEmailTemplatePreview(template: EmailTemplate, sampleDataOverride?: Record<string, string>): { subject: string; bodyHtml: string } {
  const data: Record<string, string> = {
    '{{user_name}}': 'Sarah Jenkins',
    '{{user_email}}': 'sarah@designcode.com',
    '{{site_name}}': 'CreatorPulse',
    '{{app_url}}': 'https://creatorpulse.io',
    '{{action_url}}': 'https://creatorpulse.io/dashboard',
    '{{support_email}}': 'support@creatorpulse.com',
    '{{date}}': 'August 15, 2026',
    '{{login_url}}': 'https://creatorpulse.io/auth/login',
    '{{verification_code}}': '894-102',
    '{{reset_link}}': 'https://creatorpulse.io/auth/reset?token=xyz123',
    '{{creator_name}}': 'Sarah Jenkins',
    '{{plan_name}}': 'VIP Inner Circle',
    '{{amount}}': '$25.00/mo',
    '{{payout_method}}': 'Bank Transfer (Stripe)',
    '{{message_content}}': 'We have upgraded platform performance and added high resolution video streaming.',
    ...sampleDataOverride
  };

  let renderedSubject = template.subject;
  let renderedHtml = template.bodyHtml;

  Object.entries(data).forEach(([key, val]) => {
    const regex = new RegExp(key.replace(/[{()}]/g, '\\$&'), 'g');
    renderedSubject = renderedSubject.replace(regex, val);
    renderedHtml = renderedHtml.replace(regex, val);
  });

  return { subject: renderedSubject, bodyHtml: renderedHtml };
}
