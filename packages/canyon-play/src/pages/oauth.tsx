import { CanyonPageOauth } from 'canyon-ui';
import { useSearchParams } from 'react-router-dom';

const Oauth = () => {
  const [URLSearchParams] = useSearchParams();
  return (
    <div>
      <CanyonPageOauth
        URLSearchParams={URLSearchParams}
        onSHibai={() => {
          console.log('失败');
        }}
      />
    </div>
  );
};

export default Oauth;
