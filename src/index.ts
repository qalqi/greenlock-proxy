import { GreenlockProxyOptions, ProxyRule } from './types';

/**
 * GreenlockProxy — Production-Grade Reverse Proxy & Automatic Let's Encrypt SSL Manager
 *
 * Battle-tested in production across Google Cloud Platform (GCP) and Oracle Cloud Infrastructure (OCI).
 */
export class GreenlockProxy {
  private configDir: string;
  private maintainerEmail: string;
  private enableWSS: boolean;
  private websocketUrl: string;
  private staging: boolean;
  private proxyTimeout: number;
  private timeout: number;
  private rules: ProxyRule[] = [];
  private greenlock: any;
  private proxy: any;

  constructor(opts: GreenlockProxyOptions) {
    this.maintainerEmail = opts.maintainerEmail || 'support@qalqi.com';
    this.configDir = opts.configDir || './greenlock.d/';
    this.enableWSS = opts.enableWSS || false;
    this.websocketUrl = opts.websocketUrl || '';
    this.staging = opts.staging || false;
    this.proxyTimeout = opts.proxyTimeout || 30000;
    this.timeout = opts.timeout || 60000;

    const Greenlock = require('@root/greenlock');
    const pkg = { name: '@qalqi/greenlock-proxy', version: '1.0.0' };

    this.greenlock = Greenlock.create({
      packageRoot: process.cwd(),
      configDir: this.configDir,
      packageAgent: `${pkg.name}/${pkg.version}`,
      maintainerEmail: this.maintainerEmail,
      staging: this.staging,
    });

    this.greenlock.manager.defaults({
      agreeToTerms: true,
      subscriberEmail: this.maintainerEmail,
    });
  }

  /**
   * Registers a domain mapping rule to internal proxy targets.
   *
   * @param domains Domain or array of domains (e.g. "natured.in" or ["natured.in", "www.natured.in"])
   * @param targets Target internal HTTP address or array of targets for round-robin balancing (e.g. "http://127.0.0.1:8080")
   */
  public register(domains: string | string[], targets: string | string[]): void {
    const domainList = Array.isArray(domains) ? domains : [domains];
    const targetList = Array.isArray(targets) ? targets : [targets];

    this.rules.push({ domains: domainList, targets: targetList });

    this.greenlock.add({
      subject: domainList[0],
      altnames: domainList,
    });
  }

  /**
   * Starts the HTTPS reverse proxy listener and ACME Let's Encrypt challenge handler.
   */
  public start(): void {
    const greenlockExpress = require('greenlock-express');
    
    greenlockExpress.init({
      packageRoot: process.cwd(),
      maintainerEmail: this.maintainerEmail,
      configDir: this.configDir,
      cluster: false,
    }).ready(this.httpsWorker.bind(this));
  }

  private httpsWorker(glx: any): void {
    const httpProxy = require('http-proxy');

    this.proxy = httpProxy.createProxyServer({
      xfwd: true,
      proxyTimeout: this.proxyTimeout,
      timeout: this.timeout,
    });

    const server = glx.httpsServer();

    this.proxy.on('error', (err: any, req: any, res: any) => {
      console.error('🔥 PROXY ERROR:', err.code, req.headers?.host);
      if (res && !res.headersSent) {
        res.statusCode = 502;
        res.end('502 Bad Gateway - Backend service is restarting or unavailable.');
      }
    });

    if (this.enableWSS) {
      server.on('upgrade', (req: any, socket: any, head: any) => {
        this.proxy.ws(req, socket, head, {
          target: this.websocketUrl || 'ws://127.0.0.1:8080',
          ws: true,
        });
      });
    }

    glx.serveApp(this.serveApp.bind(this));
  }

  private serveApp(req: any, res: any): void {
    let handled = false;
    const host = req.headers?.host;

    for (const rule of this.rules) {
      if (rule.domains.includes(host)) {
        const targetIndex = Math.floor(Math.random() * rule.targets.length);
        const selectedTarget = rule.targets[targetIndex];

        this.proxy.web(req, res, { target: selectedTarget });
        handled = true;
        break;
      }
    }

    if (!handled) {
      res.statusCode = 404;
      res.end(`404 Not Found - Domain '${host}' is not registered in GreenlockProxy.`);
    }
  }
}

export * from './types';
