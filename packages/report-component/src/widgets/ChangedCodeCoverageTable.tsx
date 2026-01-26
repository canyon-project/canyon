import { Select } from 'antd';
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
  // 原始位置信息，用于跳转
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  // 变更行数组，用于跳转
  relatedLines: number[];
}

export interface ChangedCodeCoverageTableProps {
  coverage: Coverage;
  addLines: number[];
  onJumpToRange?: (
    startLine: number,
    startCol: number,
    endLine: number,
    endCol: number,
  ) => void;
}

// 将行号数组转换为区间格式，如 [19,20,21,22,23,24,56,57,58,59] -> "19-24, 56-59"
const formatLineRanges = (lines: number[]): string => {
  if (lines.length === 0) return '';
  if (lines.length === 1) {
    const first = lines[0];
    return first !== undefined ? first.toString() : '';
  }

  const sorted = [...lines].sort((a, b) => a - b);
  const ranges: string[] = [];
  const first = sorted[0];
  if (first === undefined) return '';

  let start: number = first;
  let end: number = first;

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    if (current === undefined) continue;
    if (current === end + 1) {
      end = current;
    } else {
      if (start === end) {
        ranges.push(start.toString());
      } else {
        ranges.push(`${start}-${end}`);
      }
      start = current;
      end = current;
    }
  }

  // 添加最后一个区间
  if (start === end) {
    ranges.push(start.toString());
  } else {
    ranges.push(`${start}-${end}`);
  }

  return ranges.join(', ');
};

const ChangedCodeCoverageTable = ({
  coverage,
  addLines,
  onJumpToRange,
}: ChangedCodeCoverageTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  // 计算与变更行相关的语句
  const relatedStatements = useMemo<RelatedStatement[]>(() => {
    if (addLines.length === 0 || !coverage.s || !coverage.statementMap) {
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
        const count = coverage.s?.[stId] || 0;
        const covered = count > 0;

        // 格式化位置为 IDEA 风格：L19 C5 或 L19 C5 - L24 C10
        const locationDisplay =
          endLine > startLine
            ? `L${startLine} C${startCol + 1} - L${endLine} C${endCol + 1}`
            : `L${startLine} C${startCol + 1}`;

        // 格式化相关行为区间格式
        const relatedLinesDisplay = formatLineRanges(relatedLines);

        statements.push({
          key: stId,
          Status: covered ? '✓ Covered' : '✗ Not Covered',
          Location: locationDisplay,
          'Changed Lines': relatedLinesDisplay,
          'Hit Count': covered ? `${count}x` : '0x',
          startLine,
          startCol: startCol + 1, // Monaco Editor 的列号从 1 开始
          endLine,
          endCol: endCol + 1,
          relatedLines,
        });
      }
    });

    // 按行号排序（从 L19 C5 格式中提取行号）
    statements.sort((a, b) => {
      const aMatch = a.Location.match(/L(\d+)/);
      const bMatch = b.Location.match(/L(\d+)/);
      const aLine = aMatch ? parseInt(aMatch[1] || '0') : 0;
      const bLine = bMatch ? parseInt(bMatch[1] || '0') : 0;
      return aLine - bLine;
    });

    return statements;
  }, [addLines, coverage]);

  // 默认只显示未覆盖的语句，但选项列表包含所有语句以便切换
  const filteredStatements = useMemo(() => {
    return relatedStatements.filter((s) => s.Status.includes('✗'));
  }, [relatedStatements]);

  // 用于下拉框的所有选项（包含已覆盖和未覆盖）
  const allStatementsForSelect = useMemo(() => {
    return relatedStatements;
  }, [relatedStatements]);

  // 按覆盖状态分组的选项
  const groupedOptions = useMemo(() => {
    const covered = relatedStatements.filter((s) => s.Status.includes('✓'));
    const notCovered = relatedStatements.filter((s) => s.Status.includes('✗'));

    const groups = [];

    if (notCovered.length > 0) {
      groups.push({
        label: (
          <span style={{ fontWeight: 500, color: '#f44336' }}>
            ✗ Not Covered ({notCovered.length})
          </span>
        ),
        title: 'Not Covered',
        options: notCovered.map((stmt) => ({
          value: stmt.key,
          label: `${stmt.Location} Lines: ${stmt['Changed Lines']} ${stmt['Hit Count']}`,
        })),
      });
    }

    if (covered.length > 0) {
      groups.push({
        label: (
          <span style={{ fontWeight: 500, color: '#4caf50' }}>
            ✓ Covered ({covered.length})
          </span>
        ),
        title: 'Covered',
        options: covered.map((stmt) => ({
          value: stmt.key,
          label: `${stmt.Location} Lines: ${stmt['Changed Lines']} ${stmt['Hit Count']}`,
        })),
      });
    }

    return groups;
  }, [relatedStatements]);

  // 计算覆盖率（基于所有语句）
  const coverageStats = useMemo(() => {
    if (relatedStatements.length === 0) {
      return {
        coveredCount: 0,
        totalCount: 0,
        coveragePercent: 0,
        notCoveredCount: 0,
      };
    }
    const coveredCount = relatedStatements.filter((s) =>
      s.Status.includes('✓'),
    ).length;
    const totalCount = relatedStatements.length;
    const notCoveredCount = filteredStatements.length;
    const coveragePercent =
      totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
    return { coveredCount, totalCount, coveragePercent, notCoveredCount };
  }, [relatedStatements, filteredStatements]);

  if (filteredStatements.length === 0) {
    return null;
  }

  // 处理选择变化
  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    const statement = allStatementsForSelect.find((s) => s.key === value);
    if (statement && onJumpToRange) {
      // 跳转到对应的代码范围
      onJumpToRange(
        statement.startLine,
        statement.startCol,
        statement.endLine,
        statement.endCol,
      );
    }
  };

  return (
    <div className='canyon-changed-code-coverage-table'>
      <button
        className='canyon-changed-code-coverage-toggle'
        onClick={() => setIsOpen(!isOpen)}
        type='button'
      >
        <span className='canyon-changed-code-coverage-icon'>📊</span>
        <span>
          Changed Code Coverage: {coverageStats.coveragePercent}% (
          {coverageStats.coveredCount}/{coverageStats.totalCount}) -{' '}
          {coverageStats.notCoveredCount} Not Covered
        </span>
        <span className='canyon-changed-code-coverage-arrow'>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      <div
        className='canyon-changed-code-coverage-content'
        style={{
          maxHeight: isOpen ? '100px' : '0',
          overflow: isOpen ? 'visible' : 'hidden',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className='canyon-changed-code-coverage-select-wrapper'>
          <Select
            value={selectedValue}
            onChange={handleSelectChange}
            placeholder='Select code location (use arrow keys)'
            style={{ width: '480px', maxWidth: '100%' }}
            size='small'
            showSearch
            optionFilterProp='label'
            tagRender={(props) => {
              const { value } = props;
              const stmt = allStatementsForSelect.find((s) => s.key === value);
              if (!stmt) return <span>{value}</span>;

              const isCovered = stmt.Status.includes('✓');
              return (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    lineHeight: '20px',
                  }}
                >
                  <span
                    style={{
                      color: isCovered ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {isCovered ? '✓' : '✗'}
                  </span>
                  <span style={{ fontFamily: 'monospace' }}>
                    {stmt.Location}
                  </span>
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    Lines: {stmt['Changed Lines']}
                  </span>
                  <span
                    style={{
                      color: isCovered ? '#4caf50' : '#f44336',
                      fontSize: '12px',
                    }}
                  >
                    {stmt['Hit Count']}
                  </span>
                </span>
              );
            }}
            filterOption={(input, option) => {
              if (!option) return false;
              // 检查是否是分组标题（通过检查是否有 options 属性）
              const optionAny = option as any;
              if (optionAny.options) {
                return true; // 分组标题始终显示
              }
              const label = option?.label?.toString() || '';
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            optionRender={(option) => {
              if (!option) return null;
              // 检查是否是分组标题（通过检查是否有 options 属性）
              const optionAny = option as any;
              if (optionAny.options) {
                return option.label; // 分组标题直接返回
              }

              const stmt = allStatementsForSelect.find(
                (s) => s.key === option.value,
              );
              if (!stmt) return option.label;

              const isCovered = stmt.Status.includes('✓');
              return (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 0',
                    fontSize: '13px',
                    lineHeight: '20px',
                  }}
                >
                  <span
                    style={{
                      color: isCovered ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                      width: '16px',
                      fontSize: '14px',
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                    title={isCovered ? 'Covered' : 'Not Covered'}
                  >
                    {isCovered ? '✓' : '✗'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      width: '180px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stmt.Location}
                  </span>
                  <span
                    style={{
                      color: '#666',
                      fontSize: '12px',
                      width: '100px',
                      flexShrink: 0,
                      textAlign: 'left',
                    }}
                  >
                    Lines: {stmt['Changed Lines']}
                  </span>
                  <span
                    style={{
                      color: isCovered ? '#4caf50' : '#f44336',
                      fontSize: '12px',
                      width: '80px',
                      flexShrink: 0,
                      textAlign: 'right',
                      fontWeight: isCovered ? '500' : 'normal',
                    }}
                  >
                    {stmt['Hit Count']}
                  </span>
                </div>
              );
            }}
            options={groupedOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ChangedCodeCoverageTable;
