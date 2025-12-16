import { useState } from 'react';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';
import './App.css';

function App() {
  const [count] = useState(0);

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank' rel='noopener'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank' rel='noopener'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <p>count is {count}</p>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
