import React, { FC } from "react";
import { useEffect, useState } from "react";
import { createHighlighterCoreInstance } from "../../helpers/loadShiki";

function jisuanColor(coun) {
  if (coun === 0) {
    return "rgb(252, 225, 229)";
  }
  if (coun > 0) {
    return "rgb(230, 245, 208)";
  }
  if (coun < 0) {
    return "unset";
  }
}

const FileCoverageDetail: FC<{
  fileContent: string;
  lines: { count: number }[];
  dsss: any[];
}> = ({ fileContent, lines, dsss }) => {
  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    createHighlighterCoreInstance().then((highlighter) => {
      const html = highlighter.codeToHtml(fileContent || "", {
        lang: "javascript",
        theme: "light-plus",
        decorations: dsss,
      });
      setHtmlContent(html);
    });
    console.log(dsss);
  }, [fileContent]);

  return (
    <div className={"flex"}>
      {/*行号*/}
      <div>
        {lines.map((lin, index) => {
          return (
            <div
              key={index}
              className={"h-[24px] text-right text-[#0071c2]"}
              style={{ lineHeight: "24px", fontSize: "12px" }}
            >
              {index + 1}
            </div>
          );
        })}
      </div>
      <div className={"w-[16px]"}></div>
      {/*执行次数*/}
      <div
        style={{
          backgroundColor: "rgb(234, 234, 234)",
        }}
      >
        {lines.map((lin, index) => {
          return (
            <div
              key={index}
              className={"h-[24px] px-[5px]"}
              style={{
                lineHeight: "24px",
                fontSize: "12px",
                backgroundColor: jisuanColor(lin.count),
                color: "rgba(0, 0, 0, 0.5)",
                textAlign: "right",
              }}
            >
              {lin.count > 0 ? lin.count + "x" : ""}
            </div>
          );
        })}
      </div>
      <div className={"w-[12px]"}></div>
      <div
        dangerouslySetInnerHTML={{
          __html: htmlContent,
        }}
      />
    </div>
  );
};

export default FileCoverageDetail;
