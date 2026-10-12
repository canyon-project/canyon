import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={3} className="!mb-1">
          工作台
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="!mb-0">
          欢迎回来，这里是企业运营数据概览。
        </Typography.Paragraph>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="今日访问" value={1286} suffix="次" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="新增用户"
              value={42}
              suffix="人"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="待处理工单"
              value={17}
              suffix="条"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="本月营收" value={92840} prefix="¥" precision={2} />
          </Card>
        </Col>
      </Row>
      <Card title="快捷说明" bordered={false}>
        <ul className="m-0 list-disc space-y-2 pl-5 text-neutral-600">
          <li>左侧导航切换模块，右侧为对应业务页面。</li>
          <li>
            页面文件位于 <code>src/pages</code>，由 vite-plugin-pages 自动生成路由。
          </li>
          <li>
            布局与菜单在 <code>src/layouts/AdminLayout.tsx</code> 中维护。
          </li>
        </ul>
      </Card>
    </div>
  );
}
