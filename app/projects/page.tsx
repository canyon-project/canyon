"use client";

import React, { useMemo } from "react";
import { Table, Typography, Alert, Spin, Button } from "antd";
import { useRequest } from "ahooks";
import axios from "axios";
import { useRouter } from "next/navigation";

type ProjectsResponse<T = any> = {
  data: T[];
  total: number;
};

export default function ProjectsPage() {
  const router = useRouter();
  const { data, error, loading } = useRequest(async () => {
    const res = await axios.get<ProjectsResponse>("/api/v1/projects");
    return res.data;
  });

  const columns = useMemo(() => {
    const first = data?.data?.[0];
    if (!first) return [] as any[];
    const baseCols = Object.keys(first).map((key) => ({
      title: key,
      dataIndex: key,
      render: (value: unknown) => {
        if (
          value === null ||
          typeof value === "number" ||
          typeof value === "string" ||
          typeof value === "boolean"
        ) {
          return String(value);
        }
        return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>;
      },
    }));

    const actionCol = {
      title: "操作",
      key: "action",
      render: (_: any, record: any) => {
        const provider = "github"; // 假设默认 provider 为 github
        const ns: string = record?.pathWithNamespace ?? "";
        const parts = String(ns).split("/").filter(Boolean);
        const org = parts[0] ?? "";
        const repo = parts[parts.length - 1] ?? "";
        const href = `/${provider}/${org}/${repo}/commits`;
        return (
          <Button type="link" onClick={() => router.push(href)}>
            详情
          </Button>
        );
      },
    } as const;

    return [...baseCols, actionCol] as any[];
  }, [data]);

  const rowKey = useMemo(() => {
    const first = data?.data?.[0];
    if (!first) return (record: any, index: number) => String(index);
    return (record: any, index: number) => String(record.id ?? index);
  }, [data]);

  if (error) {
    return (
      <Alert
        type="error"
        message="加载项目失败"
        description={String(error)}
        showIcon
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        项目列表{typeof data?.total === "number" ? `（${data.total}）` : ""}
      </Typography.Title>
      {loading ? (
        <div style={{ padding: 48, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Table
          dataSource={data?.data ?? []}
          columns={columns}
          rowKey={rowKey as any}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
}


