import { ConfigProvider, Table } from 'antd';
import { useMemo, useState } from 'react';

interface Coverage {
  s?: Record<string, number>;
  statementMap?: Record<
    string,
    {
      start: { line: number; column: number };
      end: { line: number; column: number };
    }
  >;
}

interface RelatedStatement {
  key: string;
  Status: string;
  Location: string;
  'Changed Lines': string;
  'Hit Count': string;
}

export interface ChangedCodeCoverageTableProps {
  coverage: Coverage;
  addLines: number[];
}

const ChangedCodeCoverageTable = ({
  coverage,
  addLines,
}: ChangedCodeCoverageTableProps) => {
  console.log('coverage', coverage);
  console.log('addLines', addLines);
  const [isOpen, setIsOpen] = useState(false);

  // 计算与变更行相关的语句
  const relatedStatements = useMemo<RelatedStatement[]>(() => {
    if (
      addLines.length === 0 ||
      !coverage.s ||
      !coverage.statementMap
    ) {
      return [];
    }

    const addedLinesSet = new Set(addLines);
    const statements: RelatedStatement[] = [];

    Object.entries(coverage.statementMap).forEach(([stId, meta]: any) => {
      const startLine = meta.start.line;
      const endLine = meta.end.line;
      const startCol = meta.start.column;
      const endCol = meta.end.column;

      // 检查语句是否与变更行相交
      const relatedLines: number[] = [];
      for (let line = startLine; line <= endLine; line++) {
        if (addedLinesSet.has(line)) {
          relatedLines.push(line);
        }
      }

      if (relatedLines.length > 0) {
        const count = coverage.s[stId] || 0;
        const covered = count > 0;

        // 格式化位置
        const locationDisplay =
          endLine > startLine
            ? `${startLine}:${startCol + 1} - ${endLine}:${endCol + 1}`
            : `${startLine}:${startCol + 1}`;

        // 格式化相关行
        const relatedLinesDisplay = relatedLines.join(', ');

        statements.push({
          key: stId,
          Status: covered ? '✓ Covered' : '✗ Not Covered',
          Location: locationDisplay,
          'Changed Lines': relatedLinesDisplay,
          'Hit Count': covered ? `${count}x` : 'Not covered',
        });
      }
    });

    // 按行号排序
    statements.sort((a, b) => {
      const aLine = parseInt(a.Location.split(':')[0] || '0');
      const bLine = parseInt(b.Location.split(':')[0] || '0');
      return aLine - bLine;
    });

    return statements;
  }, [addLines, coverage]);

  // 计算覆盖率
  const coverageStats = useMemo(() => {
    if (relatedStatements.length === 0) {
      return { coveredCount: 0, totalCount: 0, coveragePercent: 0 };
    }
    const coveredCount = relatedStatements.filter((s) =>
      s.Status.includes('✓'),
    ).length;
    const totalCount = relatedStatements.length;
    const coveragePercent =
      totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
    return { coveredCount, totalCount, coveragePercent };
  }, [relatedStatements]);

  if (relatedStatements.length === 0) {
    return null;
  }

  const tableColumns = [
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      render: (text: string) => (
        <span
          style={{
            color: text.includes('✓') ? '#4caf50' : '#f44336',
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'Location',
      key: 'Location',
    },
    {
      title: 'Changed Lines',
      dataIndex: 'Changed Lines',
      key: 'Changed Lines',
    },
    {
      title: 'Hit Count',
      dataIndex: 'Hit Count',
      key: 'Hit Count',
    },
  ];

  return (
    <div className="canyon-changed-code-coverage-table">
      <button
        className="canyon-changed-code-coverage-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="canyon-changed-code-coverage-icon">📊</span>
        <span>
          Changed Code Coverage: {coverageStats.coveragePercent}% (
          {coverageStats.coveredCount}/{coverageStats.totalCount})
        </span>
        <span className="canyon-changed-code-coverage-arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      <div
        className="canyon-changed-code-coverage-content"
        style={{ maxHeight: isOpen ? '350px' : '0' }}
      >
        <div className="canyon-changed-code-coverage-table-wrapper">
          <div className="canyon-changed-code-coverage-table-title">
            Changed Code Statements ({coverageStats.totalCount}) - Coverage:{' '}
            {coverageStats.coveragePercent}% ({coverageStats.coveredCount}/
            {coverageStats.totalCount})
          </div>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 0,
              },
            }}
          >
            <Table
              dataSource={relatedStatements}
              columns={tableColumns}
              pagination={false}
              size="small"
              bordered
            />
          </ConfigProvider>
        </div>
      </div>
    </div>
  );
};

export default ChangedCodeCoverageTable;
