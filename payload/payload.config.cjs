// Use @swc/register to allow requiring .ts collection files from CommonJS (avoids TS compiler option conflicts)
try {
  require('@swc/register')({
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true
      }
    }
  });
} catch (e) {
  // Fallback to ts-node if swc isn't available
  require('ts-node/register/transpile-only');
}

const { buildConfig } = require('payload/config.js');
const path = require('path');
const Users = require('./src/collections/Users.ts').default;
const Posts = require('./src/collections/Posts.ts').default;
const Projects = require('./src/collections/Projects.ts').default;
const Certifications = require('./src/collections/Certifications.ts').default;
const Pages = require('./src/collections/Pages.ts').default;
const Media = require('./src/collections/Media.ts').default;
const Globals = require('./src/collections/Globals.ts').default;

module.exports = buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users',
  },
  collections: [Users, Posts, Projects, Certifications, Pages, Media],
  globals: [Globals],
  db: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    useMigrations: true,
  },
  upload: {
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
});
