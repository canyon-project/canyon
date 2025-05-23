import './assets/index.css';
import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@0.47.0/+esm';
window.monaco = monaco;
// import 'antd/dist/reset.css';
import { createRoot } from 'react-dom/client';
// import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
  </>,
);
