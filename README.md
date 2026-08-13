# 🔒 GreenlockProxy (`@qalqi/greenlock-proxy`)

> **Production-grade reverse proxy with automated Let's Encrypt ACME SSL/TLS certificate management, HTTP-to-HTTPS redirection, and WebSocket forwarding.**

[![NPM Version](https://img.shields.io/npm/v/@qalqi/greenlock-proxy?color=blue)](https://www.npmjs.com/package/@qalqi/greenlock-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

---

## ⚡ Battle-Tested in Production

`GreenlockProxy` has been **tested and proven in production across Google Cloud Platform (GCP) and Oracle Cloud Infrastructure (OCI)**.

It provides zero-config Let's Encrypt HTTPS termination, automated ACME renewals, multi-target round-robin load balancing, and WebSocket upgrade forwarding for modern **Bun, Node.js, React, Vite, Next.js, Elysia, and Express** web applications.

---

## 📐 Architecture & Traffic Flow

```text
                           ┌─────────────────────────────┐
                           │   Public Internet Clients   │
                           └──────────────┬──────────────┘
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 │                                                 │
          HTTP (Port 80)                                    HTTPS (Port 443)
      [ACME Challenge / 301]                               [TLS / SSL Encrypted]
                 │                                                 │
                 ▼                                                 ▼
  ┌───────────────────────────────┐               ┌─────────────────────────────────┐
  │  ACME HTTP-01 Challenge Engine │               │   GreenlockProxy SSL Engine     │
  │ (.well-known/acme-challenge/) │               │  (TLS Termination & Decryption) │
  └──────────────┬────────────────┘               └────────────────┬────────────────┘
                 │                                                 │
                 │ Auto Certificate Provisioning                   │ Reverse Proxy Routing
                 ▼                                                 │
  ┌───────────────────────────────┐                                │
  │ Let's Encrypt ACME Directory  │                                │
  └───────────────────────────────┘                                │
                                                                   │
                 ┌─────────────────────────────────────────────────┴─────────────────────────────────────────────────┐
                 │                                                                                                   │
                 ▼                                                 ▼                                                 ▼
   ┌───────────────────────────┐                     ┌───────────────────────────┐                     ┌───────────────────────────┐
   │    React / Vite SPA       │                     │    Bun / Node REST API    │                     │    WebSocket Gateway      │
   │  http://127.0.0.1:3000    │                     │  http://127.0.0.1:8080    │                     │    ws://127.0.0.1:8080     │
   └───────────────────────────┘                     └───────────────────────────┘                     └───────────────────────────┘
```

---

## 🔑 How ACME Let's Encrypt Automated SSL Certification Works

1. **Inbound HTTP (Port 80):**  
   - Intercepts Let's Encrypt ACME verification requests at `/.well-known/acme-challenge/...`.
   - Generates cryptographically signed key authorizations and communicates directly with the Let's Encrypt ACME server directory.
   - Automatically redirects regular HTTP web traffic to secure **HTTPS (Port 443)** with a `301 Permanent Redirect`.

2. **Inbound HTTPS (Port 443):**  
   - Terminates TLS/SSL encryption securely using valid Let's Encrypt certificates.
   - Forwards decrypted HTTP/1.1 or HTTP/2 headers (`x-forwarded-for`, `x-forwarded-proto`, `x-forwarded-port`) to internal backend applications.

3. **Background Auto-Renewal:**  
   - Automatically checks certificate expiration daily and renews certificates **every 60 days** in the background without restarting backend services.

> ⚠️ **Cloud Firewall Prerequisite:**  
> On **Google Cloud VPC** or **Oracle Cloud VCN**, you **MUST open Inbound Traffic on Port 80 & Port 443** in your Security List / Security Group rules, otherwise ACME challenge validation will fail with a timeout!

---

## 📋 PM2 Production Deployment Example (`ecosystem.config.cjs`)

Use **PM2** to run `GreenlockProxy` alongside your application processes on your GCP or Oracle Cloud VM instance:

```javascript
// ecosystem.config.cjs
// Run with: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "greenlock-proxy",
      script: "proxy-runner.ts", // Proxy launcher script
      interpreter: "bun",       // or "node" / "ts-node"
      watch: false,
      env: {
        NODE_ENV: "production",
        MAINTAINER_EMAIL: "support@qalqi.com",
        GREENLOCK_CONFIG_DIR: "./greenlock.d",
        ENABLE_WSS: "true",
        WEBSOCKET_URL: "ws://127.0.0.1:8080",
        STAGING: "false",
      },
    },
    {
      name: "bun-backend-api",
      script: "src/index.ts",
      interpreter: "bun",
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
    {
      name: "react-frontend-spa",
      script: "npx",
      args: "serve -s build -l 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

---

## 🚀 Proxy Runner Script (`proxy-runner.ts`)

```typescript
import { GreenlockProxy } from '@qalqi/greenlock-proxy';
import dotenv from 'dotenv';

dotenv.config();

const proxy = new GreenlockProxy({
  maintainerEmail: process.env.MAINTAINER_EMAIL || 'support@qalqi.com',
  configDir: process.env.GREENLOCK_CONFIG_DIR || './greenlock.d/',
  enableWSS: process.env.ENABLE_WSS === 'true',
  websocketUrl: process.env.WEBSOCKET_URL || 'ws://127.0.0.1:8080',
  staging: process.env.STAGING === 'true', // Use 'true' during initial setup testing
});

// Register domain mappings
// 1. React / Vite Frontend
proxy.register(['example.com', 'www.example.com'], ['http://127.0.0.1:3000']);

// 2. Bun / Node Backend REST & WebSocket API
proxy.register(['api.example.com'], ['http://127.0.0.1:8080']);

console.log('🚀 Starting GreenlockProxy ACME SSL & Reverse Proxy...');
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
| `websocketUrl` | `string` | `""` | Target URL for WebSocket connections (e.g. `"ws://127.0.0.1:8080"`) |
| `staging` | `boolean` | `false` | Enables Let's Encrypt staging environment to avoid rate limits during testing |
| `proxyTimeout` | `number` | `30000` (30s) | Backend response timeout in milliseconds |
| `timeout` | `number` | `60000` (60s) | Socket timeout in milliseconds |

---

## 📄 License

[MIT License](https://opensource.org/licenses/MIT) © [Qalqi](https://github.com/qalqi) (`support@qalqi.com`)
