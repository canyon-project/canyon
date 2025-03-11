import { SettingOutlined } from '@ant-design/icons';
import { Card, Select, theme } from 'antd';
import { CSSProperties, FC } from 'react';
import languages from '../../../languages.json';
import { useTranslation } from 'react-i18next';

const gridStyle: CSSProperties = {
  width: '100%',
};

const { useToken } = theme;
const CanyonCardPrimary: FC<{
  theme?: any;
  language?: any;
  children: any;
}> = ({ theme, language, children }) => {
  const { token } = useToken();
  return (
    <div
      className={'rounded-[8px] overflow-hidden'}
      style={{
        border: `1px solid ${token.colorBorder}`,
        boxShadow: `${token.boxShadowTertiary}`,
      }}
    >
      {children}
    </div>
  );
};

const SettingsPage = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className={'font-semibold text-2xl pt-8 pb-6 gap-3 flex'}>
        <SettingOutlined />
        Settings
      </h1>

      <CanyonCardPrimary>
        <Card title={t('settings.preference')} variant={'borderless'}>
          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={'flex'}>
              <div className={'w-1/2 flex items-center'}>
                {t('common.language')}
              </div>

              <div className={'w-1/2 flex items-center'}>
                <Select
                  value={localStorage.getItem('language') || 'cn'}
                  onChange={(value) => {
                    localStorage.setItem('language', value);
                    window.location.reload();
                  }}
                  options={languages.map((item) => {
                    return {
                      label: item.name,
                      value: item.code,
                    };
                  })}
                  className={'w-[100%]'}
                />
              </div>
            </div>
          </Card.Grid>

          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={'flex'}>
              <div className={'w-1/2'}>{t('common.theme')}</div>

              <div className={'w-1/2'}>
                <Select
                  value={localStorage.getItem('theme') || 'light'}
                  onChange={(value) => {
                    localStorage.setItem('theme', value);
                    window.location.reload();
                  }}
                  options={[
                    {
                      label: t('common.light'),
                      value: 'light',
                    },
                    {
                      label: t('common.dark'),
                      value: 'dark',
                    },
                  ]}
                  className={'w-[100%]'}
                />
              </div>
            </div>
          </Card.Grid>
        </Card>
      </CanyonCardPrimary>
    </div>
  );
};

export default SettingsPage;
