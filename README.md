# 🔒 GreenlockProxy (`@qalqi/greenlock-proxy`)

> **Production-grade reverse proxy with automated Let's Encrypt ACME SSL/TLS certificate management & WebSocket forwarding.**

[![NPM Version](https://img.shields.io/npm/v/@qalqi/greenlock-proxy?color=blue)](https://www.npmjs.com/package/@qalqi/greenlock-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

---

## ⚡ Battle-Tested in Production

`GreenlockProxy` has been **tested and proven in production across Google Cloud Platform (GCP) and Oracle Cloud Infrastructure (OCI)**.

It provides zero-config Let's Encrypt HTTPS termination, automated ACME renewals, multi-target round-robin load balancing, and WebSocket upgrade forwarding for modern Bun, Node.js, Elysia, and Express microservices.

---

## 🔑 How ACME Let's Encrypt SSL Automated Certification Works

Let's Encrypt uses the **ACME HTTP-01 Challenge** protocol to verify domain ownership before issuing free SSL/TLS certificates:

1. **DNS Setup:** Your domain (`example.com`) must point its `A` / `AAAA` DNS record directly to your Cloud Server's Public IP Address (GCP / OCI instance).
2. **Port 80 Requirement:** When `GreenlockProxy` starts, it listens on **Port 80 (HTTP)** and **Port 443 (HTTPS)**.
3. **Automatic Interception:** When Let's Encrypt sends an ACME validation request to `http://example.com/.well-known/acme-challenge/...`, `GreenlockProxy` automatically catches the request, completes the cryptographically signed challenge, and obtains the SSL certificate automatically.
4. **Auto-Renewal:** Certificates auto-renew in the background every 60 days without downtime.

> ⚠️ **Cloud Firewall Prerequisite:**  
> On **Google Cloud VPC** or **Oracle Cloud VCN**, you **MUST open Inbound Traffic on Port 80 & Port 443** in your Security List / Security Group rules, otherwise Let's Encrypt ACME verification will fail with a timeout!

---

## 📦 Installation

```bash
# Using bun
bun add @qalqi/greenlock-proxy dotenv

# Using npm
npm install @qalqi/greenlock-proxy dotenv
```

---

## 🛠️ Environment Variables (`.env`) Setup

Create a `.env` file in your root project directory:

```env
# Maintainer Email (Required by Let's Encrypt ACME server)
MAINTAINER_EMAIL=support@qalqi.com

# Path to Greenlock Certificate Storage Directory
GREENLOCK_CONFIG_DIR=./greenlock.d

# Enable WebSocket Proxying (default: true)
ENABLE_WSS=true
WEBSOCKET_URL=ws://127.0.0.1:8081

# ACME Environment: Set to 'true' for initial testing to avoid rate limits
STAGING=false
```

---

## 🚀 Usage with `.env` in TypeScript

```typescript
import { GreenlockProxy } from '@qalqi/greenlock-proxy';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const proxy = new GreenlockProxy({
  maintainerEmail: process.env.MAINTAINER_EMAIL || 'support@qalqi.com',
  configDir: process.env.GREENLOCK_CONFIG_DIR || './greenlock.d/',
  enableWSS: process.env.ENABLE_WSS === 'true',
  websocketUrl: process.env.WEBSOCKET_URL || 'ws://127.0.0.1:8081',
  staging: process.env.STAGING === 'true', // Set to true during initial domain setup
});

// Map public domains to internal microservices
proxy.register(['example.com', 'www.example.com'], ['http://127.0.0.1:8081']);
proxy.register(['api.example.com'], ['http://127.0.0.1:8082']);

console.log('🚀 Starting GreenlockProxy ACME & Reverse Proxy...');
proxy.start();
```

---

## ⚠️ Testing vs Production Mode (`staging`)

Let's Encrypt imposes strict rate limits (maximum **5 failed validations per hour** or **5 duplicate certificates per week** per domain).

- **During Development / Initial Setup:**  
  Set `staging: true` (or `STAGING=true` in `.env`). This connects to Let's Encrypt's ACME Staging server. Certificates will be issued instantly without rate limits (browsers will show a fake certificate warning, which is expected).
- **When Ready for Production:**  
  Set `staging: false` (or `STAGING=false`). Greenlock will obtain official, browser-trusted Let's Encrypt SSL certificates!

---

## ⚙️ Configuration Options Reference

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maintainerEmail` | `string` | `support@qalqi.com` | Email required by Let's Encrypt for ACME terms & expiration alerts |
| `configDir` | `string` | `"./greenlock.d/"` | Directory where Let's Encrypt keys & configs are stored |
| `enableWSS` | `boolean` | `false` | Enables WebSocket `upgrade` proxy forwarding |
| `websocketUrl` | `string` | `""` | Target URL for WebSocket connections (e.g. `"ws://127.0.0.1:8081"`) |
| `staging` | `boolean` | `false` | Enables Let's Encrypt staging environment to avoid rate limits during testing |
| `proxyTimeout` | `number` | `30000` (30s) | Backend response timeout in milliseconds |
| `timeout` | `number` | `60000` (60s) | Socket timeout in milliseconds |

---

## 📄 License

[MIT License](https://opensource.org/licenses/MIT) © [Qalqi](https://github.com/qalqi) (`support@qalqi.com`)
