import { useState } from 'react';

const Home = () => {
  const [count, setCount] = useState(0);

  return (
    <div className='page'>
      <h1>首页</h1>
      <p>这是一个懒加载的首页组件</p>
      <div className='counter'>
        <button onClick={() => setCount(count + 1)}>点击次数: {count}</button>
      </div>
    </div>
  );
};

export default Home;
