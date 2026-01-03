require('dotenv').config();
// Allow requiring TypeScript config via ts-node (installed as devDependency)
try {
  require('ts-node/register/transpile-only');
} catch (e) {
  // ts-node may not be present in some environments; fall back to @swc/register if available
  try {
    require('@swc/register');
  } catch (e2) {
    // ignore if neither is available
  }
}

const express = require('express');
const payload = require('payload');

const app = express();

async function start() {
  try {
    // Prevent ts-node from running full type checks or using "bundler" moduleResolution
    process.env.TS_NODE_TRANSPILE_ONLY = 'true';
    process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({ module: 'es2015', moduleResolution: 'node' });

    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'payload-secret-for-dev',
      // Provide a MongoDB URL if you have one. If you want to skip persistence for now, set to false
      mongoURL: process.env.MONGODB_URI || false,
      express: app,
      // ensure the config file is loaded (prefer the CommonJS wrapper for runtime compatibility)
      config: require('./payload.config.cjs'),
    });

    // After init, ensure an admin user exists (auto-create for dev)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@localhost.local';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
    try {
      const found = await payload.find({
        collection: 'users',
        where: { email: { equals: ADMIN_EMAIL } },
      });
      const exists = !!(found && (found.total > 0 || (found.docs && found.docs.length) || (Array.isArray(found) && found.length)));
      if (!exists) {
        await payload.create({
          collection: 'users',
          data: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
            name: 'Administrator',
          },
        });
        // eslint-disable-next-line no-console
        console.log('Auto-created admin user:', ADMIN_EMAIL);
      } else {
        // eslint-disable-next-line no-console
        console.log('Admin user already exists:', ADMIN_EMAIL);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Auto-create admin failed:', e);
    }

    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Payload server listening on http://localhost:${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error starting payload:', err);
    process.exit(1);
  }
}

start();
