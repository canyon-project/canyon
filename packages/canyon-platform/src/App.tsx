// import React from "react";
import { Button } from "antd";
import { Editor } from "@monaco-editor/react";

const App = () => {
  return (
    <div>
      <Button>你好</Button>
      <Editor height={500} value={`{}`} language={"json"} />
    </div>
  );
};

export default App;
