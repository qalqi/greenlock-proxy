import { GreenlockProxy } from '../src';

const proxy = new GreenlockProxy({
  maintainerEmail: 'support@qalqi.com',
  configDir: './greenlock.d/',
  enableWSS: true,
  websocketUrl: 'ws://127.0.0.1:8081',
  staging: false, // Set to true during initial domain setup to avoid ACME rate limits
});

// Register domain rules to internal backend HTTP servers (Bun / Node / Elysia / Express)
proxy.register(['natured.in', 'www.natured.in'], ['http://127.0.0.1:8081']);
proxy.register(['api.natured.in'], ['http://127.0.0.1:8082']);

console.log('🚀 Starting GreenlockProxy HTTPS listener...');
proxy.start();
