import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

type LabelSelector = {
  key: string;
  operator: '=' | '!=' | '=~' | '!~';
  value: string;
};

type CoverageRecord = {
  id: number;
  commitSha: string;
  scene: Record<string, string>;
  sceneKey: string;
  coverage: {
    lines: { total: number; covered: number };
    functions: { total: number; covered: number };
    branches: { total: number; covered: number };
  };
  createdAt: string;
};

type SceneSelectorProps = {
  onStepChange?: (step: number) => void;
  initialStep?: number;
  initialSelectedRecord?: CoverageRecord | null;
};

const SceneSelector = ({
  onStepChange,
  initialStep,
  initialSelectedRecord,
}: SceneSelectorProps = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(initialStep ?? 0);
  const [selectors, setSelectors] = useState<LabelSelector[]>([
    { key: '', operator: '=', value: '' },
  ]);
  const [queryResults, setQueryResults] = useState<CoverageRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CoverageRecord | null>(
    initialSelectedRecord ?? null,
  );

  // 从 URL 参数读取表单数据（仅在组件首次挂载时读取一次）
  useEffect(() => {
    // 如果传入了初始步骤或初始记录，优先使用
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
      onStepChange?.(initialStep);
    }
    if (initialSelectedRecord) {
      setSelectedRecord(initialSelectedRecord);
    }

    const sceneData = searchParams.get('scene_data');
    if (sceneData) {
      try {
        const decoded = atob(sceneData);
        const data = JSON.parse(decoded);
        if (data.selectors && Array.isArray(data.selectors)) {
          setSelectors(data.selectors);
        }
        // 如果没有传入 initialStep，才从 URL 读取
        if (initialStep === undefined && typeof data.step === 'number') {
          setCurrentStep(data.step);
          onStepChange?.(data.step);
        }
        if (data.queryResults && Array.isArray(data.queryResults)) {
          setQueryResults(data.queryResults);
        }
        // 如果没有传入 initialSelectedRecord，才从 URL 读取
        if (!initialSelectedRecord && data.selectedRecord) {
          setSelectedRecord(data.selectedRecord);
        }
      } catch (e) {
        console.error('Failed to parse scene data from URL:', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 将表单数据同步到 URL 参数
  const updateURLParams = (
    newSelectors: LabelSelector[],
    step: number,
    results?: CoverageRecord[],
    selected?: CoverageRecord | null,
  ) => {
    const data = {
      selectors: newSelectors,
      step,
      queryResults: results,
      selectedRecord: selected,
    };
    const encoded = btoa(JSON.stringify(data));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('scene_data', encoded);
    setSearchParams(newParams, { replace: true });
  };

  // 当步骤改变时通知父组件
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    onStepChange?.(step);
    updateURLParams(selectors, step, queryResults, selectedRecord);
  };

  // Mock 数据：所有可用的 key
  const mockKeys = [
    'environment',
    'service',
    'version',
    'branch',
    'build_target',
    'platform',
    'os',
    'arch',
    'region',
    'cluster',
  ];

  // 获取所有可用的 key（Mock）
  const { data: keysData, loading: keysLoading } = useRequest(
    async () => {
      // 模拟网络延迟
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockKeys.map((key) => ({ label: key, value: key }));
    },
    { refreshDeps: [] },
  );

  const keyOptions = keysData || [];

  // 转义 SQL 字符串值（防止 SQL 注入）
  // 单引号转义为两个单引号，反斜杠转义为两个反斜杠
  const escapeSQLString = (value: string): string => {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
  };

  // 验证 key 是否为有效的标识符
  const isValidKey = (key: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
  };

  // 将 selectors 数组转换为 LogQL 格式的字符串
  // 格式: key=value,key2!=value2,key3=~"regex",key4!~"regex"
  const selectorsToSceneString = (selectors: LabelSelector[]): string => {
    const validSelectors = selectors.filter((s) => s.key && s.value && isValidKey(s.key));
    
    return validSelectors
      .map((selector) => {
        const { key, operator, value } = selector;
        
        // 对于正则表达式操作符，需要添加引号
        if (operator === '=~' || operator === '!~') {
          // 如果 value 已经包含引号，需要转义
          const escapedValue = value.replace(/"/g, '\\"');
          return `${key}${operator}"${escapedValue}"`;
        }
        
        // 对于精确匹配操作符，直接拼接
        return `${key}${operator}${value}`;
      })
      .join(',');
  };

  // 生成 SQL WHERE 子句
  const generateSQL = (selectors: LabelSelector[]): string => {
    const conditions = selectors
      .filter((s) => s.key && s.value && isValidKey(s.key))
      .map((selector) => {
        const { key, operator, value } = selector;
        // 转义 key 中的单引号（虽然理论上不应该有，但为了安全）
        const safeKey = key.replace(/'/g, "''");
        const jsonKey = `scene->>'${safeKey}'`;
        // 转义 SQL 字符串值
        const escapedValue = escapeSQLString(value);

        switch (operator) {
          case '=':
            return `${jsonKey} = '${escapedValue}'`;
          case '!=':
            return `${jsonKey} != '${escapedValue}'`;
          case '=~':
            // PostgreSQL 正则匹配操作符
            return `${jsonKey} ~ '${escapedValue}'`;
          case '!~':
            // PostgreSQL 正则不匹配操作符
            return `${jsonKey} !~ '${escapedValue}'`;
          default:
            return '';
        }
      })
      .filter((c) => c);

    if (conditions.length === 0) {
      return 'SELECT * FROM coverage_record;';
    }

    const whereClause = conditions.join(' AND ');
    return `SELECT * FROM coverage_record WHERE ${whereClause};`;
  };

  const sqlQuery = useMemo(() => generateSQL(selectors), [selectors]);

  // Mock 查询结果
  const mockQueryResults: CoverageRecord[] = [
    {
      id: 1,
      commitSha: 'a1b2c3d4e5f6',
      scene: { environment: 'production', service: 'api', version: 'v1.0.0' },
      sceneKey: 'hash1',
      coverage: {
        lines: { total: 1000, covered: 850 },
        functions: { total: 100, covered: 90 },
        branches: { total: 200, covered: 180 },
      },
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      commitSha: 'b2c3d4e5f6a7',
      scene: { environment: 'production', service: 'web', version: 'v1.1.0' },
      sceneKey: 'hash2',
      coverage: {
        lines: { total: 1200, covered: 1100 },
        functions: { total: 120, covered: 115 },
        branches: { total: 250, covered: 230 },
      },
      createdAt: '2024-01-16T14:20:00Z',
    },
    {
      id: 3,
      commitSha: 'c3d4e5f6a7b8',
      scene: { environment: 'staging', service: 'api', version: 'v2.0.0' },
      sceneKey: 'hash3',
      coverage: {
        lines: { total: 1500, covered: 1200 },
        functions: { total: 150, covered: 130 },
        branches: { total: 300, covered: 250 },
      },
      createdAt: '2024-01-17T09:15:00Z',
    },
  ];

  // 执行查询
  const handleQuery = async () => {
    // 模拟查询延迟
    await new Promise((resolve) => setTimeout(resolve, 500));
    setQueryResults(mockQueryResults);
    updateURLParams(selectors, 1, mockQueryResults, null);
    handleStepChange(1);
  };

  // 查看报告
  const handleViewReport = (record: CoverageRecord) => {
    setSelectedRecord(record);
    updateURLParams(selectors, 2, queryResults, record);
    handleStepChange(2);
  };

  const addSelector = () => {
    const newSelectors: LabelSelector[] = [
      ...selectors,
      { key: '', operator: '=' as const, value: '' },
    ];
    setSelectors(newSelectors);
    updateURLParams(newSelectors, currentStep, queryResults, selectedRecord);
  };

  const removeSelector = (index: number) => {
    const newSelectors = selectors.filter((_, i) => i !== index);
    setSelectors(newSelectors);
    updateURLParams(newSelectors, currentStep, queryResults, selectedRecord);
  };

  const updateSelector = (index: number, field: keyof LabelSelector, value: string) => {
    const updated = [...selectors];
    updated[index] = { ...updated[index], [field]: value };
    // 如果更新的是 key，清空对应的 value
    if (field === 'key') {
      updated[index].value = '';
    }
    setSelectors(updated);
    updateURLParams(updated, currentStep, queryResults, selectedRecord);
  };

  // 表格列定义
  const columns: ColumnsType<CoverageRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Commit SHA',
      dataIndex: 'commitSha',
      key: 'commitSha',
      width: 150,
      render: (sha: string) => <Text code>{sha.substring(0, 8)}</Text>,
    },
    {
      title: 'Scene',
      dataIndex: 'scene',
      key: 'scene',
      render: (scene: Record<string, string>) => (
        <Space wrap>
          {Object.entries(scene).map(([key, value]) => (
            <Tag key={key} color='blue'>
              {key}={value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '覆盖率',
      key: 'coverage',
      render: (_, record) => {
        const lineCoverage =
          ((record.coverage.lines.covered / record.coverage.lines.total) * 100).toFixed(1) + '%';
        return <Tag color='green'>{lineCoverage}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button type='link' onClick={() => handleViewReport(record)}>
          查看报告
        </Button>
      ),
    },
  ];

  // SelectorRow 组件：处理单个选择器行
  const SelectorRow = ({
    selector,
    index,
    keyOptions,
    keysLoading,
    onUpdate,
  }: {
    selector: LabelSelector;
    index: number;
    keyOptions: Array<{ label: string; value: string }>;
    keysLoading: boolean;
    onUpdate: (index: number, field: keyof LabelSelector, value: string) => void;
  }) => {
    // Mock 数据：每个 key 对应的 value 选项
    const mockValues: Record<string, string[]> = {
      environment: ['production', 'staging', 'development', 'test'],
      service: ['api', 'web', 'worker', 'scheduler', 'cron'],
      version: ['v1.0.0', 'v1.1.0', 'v2.0.0', 'v2.1.0', 'v2.2.0'],
      branch: ['main', 'develop', 'release', 'hotfix', 'feature'],
      build_target: ['production', 'staging', 'development'],
      platform: ['linux', 'windows', 'macos'],
      os: ['ubuntu', 'centos', 'debian', 'alpine'],
      arch: ['amd64', 'arm64', 'x86_64'],
      region: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
      cluster: ['cluster-1', 'cluster-2', 'cluster-3', 'cluster-prod'],
    };

    // 获取当前 key 对应的 value 选项（Mock）
    const { data: valueOptions, loading: valuesLoading } = useRequest(
      async () => {
        if (!selector.key) {
          return [];
        }
        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 200));
        const values = mockValues[selector.key] || [];
        return values.map((value) => ({ label: value, value }));
      },
      { refreshDeps: [selector.key] },
    );

    const valueOptionsList = valueOptions || [];

    return (
      <Space.Compact style={{ width: '100%' }}>
        <Select
          placeholder='选择 Key'
          value={selector.key || undefined}
          onChange={(value) => onUpdate(index, 'key', value)}
          style={{ width: '30%' }}
          loading={keysLoading}
          options={keyOptions}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        />
        <Select
          value={selector.operator}
          onChange={(value) => onUpdate(index, 'operator', value)}
          style={{ width: '15%' }}
          options={[
            { label: '=', value: '=' },
            { label: '!=', value: '!=' },
            { label: '=~', value: '=~' },
            { label: '!~', value: '!~' },
          ]}
        />
        {selector.operator === '=~' || selector.operator === '!~' ? (
          // 正则表达式操作符，使用输入框
          <Input
            placeholder='输入正则表达式'
            value={selector.value}
            onChange={(e) => onUpdate(index, 'value', e.target.value)}
            style={{ width: '55%' }}
          />
        ) : (
          // 精确匹配操作符，使用下拉框
          <Select
            placeholder={selector.key ? '选择 Value' : '请先选择 Key'}
            value={selector.value || undefined}
            onChange={(value) => onUpdate(index, 'value', value)}
            style={{ width: '55%' }}
            loading={valuesLoading}
            options={valueOptionsList}
            disabled={!selector.key}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            allowClear
            notFoundContent={
              selector.key && !valuesLoading
                ? '暂无数据'
                : valuesLoading
                  ? '加载中...'
                  : '请先选择 Key'
            }
          />
        )}
      </Space.Compact>
    );
  };

  const steps = [
    {
      title: '配置查询参数',
      description: '设置筛选条件',
    },
    {
      title: '查看查询结果',
      description: '浏览匹配的记录',
    },
    {
      title: '查看报告',
      description: '查看详细覆盖率报告',
    },
  ];

  // 渲染第一步：配置查询参数
  const renderStep1 = () => (
    <>
      <Card className='mb-4'>
        <Form form={form} layout='vertical'>
          <Form.Item label='配置查询条件'>
            <Space direction='vertical' style={{ width: '100%' }} size='middle'>
              {selectors.map((selector, index) => (
                <Card
                  key={index}
                  size='small'
                  extra={
                    selectors.length > 1 ? (
                      <Button
                        type='text'
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeSelector(index)}
                      />
                    ) : null
                  }
                >
                  <SelectorRow
                    selector={selector}
                    index={index}
                    keyOptions={keyOptions}
                    keysLoading={keysLoading}
                    onUpdate={updateSelector}
                  />
                </Card>
              ))}
              <Button
                type='dashed'
                onClick={addSelector}
                block
                icon={<PlusOutlined />}
              >
                添加条件
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button
          type='primary'
          size='large'
          onClick={handleQuery}
          disabled={selectors.every((s) => !s.key || !s.value)}
          style={{ minWidth: 120, height: 40, fontSize: 16 }}
        >
          查询
        </Button>
      </div>
    </>
  );

  // 渲染第二步：查看查询结果
  const renderStep2 = () => (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <Button onClick={() => handleStepChange(0)}>返回修改查询条件</Button>
      </div>
      <Table
        columns={columns}
        dataSource={queryResults}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );

  // 渲染第三步：查看报告
  const renderStep3 = () => {
    if (!selectedRecord) return null;

    const lineCoverage =
      ((selectedRecord.coverage.lines.covered / selectedRecord.coverage.lines.total) * 100).toFixed(
        1,
      ) + '%';
    const functionCoverage =
      ((selectedRecord.coverage.functions.covered / selectedRecord.coverage.functions.total) *
        100).toFixed(1) + '%';
    const branchCoverage =
      ((selectedRecord.coverage.branches.covered / selectedRecord.coverage.branches.total) *
        100).toFixed(1) + '%';

    // 构建跳转到覆盖率报告页面的函数
    const handleViewCoverageReport = () => {
      const provider = params.provider;
      const org = params.org;
      const repo = params.repo;
      const commitSha = selectedRecord.commitSha;

      if (!provider || !org || !repo || !commitSha) {
        console.error('Missing required parameters for navigation');
        return;
      }

      // 将 selectors 转换为 scene 字符串
      const sceneString = selectorsToSceneString(selectors);

      // 构建 URL 参数
      const urlParams = new URLSearchParams();
      if (sceneString) {
        urlParams.set('scene', sceneString);
      }

      // 跳转到覆盖率报告页面
      const reportUrl = `/${provider}/${org}/${repo}/commits/${commitSha}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      navigate(reportUrl);
    };

    return (
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button onClick={() => handleStepChange(1)}>返回列表</Button>
            {params.provider && params.org && params.repo && (
              <Button type='primary' onClick={handleViewCoverageReport}>
                查看覆盖率报告
              </Button>
            )}
          </Space>
        </div>
        <Card title='报告详情' type='inner'>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            <div>
              <Text strong>Commit SHA: </Text>
              <Text code>{selectedRecord.commitSha}</Text>
            </div>
            <div>
              <Text strong>Scene: </Text>
              <Space wrap>
                {Object.entries(selectedRecord.scene).map(([key, value]) => (
                  <Tag key={key} color='blue'>
                    {key}={value}
                  </Tag>
                ))}
              </Space>
            </div>
            <div>
              <Text strong>Scene 查询条件: </Text>
              <Text code style={{ fontSize: '12px' }}>
                {selectorsToSceneString(selectors) || '(无)'}
              </Text>
            </div>
            <div>
              <Text strong>创建时间: </Text>
              <Text>{new Date(selectedRecord.createdAt).toLocaleString('zh-CN')}</Text>
            </div>
            <Card title='覆盖率统计' type='inner'>
              <Space direction='vertical' style={{ width: '100%' }}>
                <div>
                  <Text strong>行覆盖率: </Text>
                  <Tag color='green'>{lineCoverage}</Tag>
                  <Text type='secondary' style={{ marginLeft: 8 }}>
                    ({selectedRecord.coverage.lines.covered} / {selectedRecord.coverage.lines.total})
                  </Text>
                </div>
                <div>
                  <Text strong>函数覆盖率: </Text>
                  <Tag color='blue'>{functionCoverage}</Tag>
                  <Text type='secondary' style={{ marginLeft: 8 }}>
                    ({selectedRecord.coverage.functions.covered} /{' '}
                    {selectedRecord.coverage.functions.total})
                  </Text>
                </div>
                <div>
                  <Text strong>分支覆盖率: </Text>
                  <Tag color='orange'>{branchCoverage}</Tag>
                  <Text type='secondary' style={{ marginLeft: 8 }}>
                    ({selectedRecord.coverage.branches.covered} /{' '}
                    {selectedRecord.coverage.branches.total})
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Card>
      </Card>
    );
  };

  return (
    <div className='p-3'>
      {currentStep !== 2 && (
        <Steps current={currentStep} items={steps} style={{ marginBottom: 16 }} />
      )}

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
    </div>
  );
};

export default SceneSelector;
