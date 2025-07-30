import "./globals.css";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import Image from "next/image";
import Link from "next/link";
import { GitHubIcon } from "nextra/icons";
import { ConfigProvider } from "antd";

export const metadata = {
  title: {
    template: "%s - Canyon",
    default: "Canyon - JavaScript 代码覆盖率解决方案",
  },
  description: "更准确的收集 JavaScript 覆盖率数据的开源解决方案",
  keywords: ["JavaScript", "代码覆盖率", "测试", "E2E", "Babel", "Istanbul"],
  authors: [{ name: "Canyon Team" }],
  creator: "Canyon Team",
  publisher: "Canyon Team",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://cn.docs.canyonjs.org",
    title: "Canyon - JavaScript 代码覆盖率解决方案",
    description: "更准确的收集 JavaScript 覆盖率数据的开源解决方案",
    siteName: "Canyon Documentation",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canyon - JavaScript 代码覆盖率解决方案",
    description: "更准确的收集 JavaScript 覆盖率数据的开源解决方案",
  },
};

// const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>
const navbar = (
  <Navbar
    projectLink="https://github.com/canyon-project/canyon"
    projectIcon={<GitHubIcon height="24" />}
    logo={
      <div className="flex hover:nx-opacity-75 items-center">
        <img src="/logo.svg" style={{ width: "32px" }} alt="" />
        <div className="mx-2 font-extrabold hidden md:inline select-none">
          CANYON
        </div>
        <div className="text-gray-600 font-normal hidden lg:!inline whitespace-no-wrap">
          JavaScript 代码覆盖率解决方案
        </div>
      </div>
    }
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Canyon.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html
      // Not required, but good for SEO
      lang="zh-CN"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <title>JavaScript 代码覆盖率解决方案 - CANYON</title>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0071c2",
            },
          }}
        >
          <Layout
            // banner={banner}
            navbar={navbar}
            pageMap={await getPageMap()}
            docsRepositoryBase="https://github.com/canyon-project/canyon/tree/main/website/cn"
            footer={footer}
            // ... Your additional layout options
          >
            {children}
          </Layout>
        </ConfigProvider>
      </body>
    </html>
  );
}
