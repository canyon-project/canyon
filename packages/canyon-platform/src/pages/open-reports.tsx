import Reports from "./index/reports.tsx";
import { ArrowLeftOutlined } from "@ant-design/icons";
import LineChart from "@/components/LineChart.tsx";

const OpenReports = () => {
  return (
    <div>
      <div className={"p-[20px]"}>
        <div className={"py-[10px]"}>
          <a href={"/"}>
            <ArrowLeftOutlined />
            回到Canyon主页
          </a>
        </div>
        <LineChart />
        <div className={"h-5"}></div>
        <Reports />
      </div>
    </div>
  );
};

export default OpenReports;
