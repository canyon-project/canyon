import './index.css';
import './useWorker';
import { createRoot } from 'react-dom/client';
import App from './App';

const appElement = document.querySelector('#app');
if (appElement) {
  createRoot(appElement).render(<App />);
}
