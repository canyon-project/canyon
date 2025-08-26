import { useState } from 'react'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'
import { useQuery } from '@apollo/client'
import { HelloDocument } from './helpers/backend/gen/graphql.ts'

function App() {
  const [count, setCount] = useState(0)

  const { data, loading, error } = useQuery(HelloDocument)

  // 字符串处理（替代管道操作符）
  const result = '  canyonjs  '.trim().toUpperCase()

  console.log(result) // CANYONJS

  // const message = match (user) {
  //     { role: "admin" } => "欢迎管理员",
  //         { role: "guest" } => "欢迎游客",
  //         _ => "未知角色"
  // };
  //
  // console.log(message);

  // const fib = n=>match(n)(
  //     (v=1)=>1,
  //     (v=2)=>1,
  //     _=>fib(_-1)+fib(_-2)
  // )
  //
  // console.log(fib(10))

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
        <button type='button' onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        <div>
          <p>
            GraphQL hello:{' '}
            {loading ? 'Loading...' : error ? 'Error' : data?.hello}
          </p>
        </div>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
