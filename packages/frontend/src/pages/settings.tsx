import { Card, Select, Switch, Typography } from 'antd';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import BasicLayout from '@/layouts/BasicLayout';

const SettingsPage: FC = () => {
  const { t, i18n } = useTranslation();

  const onThemeChange = (checked: boolean) => {
    const next = checked ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', checked);
    // 让 ConfigProvider 生效
    window.location.reload();
  };

  const onLanguageChange = (lng: 'cn' | 'en' | 'ja') => {
    localStorage.setItem('language', lng);
    i18n.changeLanguage(lng);
    // 让 ConfigProvider locale 生效
    window.location.reload();
  };

  return (
    <BasicLayout>
      <div className='mb-4'>
        <Typography.Title level={4} style={{ marginBottom: 8 }}>
          {t('menus.settings')}
        </Typography.Title>
        <Typography.Text type='secondary'>{t('settings.desc')}</Typography.Text>
      </div>

      <Card title={t('settings.preference')} bordered>
        <div className='flex items-center gap-3 mb-4'>
          <span className='text-[12px] text-gray-500'>
            {t('common.language')}
          </span>
          <Select
            size='small'
            style={{ width: 140 }}
            defaultValue={
              (localStorage.getItem('language') || 'cn') as 'cn' | 'en' | 'ja'
            }
            options={[
              { label: '简体中文', value: 'cn' },
              { label: 'English', value: 'en' },
              { label: '日本語', value: 'ja' },
            ]}
            onChange={onLanguageChange}
          />
        </div>

        <div className='flex items-center gap-3'>
          <span className='text-[12px] text-gray-500'>{t('common.theme')}</span>
          <Switch
            checkedChildren={t('common.dark')}
            unCheckedChildren={t('common.light')}
            defaultChecked={localStorage.getItem('theme') === 'dark'}
            onChange={onThemeChange}
          />
        </div>
      </Card>
    </BasicLayout>
  );
};

export default SettingsPage;
