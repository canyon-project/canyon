import './useWorker.ts'
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <App />
  </>,
);
