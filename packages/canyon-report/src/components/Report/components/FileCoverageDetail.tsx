// @ts-nocheck
import React from "react";
// import { codeToHtml } from 'https://esm.sh/shiki@1.0.0'
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
const FileCoverageDetail = ({ fileContent }) => {
  // console.log(fileContent);
  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    codeToHtml(fileContent || "", {
      lang: "javascript",
      theme: "vitesse-dark",
    }).then((r) => {
      console.log(r);
      setHtmlContent(r);
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
