"use client";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import MainBox from "@/components/wget/layout/main-box";
import { Report } from "../../../../../../../../../canyon-report/src/components";
import { theme } from "antd";
import { handleSelect } from "@/utils/handle";
const { useToken } = theme;

const fetcher = ({ url, params }: { url: string; params: any }) =>
  axios
    .get(url, {
      params: params,
    })
    .then((res) => res.data);

export default function Page() {
  const { token } = useToken();
  const { filepath, id, sha } = useParams(); // 获取动态路由参数
  // @ts-ignore
  const defaultFilePath = filepath ? filepath.join("/") : "";
  // 当前选择的路径
  const [value, setValue] = useState(defaultFilePath);

  // 非常重要的一步，获取整体覆盖率数据
  const { data: summary } = useSWR(
    {
      url: "/api/cov/summary/map",
      params: {
        project_id: id,
        sha,
      },
    },
    fetcher,
  );

  const { data: projectInfo } = useSWR(
    {
      url: `/api/project/${id}`,
      params: {
        project_id: id,
        sha,
      },
    },
    fetcher,
  );

  const onSelect = (val: any) => {
    // TODO 防止页面刷新，但是不能回退，是否有更好的方式？
    history.pushState(
      null,
      "",
      `/projects/tripgl/${id}/auto/commits/${sha}/${val}`,
    );
    // 设置当前选择的路径
    setValue(val);
    // 处理选择事件
    return handleSelect({
      projectID: id,
      sha,
      filepath: val,
    });
  };

  return (
    <MainBox>
      <div
        className="p-2 rounded-md bg-white dark:bg-[#151718]"
        style={{
          boxShadow: `${token.boxShadowTertiary}`,
        }}
      >
        {summary?.length && (
          <Report
            reportName={projectInfo.pathWithNamespace.split("/")[1]}
            dataSource={summary || []}
            onSelect={onSelect}
            value={value}
          />
        )}
      </div>
    </MainBox>
  );
}
