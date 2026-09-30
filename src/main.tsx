import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/app.css';
import App from './App';

// HashRouter : les URL fonctionnent aussi hors ligne, depuis un fichier local
// ou un hébergement statique sans réécriture d’URL (base: './' dans Vite).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
);
