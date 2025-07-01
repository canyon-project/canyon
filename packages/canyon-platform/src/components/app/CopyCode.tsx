import "./CopyCode.css";

import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { FC } from "react";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";
import Editor from "@monaco-editor/react";

const CopyCode: FC<{ code: string }> = ({ code }) => {
  return (
    <div className={"relative copy-code"}>
      <div className={"absolute right-[10px] top-[10px] z-10"}>
        <CopyToClipboard text={code} onCopy={() => message.success("Copied!")}>
          <Button
            type={"link"}
            className={"btn hidden"}
            icon={<CopyOutlined />}
          />
        </CopyToClipboard>
      </div>

      <div className={"p-2 rounded-lg pb-[1px]"}>
        <Editor
          height="200px"
          defaultLanguage="json"
          value={code}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 12,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};

export default CopyCode;
