import { SettingOutlined } from '@ant-design/icons';
import { Card, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import BasicLayout from '@/layouts/BasicLayout';

const LANGUAGE_KEY = 'language';
const LANGUAGES = [
  { value: 'cn', labelKey: 'settings.language.option.cn' },
  { value: 'en', labelKey: 'settings.language.option.en' },
  { value: 'ja', labelKey: 'settings.language.option.ja' },
] as const;

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const current = (localStorage.getItem(LANGUAGE_KEY) || 'cn') as string;

  const handleLanguageChange = (value: string) => {
    localStorage.setItem(LANGUAGE_KEY, value);
    i18n.changeLanguage(value);
    window.location.reload();
  };

  return (
    <BasicLayout>
      <div className="py-4">
        <Typography.Title level={4} className="mb-4 flex items-center gap-2">
          <SettingOutlined />
          {t('menus.settings')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" className="mb-4">
          {t('settings.desc')}
        </Typography.Paragraph>

        <Card title={t('settings.preference')} style={{ maxWidth: 560 }}>
          <div className="flex items-center gap-3">
            <Typography.Text>{t('common.language')}</Typography.Text>
            <Select
              value={current}
              onChange={handleLanguageChange}
              options={LANGUAGES.map(({ value, labelKey }) => ({
                value,
                label: t(labelKey),
              }))}
              style={{ width: 160 }}
            />
          </div>
        </Card>
      </div>
    </BasicLayout>
  );
};

export default SettingsPage;
