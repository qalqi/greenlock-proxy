export interface GreenlockProxyOptions {
  /** Maintainer email required by Let's Encrypt / Greenlock ACME server */
  maintainerEmail: string;

  /** Path to greenlock configuration directory. Default: "./greenlock.d" */
  configDir?: string;

  /** Enable WebSocket proxying (upgrade event). Default: false */
  enableWSS?: boolean;

  /** Target WebSocket URL if different from HTTP target (e.g., "ws://127.0.0.1:8081") */
  websocketUrl?: string;

  /** Enable Let's Encrypt ACME staging environment for testing. Default: false */
  staging?: boolean;

  /** Timeout in ms for HTTP proxy backend responses. Default: 30000 (30s) */
  proxyTimeout?: number;

  /** Timeout in ms for socket connections. Default: 60000 (60s) */
  timeout?: number;
}

export interface ProxyRule {
  domains: string[];
  targets: string[];
}
