/**
 * PARAJURISTE BÉNIN MOOC
 * Signature numérique: "Code 17 puits dans 10 villages en 1995"
 * Développé par Léonard KABO.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
