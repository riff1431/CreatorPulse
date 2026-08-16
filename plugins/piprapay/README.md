# PipraPay Payment Gateway Add-on Plugin for CreatorPulse

PipraPay is a high-performance, multi-channel payment gateway add-on plugin for CreatorPulse. It enables creators to accept bKash, Nagad, Rocket, Upay, Visa, MasterCard, and Amex seamlessly with automatic webhook resolution and server-side secret management.

## Features
- **Direct Redirect Checkout**: Secure server-side charge creation and user redirect.
- **Full Flow Support**: Tips, post unlocks, subscriptions, VIP tiers, and wallet balance deposits.
- **HMAC-SHA256 Webhook Verification**: Cryptographically validates all incoming IPN callbacks.
- **Idempotency Protection**: Deduplicates callbacks to prevent double-crediting.
- **Sandbox Testing Simulation**: Interactive developer portal with zero setup required.
- **Dynamic Admin Gateway Manager**: Integrated with Admin -> Payment Gateways for ordering, testing, and fee configuration.

## Installation
1. Go to **Admin Panel &rarr; Plugins**.
2. Upload `piprapay.zip` or activate `PipraPay Payment Gateway` from the catalog.
3. Go to **Admin Panel &rarr; Payment Gateways** (or `/admin/plugins/piprapay/settings`) to configure credentials and test connection.
