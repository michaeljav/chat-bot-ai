# Chat API (NestJS)

Small NestJS service exposing `POST /chat` that validates input and returns a deterministic reply. Includes an in-memory rate limiter (≤ 5 req/min per IP) and a lightweight Docker image.

## Features

- **Route:** `POST /chat` with JSON body `{ "message": "string" }`
- **Validation:** Empty/missing `message` → **400 Bad Request**
- **Response:** `{ "reply": "Bot: <message>" }` (deterministic)
- **Rate limit (bonus):** ≤ 5 requests/minute per IP (in-memory)
- **Tech:** NestJS + TypeScript · No database

---

## Prerequisites

- **Node.js 20+** (LTS recommended) and **npm 10+**
  ```bash
  # optional: use nvm to install & select Node 20
  nvm install 20
  nvm use 20
  ```
- **Docker** (optional, only if running in containers)

> If you’ll run behind a reverse proxy (NGINX, etc.), see **Trust proxy** under _Notes_.

---

## 1) Run locally

### Install

```bash
npm ci        # if package-lock.json exists
# or
npm install
```

### Start

```bash
# development (watch mode)
npm run start:dev

# or plain dev
npm run start

# production (after build)
npm run build
npm run start:prod
```

The app listens on **http://localhost:3000** by default.

### Quick test (cURL)

```bash
# OK
curl -s -X POST http://localhost:3000/chat   -H "Content-Type: application/json"   -d '{"message":"hola"}'
# -> {"reply":"Bot: hola"}

# 400 Bad Request (missing message)
curl -i -X POST http://localhost:3000/chat   -H "Content-Type: application/json"   -d '{}'

# 429 Too Many Requests (6th hit within 1 minute from same IP)
for i in {1..6}; do
  curl -i -X POST http://localhost:3000/chat     -H "Content-Type: application/json"     -d '{"message":"test"}'
done
```

### (Optional) VS Code REST Client

Create `.vscode/chat.http`:

```http
### OK
POST http://localhost:3000/chat
Content-Type: application/json

{
  "message": "hola"
}

### 400 Bad Request
POST http://localhost:3000/chat
Content-Type: application/json

{}
```

---

## 2) Run with Docker

This repo includes a lean multi-stage `Dockerfile`.

### Build the image

```bash
docker build -t chat-api .
```

### Run the container

```bash
docker run -d -p 3000:3000 --name chat-api-container chat-api
```

Now hit `http://localhost:3000/chat` as shown above.

> **Tip:** Change host port (left side) if 3000 is taken, e.g. `-p 8080:3000`.

### (Optional) docker-compose

Create `docker-compose.yml`:

```yaml
services:
  chat-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      # (no envs required by default)
      # Add your own, e.g. PORT if you modify main.ts to read it
      NODE_ENV: production
    restart: unless-stopped
```

Run:

```bash
docker compose up --build
```

---

## Project scripts

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "start:prod": "node dist/main.js",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:cov": "jest --coverage"
  }
}
```

---

## Troubleshooting

- **Port already in use (EADDRINUSE)**  
  Another app is using 3000. Stop it or run Docker with a different host port:

  ```bash
  docker run --rm -p 8080:3000 chat-api
  ```

  _(Optional) If you prefer a configurable port, see “Make port configurable” below._

- **429 Too Many Requests immediately**  
  The in-memory limiter is **per IP** and **per process**. In a single minute, you only get 5 successful requests from the same IP. Wait a minute or raise the limit in `src/common/guards/rate-limit.guard.ts`.

- **Running behind a proxy (client IP is always the proxy IP)**  
  Enable trust proxy (see _Notes_ below), otherwise all requests appear from the proxy and will share the same rate bucket.

---

## Notes

### Rate limit configuration

Open `src/common/guards/rate-limit.guard.ts` and adjust:

```ts
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQS = 5; // requests per IP per window
```

### Trust proxy (if behind NGINX/Load Balancer)

In `src/main.ts`, enable trust proxy so `req.ip` honors `X-Forwarded-For`:

```ts
// main.ts
const app = await NestFactory.create(AppModule);
app.getHttpAdapter().getInstance().set('trust proxy', 1); // <— enable this behind a proxy
```

### Make port configurable (optional)

If you want to run on a custom port via env var:

```ts
// main.ts
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
await app.listen(port);
```

Then:

```bash
PORT=4000 npm run start:prod
# or with Docker:
docker run --rm -e PORT=3000 -p 3000:3000 chat-api
```

---

## API Reference

### `POST /chat`

**Body**

```json
{ "message": "hello" }
```

**Success 200**

```json
{ "reply": "Bot: hello" }
```

**Errors**

- `400 Bad Request` – missing/empty `message`
- `429 Too Many Requests` – more than 5 req/min from same IP

---

## License

MIT
