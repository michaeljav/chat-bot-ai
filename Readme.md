# Quick Start — Chat Project (Backend + Frontend)

This mini tutorial shows how to get an LLM API key, run everything with Docker, or run backend and frontend locally.

---

## Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** (v20.19+ recommended) and **npm** (only if running locally without Docker)

---

## 1) Get your LLM API key (Google Gemini)

If you want to use the LLM features and search the web, you need an API key.

**Quick link:** https://aistudio.google.com/app/apikey

**Steps:**

1. Open **Google AI Studio → API Keys**: https://aistudio.google.com/app/apikey
2. Sign in with your Google account.
3. Click **Create API key** and copy the key.
4. You now have your `LLM_API_KEY`.

> **Tip:** Save it in your environment (e.g., `.env` for the backend or your Docker Compose env).

**Example `.env` for the backend (`chat-api/.env`):**

```ini
# Required for LLM/web-search features
LLM_API_KEY=your_gemini_api_key_here

# Optional: domain/topic focus used by your model (if your app supports it)
# LLM_DOMAIN=Dominican cuisine
```

---

## 2) Start everything with Docker (recommended)

From the project root (where `docker-compose.yml` lives), run:

```bash
docker compose up -d --build
```

Once it’s up:

- **Frontend:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/docs  
  _(or http://localhost:3000/docs if you exposed the API directly)_

---

## 3) Start locally without Docker

### Backend

```bash
cd chat-api
npm i
npm run start:dev
```

- Swagger UI will usually be at `http://localhost:3000/docs` (unless you proxy via the frontend).

### Frontend

In a second terminal:

```bash
cd ../chat-frontend
npm i
npm run dev
```

- Open **http://localhost:5173**

---

## 4) Test the app

### Example prompts for online search

- “Give me two news stories about Dominican gastronomy from **today**, and cite the sources with links.”
- “Find me a URL about Dominican food from today.”

> If your app has a toggle for “Use LLM” or “Search the web,” turn it on before asking.

---

## Troubleshooting

- If a page does not load, check the container logs:
  ```bash
  docker compose logs -f
  ```
- Make sure your `LLM_API_KEY` is set in the environment used by the backend.
- Port tips:
  - Frontend (Docker): `8080`
  - Frontend (dev): `5173`
  - Backend (typical): `3000`

---

**End of mini tutorial** ✅

# Live-Coding Assignment (Interview Session)

## Goal

Build a **tiny chat application** in two parts—backend (NestJS) and frontend (React)—that lets a user send a message and receive an automated reply.

---

--LLM HAGA BUSQUEDA EN INTERNET. PUNTO EXTRA.

SEBASTIAN
COPIA A NAYELI

## Part A – Backend (NestJS)

| Requirement          | Details                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Route**            | `POST /chat`                                                                                                         |
| **Request body**     | `{ "message": "string" }` (JSON)                                                                                     |
| **Validation**       | Reject empty or missing `message` with **400 Bad Request**                                                           |
| **Response**         | `{ "reply": "string" }` – for now, any deterministic reply (e.g. echo the message in uppercase or prefix `"Bot: "`). |
| **Tech constraints** | _TypeScript only_ · Use NestJS controllers, services, DTOs & `ValidationPipe` · No database—everything in memory     |
| **Bonus**            | Simple rate-limit guard (≤ 5 req/min per IP) · Lightweight `Dockerfile` exposing port `3000`                         |

**What we’ll evaluate**

1. Project structure (`app.module.ts`, `chat.controller.ts`, `chat.service.ts`).
2. Correct HTTP status codes and DTO validation.
3. Code readability & running commentary while you code.
4. (Bonus) Containerization quality.

---

## Part B – Frontend (React)

| Requirement   | Details                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------- |
| **Component** | `ChatBox` (React 18+, hooks, TypeScript)                                                     |
| **UI**        | Text input + **Send** button · Scrollable message area (user on right, bot on left is fine). |
| **Behaviour** | 1. `POST /chat` with the user message.                                                       |

2. Show “Typing…” while waiting.
3. Append bot reply to conversation.
4. Clear & refocus the input. |
   | **Error handling** | Inline error for 400 (“Message cannot be empty.”) & network failures (“Connection lost, please retry.”). |
   | **Styling** | Minimal CSS or Tailwind—no external UI kits needed. |
   | **Bonus** | Auto-scroll to newest message · Disable **Send** when input is empty · Submit with **Enter** key. |

**What we’ll evaluate**

1. Clean state management (`useState`, `useEffect`).
2. Type safety for request/response shapes.
3. Smooth UX & graceful error handling.
4. Code clarity and naming.

⏱ **Suggested time**: 15 min backend + 15 min frontend.

---

# Take-Home Assignment: LLM Integration

> **Extend your chat app by connecting it to an LLM service (Google Gemini is free) so users can ask domain-specific questions and get meaningful answers.**

## 1 – Choose an LLM Provider

Google Gemini preferred, but OpenAI, Cohere, etc. are fine if you have access.

## 2 – Backend Changes (NestJS)

- Create `LlmService` that forwards the user’s **message** to the LLM and retrieves the answer.
- Use **env vars** (`LLM_API_KEY`, `LLM_MODEL`, …)—do **not** hard-code secrets.
- Return the LLM’s reply as `{ "reply": "…" }`.
- Keep existing DTO validation.

## 3 – Domain Focus

Prompt the model to act as an **expert in a single topic** of your choice (e.g. Argentine/Brazilian/Dominican cuisine, front-end testing, classic movies). Off-topic questions should trigger a polite refusal or redirection.

## 4 – Frontend Changes (React)

No UI overhaul needed—just display the richer reply and keep the loading indicator.

## 5 – Testing

- Supply **three sample questions** (with expected answer snippets) in your README.
- Optional: a Jest test mocking the LLM call.

## 6 – Delivery

- Push to a public repo or share a zip.
- Include a concise **README** with setup steps (`npm install`, `docker compose up`, `env.example`).

## 7 – Bonus Points

- Stream tokens to the client for a “typing” effect.
- Rate-limit to protect your free quota.

🕒 **Deadline:** 48 -70 hours (let us know if you need an extension).  
Good luck—and have fun exploring LLMs!
