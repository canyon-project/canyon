import Reports from "./index/reports.tsx";
import { ArrowLeftOutlined } from "@ant-design/icons";

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
        <Reports />
      </div>
    </div>
  );
};

export default OpenReports;
