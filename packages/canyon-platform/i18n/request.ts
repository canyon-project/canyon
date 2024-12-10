import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeReqCookie = cookieStore.get("locale");
  const locale = localeReqCookie?.value || "en";
  const messages = (await import(`../public/locales/${locale}.json`)).default;
  return {
    locale: locale,
    messages: messages,
  };
});
