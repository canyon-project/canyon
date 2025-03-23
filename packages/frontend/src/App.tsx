// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Report from "canyon-report";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <div>
      <Report onSelect={(v)=>{
        console.log(v)
        return new Promise((resolve)=>{
          setTimeout(()=> {
            resolve({
              fileCodeChange:[],
              fileContent:'',
              fileCoverage: {
                path: '',
                statementMap: {},
                fnMap: {},
                branchMap: {},
                s: {},
                f: {},
                b: {}
              }
            })
          })
        })
      }} theme={'light'} language={'ja'} name={'test'} dataSource={{}} value={''} defaultOnlyShowChanged={false} />
    </div>
  )
}

export default App
