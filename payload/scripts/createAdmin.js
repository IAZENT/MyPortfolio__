require('dotenv').config();
// Small script to create an initial admin user in Payload
const payload = require('payload');

const config = require('../payload.config.cjs');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@localhost.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';

(async () => {
  try {
    await payload.init({
      secret: process.env.PAYLOAD_SECRET || 'payload-secret-for-dev',
      mongoURL: process.env.MONGODB_URI || false,
      local: true,
      config,
    });

    // Check for existing user by email
    let existing = null;
    try {
      existing = await payload.find({
        collection: 'users',
        where: { email: { equals: ADMIN_EMAIL } },
      });
    } catch (err) {
      // older payload versions might return an array
      existing = existing || null;
    }

    const hasExisting = (existing && (existing.total > 0 || (existing.docs && existing.docs.length) || (Array.isArray(existing) && existing.length)));

    if (hasExisting) {
      console.log('Admin user already exists:', ADMIN_EMAIL);
      process.exit(0);
    }

    await payload.create({
      collection: 'users',
      data: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        name: 'Administrator',
      },
    });

    console.log('Created admin user:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
})();
