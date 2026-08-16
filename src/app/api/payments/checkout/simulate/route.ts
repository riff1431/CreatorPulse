import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSecret } from '@/lib/payments/secrets-vault';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gateway = searchParams.get('gateway') || 'stripe';
    const sessionId = searchParams.get('sessionId') || '';
    const amount = searchParams.get('amount') || '10.00';
    const currency = searchParams.get('currency') || 'USD';
    const userId = searchParams.get('userId') || '';
    const creatorId = searchParams.get('creatorId') || '';
    const isSubscription = searchParams.get('subscription') === 'true';
    const isFunding = searchParams.get('funding') === 'true';
    const planId = searchParams.get('planId') || '';
    const planName = searchParams.get('planName') || '';
    const durationMonths = searchParams.get('durationMonths') || '1';
    const description = searchParams.get('description') || '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simulated ${gateway.toUpperCase()} Gateway Portal</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              background-color: #FFF9FC;
              color: #18181B;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .container {
              background: white;
              border: 1px solid #F3DCE8;
              border-radius: 32px;
              padding: 36px;
              max-width: 450px;
              width: 100%;
              box-shadow: 0 20px 40px -15px rgba(236, 72, 153, 0.15);
              text-align: center;
            }
            .logo {
              font-size: 38px;
              margin-bottom: 12px;
            }
            .title {
              font-size: 22px;
              font-weight: 800;
              margin: 0 0 4px 0;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 12px;
              color: #71717A;
              margin: 0 0 24px 0;
              font-weight: 600;
            }
            .details-card {
              background-color: #FFF1F7;
              border: 1px solid #FBCFE8;
              border-radius: 20px;
              padding: 20px;
              margin-bottom: 24px;
              text-align: left;
              font-size: 12px;
              line-height: 1.6;
            }
            .details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .details-row:last-child {
              margin-bottom: 0;
              border-top: 1px dashed #FBCFE8;
              padding-top: 10px;
              margin-top: 10px;
              font-weight: bold;
            }
            .btn {
              display: block;
              width: 100%;
              padding: 14px;
              border-radius: 14px;
              font-size: 13px;
              font-weight: bold;
              cursor: pointer;
              transition: all 0.2s;
              border: none;
              margin-bottom: 10px;
            }
            .btn-primary {
              background: linear-gradient(135deg, #EC4899 0%, #D946EF 100%);
              color: white;
            }
            .btn-primary:hover {
              transform: translateY(-1px);
              box-shadow: 0 6px 15px rgba(236, 72, 153, 0.35);
            }
            .btn-secondary {
              background-color: #FFF9FC;
              color: #71717A;
              border: 1px solid #F3DCE8;
            }
            .btn-secondary:hover {
              background-color: #FFF1F7;
              color: #BE185D;
            }
            .btn-danger {
              background-color: #FFE4E6;
              color: #B91C1C;
              border: 1px solid #FCA5A5;
            }
            .btn-danger:hover {
              background-color: #FEE2E2;
            }
            .badge {
              background-color: #FFF1F7;
              color: #EC4899;
              padding: 3px 8px;
              border-radius: 8px;
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              border: 1px solid #FBCFE8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">${gateway === 'stripe' ? '💳' : gateway === 'piprapay' ? '🇧🇩' : '🅿️'}</div>
            <h2 class="title">Authorize ${gateway === 'stripe' ? 'Stripe' : gateway === 'piprapay' ? 'PipraPay Multi-Gateway' : 'PayPal'} Payment</h2>
            <p class="subtitle">Secure Developer Checkout Sandbox</p>

            <div class="details-card">
              <div class="details-row">
                <span>Charge Intent:</span>
                <span class="badge">${isSubscription ? 'Subscription Plan' : isFunding ? 'Wallet Deposit' : 'One-time purchase'}</span>
              </div>
              ${gateway === 'piprapay' ? `
                <div class="details-row">
                  <span>Payment Channels:</span>
                  <span style="font-weight: 700; color: #059669;">bKash • Nagad • Rocket • Upay • Cards</span>
                </div>
              ` : ''}
              ${isSubscription ? `
                <div class="details-row">
                  <span>Plan:</span>
                  <span style="font-weight: 600;">${planName}</span>
                </div>
                <div class="details-row">
                  <span>Duration:</span>
                  <span>${durationMonths} Month(s)</span>
                </div>
              ` : ''}
              <div class="details-row">
                <span>Description:</span>
                <span>${description || (isFunding ? 'Wallet Balance Top-up' : 'Creator Tip / Lock Unlock')}</span>
              </div>
              <div class="details-row">
                <span>Session ID:</span>
                <span style="font-family: monospace; font-size: 9px; color:#BE185D;">${sessionId}</span>
              </div>
              <div class="details-row">
                <span>Total Due:</span>
                <span style="color: #059669; font-size: 15px; font-weight: 800;">${currency === 'BDT' ? '৳' : '$'}${parseFloat(amount).toFixed(2)} ${currency}</span>
              </div>
            </div>

            <form action="/api/payments/checkout/simulate" method="POST">
              <input type="hidden" name="gateway" value="${gateway}">
              <input type="hidden" name="sessionId" value="${sessionId}">
              <input type="hidden" name="amount" value="${amount}">
              <input type="hidden" name="currency" value="${currency}">
              <input type="hidden" name="userId" value="${userId}">
              <input type="hidden" name="creatorId" value="${creatorId}">
              <input type="hidden" name="isSubscription" value="${isSubscription}">
              <input type="hidden" name="isFunding" value="${isFunding}">
              <input type="hidden" name="planId" value="${planId}">
              <input type="hidden" name="planName" value="${planName}">
              <input type="hidden" name="durationMonths" value="${durationMonths}">
              <input type="hidden" name="actionType" id="actionType" value="success">
              
              <button type="submit" class="btn btn-primary" onclick="document.getElementById('actionType').value='success'">
                Simulate Successful Payment (${currency === 'BDT' ? '৳' : '$'}${parseFloat(amount).toFixed(2)})
              </button>
              <button type="submit" class="btn btn-danger" onclick="document.getElementById('actionType').value='fail'">
                Simulate Declined / Payment Error
              </button>
              <button type="submit" class="btn btn-secondary" onclick="document.getElementById('actionType').value='cancel'">
                Cancel Checkout
              </button>
            </form>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (e: any) {
    return new Response(`Error launching simulator: ${e.message}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const gateway = formData.get('gateway') as string;
    const sessionId = formData.get('sessionId') as string;
    const amount = formData.get('amount') as string;
    const currency = formData.get('currency') as string;
    const userId = formData.get('userId') as string;
    const creatorId = formData.get('creatorId') as string;
    const isSubscription = formData.get('isSubscription') === 'true';
    const isFunding = formData.get('isFunding') === 'true';
    const planId = formData.get('planId') as string;
    const planName = formData.get('planName') as string;
    const durationMonths = formData.get('durationMonths') as string;
    const actionType = formData.get('actionType') as string;

    const referer = req.headers.get('referer') || '';
    const origin = referer ? new URL(referer).origin : 'http://localhost:3000';

    if (actionType === 'cancel') {
      const redirectUrl = isFunding 
        ? `${origin}/balance?cancelled=true&gateway=${gateway}` 
        : `${origin}/balance?cancelled=true&gateway=${gateway}`;
      return NextResponse.redirect(redirectUrl);
    }

    if (actionType === 'fail') {
      const redirectUrl = isFunding 
        ? `${origin}/balance?error=Simulated+Payment+Declined&gateway=${gateway}` 
        : `${origin}/balance?error=Simulated+Payment+Declined&gateway=${gateway}`;
      return NextResponse.redirect(redirectUrl);
    }

    // Load secret keys
    const webhookSecret = getSecret(`plugin-${gateway}`, 'secretKey') || getSecret(`plugin-${gateway}`, 'webhookSecret') || 'whsec_piprapay_demo_secret';

    let webhookPayload: any = {};
    let signatureHeader = '';
    const timestamp = Math.floor(Date.now() / 1000);

    if (gateway === 'piprapay') {
      webhookPayload = {
        event: isSubscription ? 'subscription.paid' : 'charge.completed',
        status: 'completed',
        payment_status: 'paid',
        transaction_id: sessionId,
        order_id: sessionId,
        pp_id: sessionId,
        amount: parseFloat(amount),
        currency,
        created_at: new Date().toISOString(),
        customer: {
          user_id: userId,
          creator_id: creatorId
        },
        metadata: {
          userId,
          creatorId,
          isSubscription: String(isSubscription),
          isFunding: String(isFunding),
          planId,
          planName,
          durationMonths
        }
      };

      const bodyStr = JSON.stringify(webhookPayload);
      signatureHeader = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyStr)
        .digest('hex');
    } else if (gateway === 'stripe') {
      webhookPayload = {
        id: `evt_${crypto.randomBytes(8).toString('hex')}`,
        object: 'event',
        type: isSubscription ? 'checkout.session.completed' : 'payment_intent.succeeded',
        created: timestamp,
        data: {
          object: {
            id: sessionId,
            payment_intent: isSubscription ? `pi_${crypto.randomBytes(8).toString('hex')}` : sessionId,
            amount: Math.round(parseFloat(amount) * 100),
            currency,
            status: 'succeeded',
            metadata: {
              userId,
              creatorId,
              isSubscription: String(isSubscription),
              isFunding: String(isFunding),
              planId,
              planName,
              durationMonths
            }
          }
        }
      };

      const bodyStr = JSON.stringify(webhookPayload);
      const signedPayload = `${timestamp}.${bodyStr}`;
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      signatureHeader = `t=${timestamp},v1=${signature}`;
    } else if (gateway === 'paypal') {
      webhookPayload = {
        id: `WH-PAYPAL-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        event_type: isSubscription ? 'PAYMENT.SALE.COMPLETED' : 'CHECKOUT.ORDER.APPROVED',
        create_time: new Date().toISOString(),
        resource: {
          id: sessionId,
          parent_payment: sessionId,
          amount: { total: amount, currency },
          custom_json: JSON.stringify({
            userId,
            creatorId,
            isSubscription,
            isFunding,
            planId,
            planName,
            durationMonths
          })
        }
      };
      
      signatureHeader = `paypal-sig-${crypto.randomBytes(16).toString('hex')}`;
    }

    // Call webhook receiver API asynchronously (simulating gateway callback)
    const webhookEndpoint = `${origin}/api/payments/webhook/${gateway}`;
    console.log(`[Simulator] Dispatching webhook callback to ${webhookEndpoint}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (gateway === 'piprapay') {
        headers['x-piprapay-signature'] = signatureHeader;
      } else if (gateway === 'stripe') {
        headers['stripe-signature'] = signatureHeader;
      } else if (gateway === 'paypal') {
        headers['paypal-transmission-sig'] = signatureHeader;
      }

      await fetch(webhookEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload)
      });
    } catch (err) {
      console.error('[Simulator] Webhook dispatching failed', err);
    }

    // Redirect user back with success query params
    let finalRedirectUrl = `${origin}/balance?success=true&amount=${amount}&gateway=${gateway}`;
    if (isSubscription) {
      finalRedirectUrl = `${origin}/balance?subscribed=true&amount=${amount}&planName=${encodeURIComponent(planName)}&gateway=${gateway}`;
    }
    
    return NextResponse.redirect(finalRedirectUrl);
  } catch (e: any) {
    console.error('[Simulator] Error processing POST handler', e);
    return new Response(`Simulation crashed: ${e.message}`, { status: 500 });
  }
}

