import { codeToHtml } from "shiki";

export default function Page() {
  return (
    <main>
      <CodeBlock />
    </main>
  );
}

async function CodeBlock() {
  const out = await codeToHtml('console.log("Hello World")', {
    lang: "ts",
    theme: "github-dark",
  });

  return <div dangerouslySetInnerHTML={{ __html: out }} />;
}
