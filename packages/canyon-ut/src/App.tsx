// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import CanyonReport from 'canyon-report'
import {useRoutes} from "react-router-dom";
import routes from "~react-pages";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      {/*<CanyonReport/>*/}
      {useRoutes(routes)}
    </>
  )
}

export default App
