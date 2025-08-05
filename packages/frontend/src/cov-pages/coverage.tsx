import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { Card, Typography, Spin, Input, Button, Space, Select } from 'antd';
import { SearchOutlined, FileOutlined } from '@ant-design/icons';
import axios from 'axios';
import Layout from '../components/Layout';

const { Title, Text } = Typography;
const { Option } = Select;

interface CoverageFile {
  path: string;
  statementMap: any;
  fnMap: any;
  branchMap: any;
  s: Record<string, number>;
  f: Record<string, number>;
  b: Record<string, any>;
}

const CoveragePage = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  const { provider, org, repo } = params;
  const sha = searchParams.get('sha') || '';
  const buildProvider = searchParams.get('buildProvider') || '';
  const buildID = searchParams.get('buildID') || '';
  const reportProvider = searchParams.get('reportProvider') || '';
  const reportID = searchParams.get('reportID') || '';

  const { data: coverageMap, loading } = useRequest(() => {
    if (!sha) return Promise.resolve({});
    
    const repoId = `${org}/${repo}`;
    return axios
      .get('/api/v1/coverage/map', {
        params: {
          provider,
          repoID: repoId,
          sha,
          buildProvider,
          buildID,
          reportProvider,
          reportID,
          filePath: selectedFile,
        }
      })
      .then((res) => res.data);
  }, {
    refreshDeps: [sha, buildProvider, buildID, reportProvider, reportID, selectedFile],
  });

  const { data: summaryMap, loading: summaryLoading } = useRequest(() => {
    if (!sha) return Promise.resolve({});
    
    const repoId = `${org}/${repo}`;
    return axios
      .get('/api/v1/coverage/summary/map', {
        params: {
          provider,
          repoID: repoId,
          sha,
          buildProvider,
          buildID,
          reportProvider,
          reportID,
        }
      })
      .then((res) => res.data);
  }, {
    refreshDeps: [sha, buildProvider, buildID, reportProvider, reportID],
  });

  const filteredFiles = Object.keys(summaryMap || {}).filter(filePath =>
    filePath.toLowerCase().includes(searchText.toLowerCase())
  );

  const calculateOverallCoverage = (summary: any) => {
    if (!summary) return { lines: 0, functions: 0, statements: 0, branches: 0 };
    
    let totalLines = 0, coveredLines = 0;
    let totalFunctions = 0, coveredFunctions = 0;
    let totalStatements = 0, coveredStatements = 0;
    let totalBranches = 0, coveredBranches = 0;

    Object.values(summary).forEach((fileSummary: any) => {
      totalLines += fileSummary.lines?.total || 0;
      coveredLines += fileSummary.lines?.covered || 0;
      totalFunctions += fileSummary.functions?.total || 0;
      coveredFunctions += fileSummary.functions?.covered || 0;
      totalStatements += fileSummary.statements?.total || 0;
      coveredStatements += fileSummary.statements?.covered || 0;
      totalBranches += fileSummary.branches?.total || 0;
      coveredBranches += fileSummary.branches?.covered || 0;
    });

    return {
      lines: totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(2) : 0,
      functions: totalFunctions > 0 ? ((coveredFunctions / totalFunctions) * 100).toFixed(2) : 0,
      statements: totalStatements > 0 ? ((coveredStatements / totalStatements) * 100).toFixed(2) : 0,
      branches: totalBranches > 0 ? ((coveredBranches / totalBranches) * 100).toFixed(2) : 0,
    };
  };

  const overallCoverage = calculateOverallCoverage(summaryMap);

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Title level={2}>Coverage Report</Title>
          <Text type="secondary">
            {provider}/{org}/{repo} - {sha?.substring(0, 7)}
          </Text>
        </div>

        {/* Overall Coverage Summary */}
        <Card className="mb-6">
          <Title level={4}>Overall Coverage</Title>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallCoverage.lines}%</div>
              <Text>Lines</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallCoverage.functions}%</div>
              <Text>Functions</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallCoverage.statements}%</div>
              <Text>Statements</Text>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{overallCoverage.branches}%</div>
              <Text>Branches</Text>
            </div>
          </div>
        </Card>

        <div className="flex gap-6">
          {/* File List */}
          <Card className="w-80" title="Files">
            <Space direction="vertical" className="w-full mb-4">
              <Input
                placeholder="Search files..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Select a file"
                value={selectedFile}
                onChange={setSelectedFile}
                className="w-full"
                allowClear
              >
                {filteredFiles.map(filePath => (
                  <Option key={filePath} value={filePath}>
                    <FileOutlined className="mr-2" />
                    {filePath.split('/').pop()}
                  </Option>
                ))}
              </Select>
            </Space>

            {summaryLoading ? (
              <Spin />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredFiles.map(filePath => {
                  const fileSummary = summaryMap[filePath];
                  return (
                    <div
                      key={filePath}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                        selectedFile === filePath ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedFile(filePath)}
                    >
                      <div className="font-medium text-sm truncate" title={filePath}>
                        {filePath.split('/').pop()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Lines: {fileSummary?.lines?.pct?.toFixed(1) || 0}% | 
                        Functions: {fileSummary?.functions?.pct?.toFixed(1) || 0}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Coverage Details */}
          <Card className="flex-1" title={selectedFile ? `Coverage: ${selectedFile}` : 'Select a file'}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : selectedFile && coverageMap[selectedFile] ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">
                      {summaryMap[selectedFile]?.lines?.pct?.toFixed(1) || 0}%
                    </div>
                    <Text>Lines</Text>
                    <div className="text-xs text-gray-500">
                      {summaryMap[selectedFile]?.lines?.covered || 0}/
                      {summaryMap[selectedFile]?.lines?.total || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {summaryMap[selectedFile]?.functions?.pct?.toFixed(1) || 0}%
                    </div>
                    <Text>Functions</Text>
                    <div className="text-xs text-gray-500">
                      {summaryMap[selectedFile]?.functions?.covered || 0}/
                      {summaryMap[selectedFile]?.functions?.total || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">
                      {summaryMap[selectedFile]?.statements?.pct?.toFixed(1) || 0}%
                    </div>
                    <Text>Statements</Text>
                    <div className="text-xs text-gray-500">
                      {summaryMap[selectedFile]?.statements?.covered || 0}/
                      {summaryMap[selectedFile]?.statements?.total || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">
                      {summaryMap[selectedFile]?.branches?.pct?.toFixed(1) || 0}%
                    </div>
                    <Text>Branches</Text>
                    <div className="text-xs text-gray-500">
                      {summaryMap[selectedFile]?.branches?.covered || 0}/
                      {summaryMap[selectedFile]?.branches?.total || 0}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-100 rounded">
                  <Text strong>Coverage Data Preview</Text>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {JSON.stringify(coverageMap[selectedFile], null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {selectedFile ? 'No coverage data available for this file' : 'Select a file to view coverage details'}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CoveragePage;