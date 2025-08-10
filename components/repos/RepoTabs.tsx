"use client";

import { Tabs } from "antd";
import { usePathname, useRouter } from "next/navigation";

export default function RepoTabs({
  basePath,
}: {
  basePath: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const tabs = [
    { href: `${basePath}/commits`, label: "提交(commits)" },
    { href: `${basePath}/pulls`, label: "合并请求(pulls)" },
    { href: `${basePath}/multiple-commits`, label: "多提交比较" },
  ];

  const items = tabs.map((t) => ({ key: t.href, label: t.label }));
  const activeKey = items.some((i) => i.key === pathname)
    ? pathname
    : `${basePath}/commits`;

  return (
    <Tabs
      activeKey={activeKey}
      onChange={(key) => router.push(key)}
      items={items}
    />
  );
}


