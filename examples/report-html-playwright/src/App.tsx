import { lazy, Suspense } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';

// 懒加载组件
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Router>
      <div className='app'>
        <nav className='nav'>
          <Link to='/' className='nav-link'>
            首页
          </Link>
          <Link to='/about' className='nav-link'>
            关于
          </Link>
          <Link to='/contact' className='nav-link'>
            联系
          </Link>
        </nav>

        <main className='main'>
          <Suspense fallback={<div className='loading'>加载中...</div>}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} />
              <Route path='/contact' element={<Contact />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
