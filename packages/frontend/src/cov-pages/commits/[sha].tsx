import { useParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Card, Typography, Spin, Tag, Divider, Progress } from 'antd';
import axios from 'axios';
import Layout from '../../components/Layout';

const { Title, Text } = Typography;

interface BuildGroup {
  buildID: string;
  buildProvider: string;
  summary: {
    total: number;
    covered: number;
    percent: string;
  };
  modeList: Array<{
    mode: string;
    summary: {
      total: number;
      covered: number;
      percent: string;
    };
    caseList: Array<{
      id: string;
      reportID: string;
      reportProvider: string;
      caseName: string;
      passedCount: number;
      failedCount: number;
      totalCount: number;
      passRate: string;
      summary: {
        total: number;
        covered: number;
        percent: string;
      };
    }>;
  }>;
}

const CommitDetailPage = () => {
  const params = useParams();
  const { provider, org, repo, sha } = params;

  const { data: commitDetails, loading } = useRequest(() => {
    const repoId = `${org}/${repo}`;
    return axios
      .get(`/api/v1/repo/${encodeURIComponent(repoId)}/commits/${sha}`)
      .then((res) => res.data);
  });

  const getPercentageValue = (percent: string) => {
    return parseFloat(percent.replace('%', ''));
  };

  const getStatusColor = (percent: string) => {
    const value = getPercentageValue(percent);
    if (value >= 80) return 'success';
    if (value >= 60) return 'warning';
    return 'exception';
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2}>Commit Details</Title>
          <Text type="secondary" className="font-mono">
            {sha}
          </Text>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-6">
            {commitDetails?.map((buildGroup: BuildGroup, index: number) => (
              <Card key={index} title={`Build: ${buildGroup.buildProvider} - ${buildGroup.buildID}`}>
                <div className="mb-4">
                  <Title level={4}>Overall Summary</Title>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Text strong>Total Lines</Text>
                      <div className="text-2xl font-bold text-blue-600">
                        {buildGroup.summary.total}
                      </div>
                    </div>
                    <div className="text-center">
                      <Text strong>Covered Lines</Text>
                      <div className="text-2xl font-bold text-green-600">
                        {buildGroup.summary.covered}
                      </div>
                    </div>
                    <div className="text-center">
                      <Text strong>Coverage</Text>
                      <div className="text-2xl font-bold">
                        <Progress
                          type="circle"
                          size={60}
                          percent={getPercentageValue(buildGroup.summary.percent)}
                          status={getStatusColor(buildGroup.summary.percent)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {buildGroup.modeList.map((mode, modeIndex) => (
                  <div key={modeIndex} className="mb-6">
                    <Title level={4}>
                      {mode.mode === 'auto' ? 'Automated Tests' : 'Manual Tests'}
                      <Tag color={mode.mode === 'auto' ? 'blue' : 'orange'} className="ml-2">
                        {mode.caseList.length} cases
                      </Tag>
                    </Title>

                    <div className="mb-4 p-4 bg-gray-50 rounded">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <Text type="secondary">Total</Text>
                          <div className="font-bold">{mode.summary.total}</div>
                        </div>
                        <div>
                          <Text type="secondary">Covered</Text>
                          <div className="font-bold text-green-600">{mode.summary.covered}</div>
                        </div>
                        <div>
                          <Text type="secondary">Coverage</Text>
                          <div className="font-bold">{mode.summary.percent}</div>
                        </div>
                        <div>
                          <Progress
                            percent={getPercentageValue(mode.summary.percent)}
                            size="small"
                            status={getStatusColor(mode.summary.percent)}
                          />
                        </div>
                      </div>
                    </div>

                    {mode.caseList.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mode.caseList.map((testCase, caseIndex) => (
                          <Card
                            key={caseIndex}
                            size="small"
                            title={testCase.caseName}
                            extra={
                              <Tag color={testCase.reportProvider === 'mpaas' ? 'blue' : 'green'}>
                                {testCase.reportProvider}
                              </Tag>
                            }
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Text>Coverage:</Text>
                                <Text strong>{testCase.summary.percent}</Text>
                              </div>
                              <div className="flex justify-between">
                                <Text>Lines:</Text>
                                <Text>{testCase.summary.covered}/{testCase.summary.total}</Text>
                              </div>
                              <div className="flex justify-between">
                                <Text>Pass Rate:</Text>
                                <Text strong>{testCase.passRate}</Text>
                              </div>
                              <div className="flex justify-between">
                                <Text>Tests:</Text>
                                <Text>
                                  <span className="text-green-600">{testCase.passedCount}</span>/
                                  <span className="text-red-600">{testCase.failedCount}</span>/
                                  {testCase.totalCount}
                                </Text>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}

        {!loading && (!commitDetails || commitDetails.length === 0) && (
          <div className="text-center py-12">
            <Text type="secondary">No coverage data found for this commit.</Text>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CommitDetailPage;