import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Editor} from "@monaco-editor/react";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Editor theme={'monokai'} height={'70vh'} language={'javascript'} value={`
      const a = 1`}/>
    </>
  )
}

export default App
