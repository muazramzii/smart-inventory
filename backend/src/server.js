// src/server.js
// ----------------------------------------------------------------------------
// Server entry point with graceful shutdown.
// ----------------------------------------------------------------------------

const app = require('./app');
const config = require('./config/env');

const server = app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port} (${config.nodeEnv})`);
});

function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
