import useSWR from "swr";
import { request } from "./utils/request";
import {Button, Spin} from "antd";
import Report from "@/components/report.tsx";
function App () {
  const { data, isLoading } = useSWR(`/api/base`, request)
  return <Spin spinning={isLoading}>
    <Report/>
    <Button type={'primary'}>你好</Button>
    hello {JSON.stringify(data)}!</Spin>
}

export default App
