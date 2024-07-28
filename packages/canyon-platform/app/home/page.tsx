import { codeToHtml } from "shiki";

export async function Home() {
  const code = "const a = 1"; // input code
  const html = await codeToHtml(code, {
    lang: "javascript",
    theme: "vitesse-dark",
  });

  console.log(html); // highlighted html string
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    ></div>
  );
}
export default Home;
