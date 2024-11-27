import { AntdRegistry } from "@ant-design/nextjs-registry";
import type React from "react";
import "./globals.css";

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <head>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    </head>
    <body>
      <AntdRegistry>
        <>{children}</>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
