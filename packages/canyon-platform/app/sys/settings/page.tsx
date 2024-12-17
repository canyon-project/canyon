"use client";
import MainBox from "@/components/wget/layout/main-box";
import { Editor } from "@monaco-editor/react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { Button, message, Spin } from "antd";

// 统一请求函数，支持GET和PUT
const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const putFetcher = (url: string, value: string) =>
  axios.put(url, { value }).then((res) => res.data);

const SysSettingsPage = () => {
  const { data, error, isLoading } = useSWR("/api/sdk", fetcher);

  const [value, setValue] = useState(""); // 初始状态为空字符串

  // 使用 useEffect 在数据加载完成后更新 `value` 状态
  useEffect(() => {
    if (data?.value) {
      setValue(data.value);
    }
  }, [data]); // 依赖 `data`，当 `data` 变化时更新 `value`

  // 使用 useCallback 缓存处理保存的函数，避免不必要的重渲染
  const handleSave = useCallback(async () => {
    try {
      const updatedData = await putFetcher("/api/sdk", value);
      mutate("/api/sdk", updatedData, false); // 更新缓存，避免重新请求
      message.success("保存成功");
    } catch (err) {
      console.error("保存失败", err);
      message.error("保存失败，请重试");
    }
  }, [value]);

  // 异常处理：请求失败时显示错误提示
  if (error) {
    message.error("数据加载失败，请刷新重试");
  }

  // 加载中提示
  if (isLoading) {
    return (
      <MainBox>
        <Spin size="large" tip="加载中..." />
      </MainBox>
    );
  }

  return (
    <MainBox>
      {data ? (
        <Editor
          value={value} // 使用 state 作为 value
          language="javascript"
          height="70vh"
          onChange={(v) => {
            setValue(v || "");
          }} // 更新 value
        />
      ) : (
        <div>没有数据</div>
      )}
      <Button onClick={handleSave} disabled={!value}>
        保存
      </Button>
    </MainBox>
  );
};

export default SysSettingsPage;
