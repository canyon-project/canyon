import "./CopyCode.css";

import { CopyOutlined } from "@ant-design/icons";
import { FC, useEffect } from "react";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";
// @ts-ignore
import { codeToHtml } from "https://esm.sh/shiki@1.0.0";
const CopyCode: FC<{ code: string }> = ({ code }) => {
  const fileContent = code;
  const [content, setContent] = useState("");

  useEffect(() => {
    if (fileContent) {
      codeToHtml(fileContent, {
        lang: "json",
        theme: "tokyo-night",
      }).then((html) => {
        setContent(html);
      });
    }
  }, [fileContent]);
  return (
    <div className={"relative copy-code"}>
      <div className={"absolute right-[10px] top-[10px]"}>
        <CopyToClipboard text={code} onCopy={() => message.success("Copied!")}>
          <Button
            type={"link"}
            className={"btn hidden"}
            icon={<CopyOutlined />}
          />
        </CopyToClipboard>
      </div>

      <div className={"p-2 bg-[#1a1b26] rounded-lg pb-[1px]"}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default CopyCode;
