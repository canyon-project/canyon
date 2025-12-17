import './index.css';
import './useWorker';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.querySelector('#app')!).render(<App />);
