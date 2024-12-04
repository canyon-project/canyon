"use client";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import axios from "axios";
const fetcher = (url: any) =>
  axios
    .post(url, {
      name: "locale",
      value: "cn",
    })
    .then((res) => res.data);

const LoginPage = () => {
  // const
  const { data, error, isLoading } = useSWR("/api/cookie", fetcher);
  const t = useTranslations();
  return <div>{t("welcome.hello")}</div>;
};

export default LoginPage;
