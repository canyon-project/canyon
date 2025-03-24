import './useWorker.ts';
import './index.css';
import ReactDOM from 'react-dom/client';
// import './i18n.ts';
// import { App } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App.tsx';

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
}
