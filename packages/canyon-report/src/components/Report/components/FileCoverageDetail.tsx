import React, { FC } from "react";
import { useEffect, useState } from "react";
import { createHighlighterCoreInstance } from "../../helpers/loadShiki";

const FileCoverageDetail: FC<{ fileContent: string }> = ({ fileContent }) => {
  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    createHighlighterCoreInstance().then((highlighter) => {
      const html = highlighter.codeToHtml(fileContent || "", {
        lang: "javascript",
        theme: "light-plus",
      });
      setHtmlContent(html);
    });
  }, [fileContent]);

  const lines = fileContent.split("\n");
  return (
    <div className={"flex"}>
      <div>
        {lines.map((lin, index) => {
          return (
            <div
              className={"h-[24px]"}
              style={{ lineHeight: "24px", fontSize: "12px" }}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      <div
        dangerouslySetInnerHTML={{
          __html: htmlContent,
        }}
      />
    </div>
  );
};

export default FileCoverageDetail;
