"use client";
import { Input, Button, Tooltip, Typography, Divider } from "antd";
import {
  QuestionCircleOutlined,
  DownloadOutlined,
  GithubOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function CanyonPage() {
  return (
    <div className="w-[500px]">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-white/50 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-t-4 border-l-4 border-r-4 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
            </div>
          </div>
          <span className="text-2xl font-bold">Canyon</span>
        </div>
        <GithubOutlined className="text-xl" />
      </header>

      {/* Content */}
      <div className="p-4">
        {/* Data Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">
            Data
          </h2>

          <div className="grid grid-cols-[auto_1fr] gap-y-3 mb-4">
            <Text className="text-gray-600">Project ID:</Text>
            <Text className="pl-1">118075</Text>

            <Text className="text-gray-600">Commit Sha:</Text>
            <Text className="pl-1">
              1053f12ad516b609ec1e05bb013a4cd25947a873
            </Text>

            <Text className="text-gray-600">Branch:</Text>
            <Text className="pl-1">dev</Text>

            <Text className="text-gray-600">DSN:</Text>
            <Text className="pl-1">
              https://canyontest.fat3.qa.nt.ctripcorp.com/coverage/client
            </Text>

            <Text className="text-gray-600">Coverage:</Text>
            <div className="flex items-center gap-2 pl-1">
              <Text className="text-blue-500">53</Text>
              <DownloadOutlined className="text-blue-500" />
            </div>

            <div className="flex items-center text-gray-600">
              <Text>Interval Report</Text>
              <Tooltip title="Help information">
                <QuestionCircleOutlined className="ml-1 text-gray-400" />
              </Tooltip>
              <Text>:</Text>
            </div>
            <div className="flex items-center gap-2 pl-1">
              <Input className="max-w-[100px]" value="7" />
              <Text>s</Text>
            </div>

            <div className="flex items-center text-gray-600">
              <Text>Report ID</Text>
              <Tooltip title="Help information">
                <QuestionCircleOutlined className="ml-1 text-gray-400" />
              </Tooltip>
              <Text>:</Text>
            </div>
            <div className="pl-1">
              <Input className="w-full" value="661393_cover_flyui" />
            </div>

            <Text className="text-gray-600">Reporter:</Text>
            <div className="flex items-center gap-2 pl-1">
              <Input
                className="w-[180px]"
                value="eyJhbGciOiJIUzI1NiIsInR5cCI6"
              />
              <Text>tzhangm@trip.com</Text>
              <CheckCircleOutlined className="text-green-500" />
            </div>
          </div>

          <Divider className="my-4" />
        </div>

        {/* Action Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">
            Action
          </h2>

          <div className="flex gap-4">
            <Button type="primary" className="w-[150px] bg-blue-600">
              Upload
            </Button>
            <Button className="w-[150px] border-gray-300">Refresh</Button>
          </div>

          <Divider className="my-4" />
        </div>

        {/* Result Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">
            Result
          </h2>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
