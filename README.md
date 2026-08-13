# 🔒 GreenlockProxy (`@qalqi/greenlock-proxy`)

> **Production-grade reverse proxy with automated Let's Encrypt SSL/TLS certificate management & WebSocket forwarding.**

[![NPM Version](https://img.shields.io/npm/v/@qalqi/greenlock-proxy?color=blue)](https://www.npmjs.com/package/@qalqi/greenlock-proxy)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

---

## ⚡ Battle-Tested in Production

`GreenlockProxy` has been **tested and proven in production across Google Cloud Platform (GCP) and Oracle Cloud Infrastructure (OCI)**.

It provides zero-config Let's Encrypt HTTPS termination, automated ACME renewals, multi-target round-robin load balancing, and WebSocket upgrade forwarding for modern Bun, Node.js, Elysia, and Express microservices.

---

## ✨ Features

- **🛡️ Automated SSL/TLS Provisioning:** Generates and auto-renews free HTTPS certificates via Let's Encrypt ACME.
- **🔀 Multi-Tenant Reverse Proxy:** Routes domain names (`domain.com`, `api.domain.com`) to internal backend ports (`127.0.0.1:8080`).
- **⚡ Round-Robin Load Balancing:** Balances traffic across multiple internal worker targets.
- **🔌 Native WebSocket (`wss://`) Support:** Seamlessly forwards `upgrade` events to backend WebSocket servers.
- **🛡️ Resilient Gateway Fallbacks:** Circuit-breaker error handler returning friendly 502 responses instead of crashing the proxy process.
- **📘 Built with TypeScript:** Full type definitions and auto-completion out of the box.

---

## 📦 Installation

```bash
# Using bun
bun add @qalqi/greenlock-proxy

# Using npm
npm install @qalqi/greenlock-proxy
```

---

## 🚀 Quickstart Guide

```typescript
import { GreenlockProxy } from '@qalqi/greenlock-proxy';

const proxy = new GreenlockProxy({
  maintainerEmail: 'support@qalqi.com',
  configDir: './greenlock.d/',
  enableWSS: true,
  websocketUrl: 'ws://127.0.0.1:8081',
  staging: false, // Set to true for ACME staging test environment
});

// Map domains to internal backend services
proxy.register(['example.com', 'www.example.com'], ['http://127.0.0.1:8081']);
proxy.register(['api.example.com'], ['http://127.0.0.1:8082']);

// Start proxy listener on ports 80 (HTTP) & 443 (HTTPS)
proxy.start();
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maintainerEmail` | `string` | **Required** (`support@qalqi.com`) | Email required by Let's Encrypt for ACME terms & expiration alerts |
| `configDir` | `string` | `"./greenlock.d/"` | Directory where Let's Encrypt keys & configs are stored |
| `enableWSS` | `boolean` | `false` | Enables WebSocket `upgrade` proxy forwarding |
| `websocketUrl` | `string` | `""` | Target URL for WebSocket connections (e.g. `"ws://127.0.0.1:8081"`) |
| `staging` | `boolean` | `false` | Enables Let's Encrypt staging environment to avoid rate limits during testing |
| `proxyTimeout` | `number` | `30000` (30s) | Backend response timeout in milliseconds |
| `timeout` | `number` | `60000` (60s) | Socket timeout in milliseconds |

---

## 📄 License

[MIT License](file:///home/x2/cloud/sagewinner/LICENSE) © [Qalqi](https://github.com/qalqi) (`support@qalqi.com`)
