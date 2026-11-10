import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { App } from './app/App';
import { aplicarTema } from './app/tema';
import { reiniciarDiaDoFoto } from './engine/storage';

aplicarTema();
reiniciarDiaDoFoto();

// Depois de uma atualização do site, os arquivos antigos deixam de existir. Se a página aberta
// pedir um deles, recarrega uma vez; a partida em andamento é retomada pelo salvamento local.
window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem('qe:recarregou')) return;
    sessionStorage.setItem('qe:recarregou', '1');
  } catch { /* sem sessionStorage: recarrega mesmo assim */ }
  e.preventDefault();
  window.location.reload();
});
window.addEventListener('load', () => { try { setTimeout(() => sessionStorage.removeItem('qe:recarregou'), 10000); } catch { /* ignora */ } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
