import { useRequest } from 'ahooks';
import { Button } from 'antd';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Welcome = () => {
  const { t } = useTranslation();
  const { data, loading: isLoading } = useRequest(() =>
    axios.get('/api/base').then(({ data }) => data),
  );
  if (isLoading) {
    return <div>loading</div>;
  }
  return (
    <div className={'flex h-[100vh]'}>
      <div className={'p-[100px] basis-[580px]'}>
        <div className='logo flex items-center mb-[60px]'>
          <img src='/logo.svg' className={'w-[52px] mr-4'} alt='Logo SVG' />
          <span className={'text-4xl font-semibold'}>CANYON</span>
        </div>
        <h1 className='font-semibold leading-10'>
          {t('welcome.hello')}
          <br />
          {t('welcome.copywriter')}
        </h1>
        <p className='desc text-[#9293AB] leading-6 mb-6'>{t('welcome.desc')}</p>
        <a
          href={`${data?.GITLAB_URL}/oauth/authorize?response_type=code&state=STATE&scope=api&client_id=${data?.GITLAB_CLIENT_ID}&redirect_uri=${window.location.origin}/login`}
        >
          <Button size={'large'} type={'primary'} className={'w-[100%]'}>
            {t('welcome.continue')}
          </Button>
        </a>
      </div>
      <div className='flex-grow flex items-center justify-center'>
        <div
          className={'w-[100%] h-[100%] bg-[#0A3264] bg-no-repeat bg-center'}
          style={{ backgroundImage: 'url(/welcome-bg.svg)', backgroundSize: '100%' }}
        ></div>
      </div>
    </div>
  );
};

export default Welcome;
