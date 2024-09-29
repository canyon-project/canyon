// @ts-nocheck
import React from "react";
import { useEffect, useState } from "react";
import { createHighlighterCoreInstance } from "../../helpers/loadShiki";

const FileCoverageDetail = ({ fileContent }) => {
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
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: htmlContent,
      }}
    ></div>
  );
};

export default FileCoverageDetail;
