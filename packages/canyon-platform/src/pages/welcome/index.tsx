import { useRequest } from 'ahooks';
import { Button } from 'antd';
import axios from 'axios';

const Welcome = () => {
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
          <span className={'text-3xl font-semibold'}>CANYON</span>
        </div>
        <h1 className='font-semibold leading-10'>
          Hello，
          <br />
          Welcome to Canyon。
        </h1>
        <p className='desc text-[#9293AB] leading-6 mb-6'>
          You will be redirected to your source control management system to authenticate.
        </p>
        <a
          href={`${data?.GITLAB_URL}/oauth/authorize?response_type=code&state=STATE&scope=api&client_id=${data?.GITLAB_CLIENT_ID}&redirect_uri=${window.location.origin}/login`}
        >
          <Button size={'large'} type={'primary'} className={'w-[100%]'}>
            Continue
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
