import { AntdRegistry } from "@ant-design/nextjs-registry";
import type React from "react";
import "./globals.css";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const RootLayout = async ({ children }: React.PropsWithChildren) => {
  const messages = await getMessages();
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
        <title>Canyon</title>
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AntdRegistry>
            <>{children}</>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
