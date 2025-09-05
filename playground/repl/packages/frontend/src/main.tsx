// import './i18n.ts';
import './useWorker.ts';
import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';



createRoot(document.getElementById('root') as HTMLElement).render(
    <BrowserRouter>
            <App />
    </BrowserRouter>,
);
