import { Divider, Input, Segmented, Space, Switch, Typography } from 'antd';
import type { FC } from 'react';

// import PhTreeViewIcon from '../icons/PhTreeView';

const TopControl: FC<{
  total: number;
  showMode: string;
  filenameKeywords: string;
  onChangeShowMode: (mode: string) => void;
  onChangeKeywords: (word: string) => void;
  onChangeOnlyChange: (checked: boolean) => void;
  onlyChange: boolean;
}> = ({
  total,
  showMode,
  onChangeShowMode,
  onChangeKeywords,
  filenameKeywords,
  onChangeOnlyChange,
  onlyChange,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          marginBottom: '6px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexDirection: 'column',
          }}
        >
          <Space>
            <Segmented
              size={'small'}
              value={showMode}
              defaultValue={showMode}
              onChange={(v) => {
                onChangeShowMode(v);
              }}
              options={[
                {
                  label: 'Code Tree',
                  value: 'tree',
                  // icon: <Icon component={PhTreeViewIcon} />,
                },
                {
                  label: 'File List',
                  value: 'list',
                  // icon: <BarsOutlined />,
                },
              ]}
            />

            <span style={{ fontSize: '14px' }}>
              <span style={{ marginBottom: '6px' }}>
                {total} {'Total Files'}
              </span>
            </span>
          </Space>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Typography.Text type={'secondary'} style={{ fontSize: '12px' }}>
              {'Only Changed'}:{' '}
            </Typography.Text>
            <Switch
              checked={onlyChange}
              size={'small'}
              onChange={onChangeOnlyChange}
            />
          </div>
          <Divider type={'vertical'} />
          <Input
            placeholder={'Enter the file path to search'}
            value={filenameKeywords}
            // addonBefore={<SearchOutlined />}
            style={{
              width: '240px',
            }}
            size={'small'}
            onChange={(val) => {
              onChangeKeywords(val.target.value);
            }}
          />
        </div>
      </div>
      <Divider style={{ margin: '0', marginBottom: '6px' }} />
    </div>
  );
};

export default TopControl;
