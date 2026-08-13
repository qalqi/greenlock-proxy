// PM2 Ecosystem Configuration Example for @qalqi/greenlock-proxy
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "greenlock-proxy",
      script: "dist/index.js",
      interpreter: "node", // or "bun"
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
      name: "bun-backend",
      script: "src/index.ts",
      interpreter: "bun",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8080, // Listening on internal port 8080
      },
    },
    {
      name: "react-vite-frontend",
      script: "serve",
      args: "-s build -l 3000", // Serve React build on internal port 3000
      interpreter: "none",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
