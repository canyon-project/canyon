import {ChartTest} from "@/components/ChartTest.tsx";

const OverviewPage = () => {
  return (
    <div className={"w-full"}>
      <div className="flex h-[300px]">
        {/* 左侧四宫格 */}
        <div className="w-[50%] p-4 grid grid-cols-2 gap-4">
          <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center">
            <span className="text-lg font-bold">指标 1</span>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center">
            <span className="text-lg font-bold">指标 2</span>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center">
            <span className="text-lg font-bold">指标 3</span>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center">
            <span className="text-lg font-bold">指标 4</span>
          </div>
        </div>

        {/* 右侧折线图 */}
        <div className="w-[50%] p-4">
          <div className="bg-white shadow-md rounded-lg p-6 h-full">


              <ChartTest/>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
