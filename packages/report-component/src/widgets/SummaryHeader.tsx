import { Tag, Typography, theme } from 'antd';
import type { CoverageSummaryData } from 'istanbul-lib-coverage';
import type { FC } from 'react';
import {getColor} from "../helpers/color";

const { Text } = Typography;

const { useToken } = theme;

const SummaryNav: FC<{
  reportName: string;
  value: string;
  onClick: (value: string) => void;
}> = ({ value, onClick, reportName }) => {
  const { token } = useToken();

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
      }}
    >
      {`${reportName}/${value}`.split('/').map((item, index) => {
        return (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '6px',
            }}
          >
            <a
              style={{
                color: token.colorPrimary,
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              key={index}
              onClick={() => {
                onClick(value.split('/').slice(0, index).join('/'));
              }}
            >
              {item}
            </a>
            {index === value.split('/').length || !value ? null : (
              <span>/</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SummaryMetric: FC<{
  data: CoverageSummaryData & { path: string };
  onlyChange: boolean;
}> = ({ data, onlyChange }) => {
  const t = (v) => v;
  const summaryTreeItem = {
    summary: data,
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '6px',
          maxWidth: '1000px',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(summaryTreeItem.summary)
          .sort(([key1], [key2]) => {
            const order = [
              'statements',
              'branches',
              'functions',
              'lines',
              'changestatements',
              // "changebranches",
              // "changefunctions"
            ];

            return order.indexOf(key1) - order.indexOf(key2);
          })
          .filter(([key]) =>
            (onlyChange
              ? ['statements', 'changestatements']
              : [
                  'statements',
                  'branches',
                  'functions',
                  'lines',
                  'changestatements',
                  // "changebranches",
                  // "changefunctions"
                ]
            ).includes(key),
          )
          .map(([key, value]) => {
            return (
              <div
                style={{
                  display: 'flex',
                  gap: '3px',
                  alignItems: 'center',
                }}
                key={key}
              >
                <span style={{ fontWeight: '600', fontSize: '14px' }}>
                  {value.pct}%
                </span>
                <Text style={{ fontSize: '14px' }} type={'secondary'}>
                  {t(`${key}`)}:
                </Text>
                <Tag bordered={false}>
                  {value.covered}/{value.total}
                </Tag>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const SummaryBar: FC<{ pct: number }> = ({ pct }) => {
  return (
    <div
      style={{
        height: '8px',
        width: '100%',
        marginBottom: '6px',
        backgroundColor: getColor(pct),
      }}
    />
  );
};

const SummaryHeader: FC<{
  value: string;
  onSelect: (value: string) => void;
  data: CoverageSummaryData & { path: string };
  reportName: string;
  onlyChange: boolean;
}> = ({ value, onSelect, data, reportName, onlyChange }) => {
  return (
    <div>
      <SummaryNav reportName={reportName} value={value} onClick={onSelect} />
      <SummaryMetric data={data} onlyChange={onlyChange} />
      <SummaryBar pct={data.statements.pct} />
    </div>
  );
};

export default SummaryHeader;
