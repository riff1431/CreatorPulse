# PipraPay Developer Documentation

## Webhook Endpoint
- **URL**: `https://yourdomain.com/api/payments/webhook/piprapay`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `x-piprapay-signature: <HMAC-SHA256-Signature>`

## IPN Status Mapping
| PipraPay Status | Ledger Status | Action Taken |
| :--- | :--- | :--- |
| `completed` / `paid` / `success` | `Completed` | Unlocks content, credits creator balance, activates tier |
| `pending` / `processing` | `Pending` | Awaiting bank confirmation |
| `failed` / `cancelled` | `Failed` | Cancels transaction order |
| `refunded` | `Refunded` | Reverses creator balance |
