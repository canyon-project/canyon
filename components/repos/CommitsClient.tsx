'use client';

import React, { useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import axios from "axios";
import { Layout, Input, List, Typography, Empty, Card, Space, Tag, Pagination, Divider, Spin } from "antd";

type CommitItem = {
  sha: string;
  message?: string;
  authorName?: string;
  authorEmail?: string;
  committedDate?: string;
  [key: string]: any;
};

type CommitListResponse = {
  commits: CommitItem[];
  page?: number;
  pageSize?: number;
  total?: number;
};

type CommitDetailResponse = {
  sha: string;
  commit?: any;
  [key: string]: any;
};

const { Sider, Content } = Layout;

export default function CommitsClient({ params }: { params: { provider: string; org: string; repo: string } }) {
  const { provider, org, repo } = params;
  const repoID = useMemo(() => `${org}__${repo}` as const, [org, repo]);

  const [searchText, setSearchText] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSha, setSelectedSha] = useState<string | null>(null);

  const fetchList = async () => {
    const res = await axios.get<CommitListResponse>(`/api/v1/providers/${provider}/repos/${repoID}/commits`, {
      params: { page: current, pageSize, q: searchText },
    });
    return res.data;
  };

  const { data: listData, loading: listLoading, refresh: refreshList } = useRequest(fetchList, {
    refreshDeps: [provider, repoID, current, pageSize, searchText],
  });

  // 选中首条
  useEffect(() => {
    if (!selectedSha && listData?.commits?.length) {
      setSelectedSha(listData.commits[0].sha);
    }
  }, [listData, selectedSha]);

  const fetchDetail = async () => {
    if (!selectedSha) return null as any;
    const res = await axios.get<CommitDetailResponse>(`/api/v1/providers/${provider}/repos/${repoID}/commits/${selectedSha}`);
    return res.data;
  };

  const { data: detailData, loading: detailLoading } = useRequest(fetchDetail, {
    refreshDeps: [provider, repoID, selectedSha],
  });

  const onSearch = (value: string) => {
    setCurrent(1);
    setSearchText(value.trim());
  };

  const total = listData?.total ?? listData?.commits?.length ?? 0;

  return (
    <Layout style={{ background: "transparent", height: "calc(100vh - 120px)", border: 0 }}>
      <Sider width={380} style={{ background: "#fff", borderRight: "1px solid #f0f0f0", padding: 12 }}>
        <Space direction="vertical" style={{ width: "100%" }} size={12}>
          <Input.Search
            allowClear
            placeholder="搜索 commit（消息 / SHA / 作者）"
            onSearch={onSearch}
            enterButton
          />
          {listLoading ? (
            <div style={{ textAlign: "center", paddingTop: 48 }}>
              <Spin />
            </div>
          ) : listData?.commits?.length ? (
            <>
              <List
                dataSource={listData.commits}
                rowKey={(item) => item.sha}
                renderItem={(item) => {
                  const active = item.sha === selectedSha;
                  return (
                    <List.Item
                      style={{
                        cursor: "pointer",
                        background: active ? "#e6f4ff" : undefined,
                        borderRadius: 6,
                        padding: 12,
                        marginBottom: 8,
                      }}
                      onClick={() => setSelectedSha(item.sha)}
                    >
                      <Space direction="vertical" size={6} style={{ width: "100%" }}>
                        <Typography.Text strong ellipsis>
                          {item.message || item.commit?.message || item.sha}
                        </Typography.Text>
                        <Space wrap>
                          <Tag color="blue">{item.sha.slice(0, 7)}</Tag>
                          {item.authorName && <Typography.Text type="secondary">{item.authorName}</Typography.Text>}
                          {item.committedDate && (
                            <Typography.Text type="secondary">{new Date(item.committedDate).toLocaleString()}</Typography.Text>
                          )}
                        </Space>
                      </Space>
                    </List.Item>
                  );
                }}
              />
              <Pagination
                size="small"
                total={total}
                current={current}
                pageSize={pageSize}
                showSizeChanger
                onChange={(p, ps) => {
                  setCurrent(p);
                  setPageSize(ps);
                }}
              />
            </>
          ) : (
            <Empty description="暂无提交" />
          )}
        </Space>
      </Sider>
      <Content style={{ padding: 16 }}>
        <Typography.Title level={5}>
          提交详情 {selectedSha ? `(${selectedSha.slice(0, 12)})` : ""}
        </Typography.Title>
        <Divider style={{ margin: "12px 0 16px" }} />
        {detailLoading ? (
          <div style={{ textAlign: "center", paddingTop: 48 }}>
            <Spin />
          </div>
        ) : selectedSha && detailData ? (
          <Card>
            <pre style={{ margin: 0 }}>
              {JSON.stringify(detailData, null, 2)}
            </pre>
          </Card>
        ) : (
          <Empty description="请选择左侧提交查看详情" />
        )}
      </Content>
    </Layout>
  );
}