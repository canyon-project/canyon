import './index.css';
import './helpers/loadData.ts';
import './useWorker.ts';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
