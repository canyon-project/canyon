import "./CopyCode.css";

import { CopyOutlined } from "@ant-design/icons";
import { codeToHtml } from "https://esm.sh/shiki@1.0.0";
// 打开下面的注释，注释掉上面的代码，即可纯粹的使用本地代码
// import { codeToHtml } from "shiki";
import { FC, useEffect } from "react";
// @ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";

const CopyCode: FC<{ code: string }> = ({ code }) => {
  const fileContent = code;
  const [content, setContent] = useState("");

  useEffect(() => {
    if (fileContent) {
      codeToHtml(fileContent, {
        lang: "json",
        theme: "tokyo-night",
      }).then((r) => {
        setContent(r);
      });
    }
  }, [fileContent]);
  return (
    <div className={"relative copy-code"}>
      <div className={"absolute right-[10px] top-[10px]"}>
        <CopyToClipboard text={code}>
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
