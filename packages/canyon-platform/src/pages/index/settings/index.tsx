import { SettingOutlined } from '@ant-design/icons';
import { Card, message, Select, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { CanyonCardPrimary,CanyonTextTitle } from 'canyon-ui';
import copy from 'copy-to-clipboard';
import { useTranslation } from 'react-i18next';

import languages from '../../../../languages.json';
// import {CanyonTextTitle} from "canyon-ui/src";

const { Title } = Typography;
const gridStyle: any = {
  width: '100%',
};
const Settings = () => {
  const { t } = useTranslation();
  return (
    <>


      <CanyonTextTitle title={t('menus.settings')} icon={<SettingOutlined />}/>

      <CanyonCardPrimary>
        <Card title={t('settings.preference')} bordered={false}>
          <Card.Grid hoverable={false} style={gridStyle}>
            <div className={'flex'}>
              <div className={'w-1/2'}>{t('common.language')}</div>

              <div className={'w-1/2'}>
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

      {/*<Card title={'Preference'} className={'mb-8'}>*/}
      {/*  <div className={'flex mb-5'}>*/}
      {/*    <div className={'w-1/2'}>Language</div>*/}

      {/*    <div className={'w-1/2'}>*/}
      {/*      <Select*/}
      {/*        value={localStorage.getItem('language') || navigator.language}*/}
      {/*        onChange={(value) => {*/}
      {/*          localStorage.setItem('language', value);*/}
      {/*          window.location.reload();*/}
      {/*        }}*/}
      {/*        options={languages.map((item) => {*/}
      {/*          return {*/}
      {/*            label: item.name,*/}
      {/*            value: item.code,*/}
      {/*          };*/}
      {/*        })}*/}
      {/*        className={'w-[100%]'}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <Divider/>*/}
      {/*  <div className={'flex'}>*/}
      {/*    <div className={'w-1/2'}>Theme</div>*/}

      {/*    <div className={'w-1/2'}>*/}
      {/*      <Select*/}
      {/*        value={localStorage.getItem('theme') || 'light'}*/}
      {/*        onChange={(value) => {*/}
      {/*          localStorage.setItem('theme', value);*/}
      {/*          window.location.reload();*/}
      {/*        }}*/}
      {/*        options={[*/}
      {/*          {*/}
      {/*            label: 'Light',*/}
      {/*            value: 'light',*/}
      {/*          },*/}
      {/*          {*/}
      {/*            label: 'Dark',*/}
      {/*            value: 'dark',*/}
      {/*          }*/}
      {/*        ]}*/}
      {/*        className={'w-[100%]'}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</Card>*/}
      <div className={'h-5'}></div>
      <CanyonCardPrimary>
        <Card title={t('settings.user_auth_tokens')} bordered={false}>
          {/*<Alert*/}
          {/*  className={'mt-5 mb-5'}*/}
          {/*  message='Join us for office hours'*/}
          {/*  description={*/}
          {/*    <div>*/}
          {/*      New to Canyon? Having a problem? Get help during our weekly office hours!{' '}*/}
          {/*      <a href={'https://canyon.com/'} target={'_blank'} rel='noreferrer'>*/}
          {/*        Come here*/}
          {/*      </a>*/}
          {/*      .*/}
          {/*    </div>*/}
          {/*  }*/}
          {/*  type='info'*/}
          {/*  showIcon*/}
          {/*/>*/}
          <TextArea
            onClick={() => {
              copy(localStorage.getItem('token') || '');
              message.success('Copied to clipboard!');
            }}
            value={localStorage.getItem('token') || ''}
            readOnly
          />

          {/*<Alert message="Info Text" type="info" showIcon />*/}
        </Card>
      </CanyonCardPrimary>

    </>
  );
};

export default Settings;
