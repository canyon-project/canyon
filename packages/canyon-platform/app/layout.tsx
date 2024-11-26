import { AntdRegistry } from "@ant-design/nextjs-registry";
import type React from "react";
import "./globals.css";
// import MainBox from "@/components/main-box";
import localFont from "next/font/local";
// import 'antd/dist/reset.css'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <head>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    </head>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AntdRegistry>
        <>{children}</>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
