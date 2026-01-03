Payload local development
=========================

This document covers running a local MongoDB for the `/payload` app and creating the initial admin user.

1) Start MongoDB with Docker Compose (requires Docker):

```bash
cd payload
docker compose up -d
```

2) Copy the example env and set values (adjust password/secret):

```bash
cp .env.example .env
# edit .env to set PAYLOAD_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD as desired
```

3) Start the Payload server (from repo root):

```bash
cd payload
# stop any running server
pkill -f "node server.js" || true
node server.js &
tail -f payload.log
```

The server will attempt to auto-create the admin user after init. If it does not, run the helper script:

```bash
node scripts/createAdmin.js
```

Notes
- If you prefer to run Payload in Docker as well, you can extend `docker-compose.yml` to build a Node image and run `node server.js`. I kept the compose minimal to avoid rebuilding native modules inside a container.
