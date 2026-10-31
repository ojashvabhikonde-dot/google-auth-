import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './styles.css';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();
const app = <App googleConfigured={Boolean(clientId)} />;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {clientId ? <GoogleOAuthProvider clientId={clientId}>{app}</GoogleOAuthProvider> : app}
  </React.StrictMode>,
);
