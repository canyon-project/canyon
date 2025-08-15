import Icon, { BarsOutlined, SearchOutlined } from '@ant-design/icons';
import { Divider, Input, Segmented, Space, Switch, Tooltip, Typography } from 'antd';
import type { FC } from 'react';
import { useTrans } from '../../locales';
import { ThemeEnum } from '../../types';
import PhTreeViewIcon from '../icons/PhTreeView';
import ThemeSwitch from './ThemeSwitch';

const TopControl: FC<{
  total: number;
  showMode: string;
  filenameKeywords: string;
  onChangeShowMode: (mode: string) => void;
  onChangeKeywords: (word: string) => void;
  onChangeOnlyChange: (checked: boolean) => void;
  onlyChange: boolean;
  theme?: ThemeEnum | string;
  onChangeTheme?: (theme: ThemeEnum) => void;
}> = ({
  total,
  showMode,
  onChangeShowMode,
  onChangeKeywords,
  filenameKeywords,
  onChangeOnlyChange,
  onlyChange,
  theme = ThemeEnum.Light,
  onChangeTheme,
}) => {
  const t = useTrans();
  return (
    <div>
      <div
        style={{
          display: 'flex',
          marginBottom: '10px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
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
                  label: t('components.topControl.codeTree'),
                  value: 'tree',
                  icon: <Icon component={PhTreeViewIcon} />,
                },
                {
                  label: t('components.topControl.fileList'),
                  value: 'list',
                  icon: <BarsOutlined />,
                },
              ]}
            />

            <span style={{ fontSize: '14px' }}>
              <span style={{ marginBottom: '10px' }}>
                {total} {t('components.topControl.totalFiles')}
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
              gap: '10px',
            }}
          >
            <Typography.Text type={'secondary'} style={{ fontSize: '12px' }}>
              {t('components.topControl.onlyChanged')}:{' '}
            </Typography.Text>
            <Switch checked={onlyChange} size={'small'} onChange={onChangeOnlyChange} />
            {onChangeTheme && (
              <>
                <Divider type='vertical' />
                <Tooltip title={t('toggle_theme')}>
                  <ThemeSwitch theme={theme} onChange={onChangeTheme} />
                </Tooltip>
              </>
            )}
          </div>
          <Divider type={'vertical'} />
          <Input
            placeholder={t('components.topControl.searchPlaceholder')}
            value={filenameKeywords}
            addonBefore={<SearchOutlined />}
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
      <Divider style={{ margin: '0', marginBottom: '10px' }} />
    </div>
  );
};

export default TopControl;
