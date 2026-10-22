# Chatly - Realtime Chat App

A full-stack realtime chat application built with **React**, **Express**, **MongoDB** and **Socket.IO**. It supports JWT authentication, instant one-to-one messaging, online presence and image sharing.

The goal of this repository is to be **easy to run, easy to test and easy to extend** - no Cloudinary account or MongoDB Atlas cluster is required to try it locally.

## Live demo

- **App:** https://realtime-chat-app-eta-azure.vercel.app/login
- **API:** https://realtime-chat-backend-aapq.onrender.com

Create a free account on the sign-up page to try the hosted version. For instant demo users (`alice`, `bob`, `charlie`), run `npm run seed` against the database you are using - see [Quick start](#quick-start-3-commands).

> The hosted demo may lag behind this repository. The commands below always run the latest code.

## Features

- Realtime one-to-one messaging with Socket.IO
- Online / offline presence with multi-device support
- JWT auth using secure httpOnly cookies (and optional Bearer tokens for API clients)
- Image sharing - Cloudinary when configured, local disk otherwise
- User search by name, username or email
- Responsive, mobile-friendly UI with emoji picker and image previews
- Demo data seeding + demo login buttons for instant testing
- Zero-config dev proxy: frontend and backend work together with no CORS setup
- Single-service production mode: the backend serves the built frontend
- Health endpoint, friendly error messages and basic unit tests

## Quick start (3 commands)

**Requirements:** Node.js 20+ and MongoDB 6+ (or Docker).

```bash
git clone https://github.com/pankaj425/realtimeChatApp.git
cd realtimeChatApp

npm run setup     # creates backend/.env, installs both apps
npm run dev       # starts backend + frontend together
```

Open **http://localhost:5173**.

If MongoDB is not running locally, start it with Docker:

```bash
docker compose up -d mongo
```

### Demo accounts

Run the seed script once, then use the demo buttons on the login page:

```bash
npm run seed
```

| Email               | Password      |
| ------------------- | ------------- |
| `alice@example.com` | `password123` |
| `bob@example.com`   | `password123` |
| `charlie@example.com` | `password123` |

> Tip: open http://localhost:5173 in a normal window and an incognito window, log in as Alice and Bob, and watch messages arrive in real time.

## All scripts

Run these from the repository root:

| Command | What it does |
| --- | --- |
| `npm run setup` | Creates `backend/.env` (with a generated JWT secret) and installs both apps |
| `npm run setup -- --no-install` | Same, but skips `npm install` |
| `npm run dev` | Runs backend and frontend together with prefixed logs |
| `npm run dev:backend` | Runs only the API on port 5000 |
| `npm run dev:frontend` | Runs only the Vite dev server on port 5173 |
| `npm run seed` | Creates/updates demo users and a sample conversation |
| `npm test` | Runs backend unit tests (no database needed) |
| `npm run lint` | Runs ESLint on the frontend |
| `npm run build` | Builds the frontend into `frontend/dist` |
| `npm start` | Production start: API + built frontend on one port |

## Configuration

`npm run setup` creates `3.realtimeChatApp/backend/.env` for you. All values are optional for local development.

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/chatly` | Local, Docker or Atlas connection string |
| `JWT_SECRET` | dev-only secret | Required in production; setup generates a strong one |
| `CLIENT_URL` | `http://localhost:5173` | Comma-separated list of allowed frontend origins |
| `SERVER_URL` | `http://localhost:<PORT>` | Public API URL, used for CORS and startup logs |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | empty | Optional. Without them images are saved to `backend/public/uploads` and served from `/uploads` |

The frontend has an **optional** `.env` file. In development, Vite proxies `/api`, `/uploads` and `/socket.io` to the backend, so nothing is required. Set `VITE_SERVER_URL` only when deploying the frontend and backend on different origins.

## API reference

All protected routes accept the `token` cookie or an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Service, database and storage status |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/login` | Log in and set the auth cookie |
| `GET/POST` | `/api/auth/logout` | Clear the auth cookie |
| `GET` | `/api/user/current` | Current user |
| `GET` | `/api/user/others` | All other users |
| `GET` | `/api/user/search?query=` | Search users |
| `PUT` | `/api/user/profile` | Update display name / avatar (multipart) |
| `POST` | `/api/message/send/:receiver` | Send a message or image (multipart) |
| `GET` | `/api/message/get/:receiver` | Get the conversation |

Example with `curl`:

```bash
curl -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'

curl -b cookies.txt http://localhost:5000/api/user/current
```

## Project structure

```text
realtimeChatApp/
├── package.json            # root scripts: setup, dev, seed, build, start
├── docker-compose.yml      # local MongoDB
├── scripts/                # setup + dev orchestration
└── 3.realtimeChatApp/
    ├── backend/
    │   ├── config/         # env, database, token, media storage
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── models/
    │   ├── routes/
    │   ├── socket/
    │   ├── scripts/seed.js
    │   └── tests/
    └── frontend/
        └── src/
            ├── components/
            ├── hooks/
            ├── pages/
            ├── redux/
            └── utils/
```

## Deployment

### Option A - one service (simplest)

Build the frontend, then start the backend. The backend automatically serves `frontend/dist` and handles SPA routing:

```bash
npm run build
npm start
```

Open the `SERVER_URL` / server port. A `render.yaml` blueprint is included for this setup.

### Option B - split services

1. Deploy `backend` to Render/Railway. Set `MONGO_URI`, `JWT_SECRET`, `SERVER_URL` and `CLIENT_URL`.
2. Deploy `frontend` to Vercel/Netlify with `VITE_SERVER_URL=https://your-api.example.com`.

Cookies are `SameSite=None; Secure` automatically when `NODE_ENV=production`, so cross-domain auth works over HTTPS.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `MongoDB connection error` | Start MongoDB: `docker compose up -d mongo`, or set `MONGO_URI` to your Atlas string |
| Login works but refresh logs me out | Make sure `CLIENT_URL` matches the exact frontend URL (including port) and both apps use the same origin/proxy |
| Images don't load | Check `SERVER_URL` is the URL your browser uses to reach the API; or set Cloudinary credentials |
| CORS error | Add the frontend origin to `CLIENT_URL` (comma-separated) |
| Demo login says "user does not exist" | Run `npm run seed` |
| Port already in use | Change `PORT` in `backend/.env` and `BACKEND_URL` for the Vite proxy |

## Contributing

Fork the repo, create a branch, make your change and open a pull request. Please run `npm test` and `npm run lint` before submitting.

## License

MIT - see [LICENSE](./LICENSE).
