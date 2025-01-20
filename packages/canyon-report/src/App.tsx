import "./App.css";
import {useEffect, useState} from "react";
// import { Editor } from "@monaco-editor/react";
import Report2 from "./components/report2.tsx";
import axios from "axios";

function getDecode(str: string) {
  return decodeURIComponent(
    atob(str)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
}

function App() {
  const [fileContent, setFileContent] = useState(false);
  const [fileCoverage, setFileCoverage] = useState(false);
  // const
  useEffect(()=>{

  },[])
  return (
    <>
      {
        // (fileContent && fileCoverage) ? <Report value={fileContent} fileCoverage={fileCoverage['packages/flight-h5/src/components/home_b/SearchPanel/index.tsx']}/> : <div>loading...</div>
      }
      <Report2 value={fileContent} fileCoverage={fileCoverage}/>
    </>
  );
}

export default App;
