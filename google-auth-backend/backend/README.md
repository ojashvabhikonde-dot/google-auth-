# Google Auth Backend and Frontend

## Requirements

- Node.js 18 or newer
- A Google OAuth 2.0 Web application client ID
- MongoDB is optional for running the demo; add `MONGODB_URI` to persist user profiles

## Configure Google OAuth

In Google Cloud Console, create or select an OAuth client of type **Web application**. Add `http://localhost:5173` under **Authorized JavaScript origins**. Use the same client ID in both the frontend and backend environment files. Do not put a client secret in frontend settings; this flow verifies the ID token on the server.

## Start the API

From the project root, create `.env` with:

```env
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
JWT_SECRET=replace-with-a-long-random-private-value
CLIENT_ORIGIN=http://localhost:5173
PORT=4000
# Optional, to persist profile records:
# MONGODB_URI=mongodb://127.0.0.1:27017/google_auth
```

Install backend packages once with `npm install`, then run `npm run dev`. The API listens on `http://localhost:4000`.

## Start the frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
```

Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` to the same public OAuth client ID. The frontend environment file belongs in the `frontend` folder, beside `frontend/package.json`; it is separate from `backend/.env`. Restart the Vite development server after changing frontend environment values so Vite can load them. Then run `npm install` and `npm run dev`; open the Vite URL, normally `http://localhost:5173`.

The frontend sends the Google ID token to `POST /api/auth/google`, restores the session through `GET /api/auth/profile`, and signs out with `POST /api/auth/logout`. Axios includes credentials. For local HTTP development the API uses an HttpOnly, SameSite=Lax cookie; CORS allows the configured frontend origin with credentials. In production, serve both apps over HTTPS and set an exact `CLIENT_ORIGIN`.

