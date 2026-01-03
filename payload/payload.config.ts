import { buildConfig } from 'payload/config';
import path from 'path';
import Users from './src/collections/Users';
import Posts from './src/collections/Posts';
import Projects from './src/collections/Projects';
import Certifications from './src/collections/Certifications';
import Pages from './src/collections/Pages';
import Media from './src/collections/Media';
import Globals from './src/collections/Globals';

export default buildConfig({
  serverURL: process.env.PAYLOAD_SERVER_URL || 'http://localhost:3001',
  admin: {
    user: 'users',
  },
  collections: [Users, Posts, Projects, Certifications, Pages, Media],
  globals: [Globals],
  // Use Postgres (recommended for search). Ensure DATABASE_URL is set in .env
  db: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    useMigrations: true,
  },
  upload: {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20 MB
    },
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
});
