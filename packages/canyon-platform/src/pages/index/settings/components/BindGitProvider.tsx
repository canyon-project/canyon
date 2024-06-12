import { useRequest } from 'ahooks';
import { ConfigProvider, Table } from 'antd';
import axios from 'axios';
import { CanyonCardPrimary } from 'canyon-ui-old';
import {genOAuthUrl} from "../../../../helpers/gitprovider/genOAuthUrl.ts";
// const gitProviderList = [
//   {
//     name: 'name',
//     url: 'dddddd',
//     client: 's',
//   },
// ];
const ProviderOAuth = ({ name, type,url,clientID }) => {
  return (
    <a className={'flex flex-col items-center'} style={{ minWidth: '80px' }} href={genOAuthUrl({url, type, clientID})}>
      <img className={'w-[32px]'} src={`/gitproviders/${type}.svg`} alt='' />
      <span className={'text-center'}>{name}</span>
    </a>
  );
};
const Faa = () => {
  const { data: gitProviderList } = useRequest(() =>
    axios.get(`/api/gitprovider`).then(({ data }) => data),
  );
  return (
    <div>
      <CanyonCardPrimary>
        {/*<span>{JSON.stringify(data || {})}</span>*/}
        <Card title={'绑定提供商'} bordered={false}>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 0,
              },
            }}
          >
            <Table
              pagination={false}
              bordered={true}
              dataSource={[
                {
                  provider: 'gitlab',
                  providerName: 'GitLab',
                  providerUsername: 'zhangtao25',
                  providerAvatar: 'sss',
                  loggedIn: '2002',
                },
              ]}
              columns={[
                {
                  title: '提供商ID',
                  dataIndex: 'provider',
                  // dataIndex:'ss'
                },
                {
                  title: '提供商',
                  dataIndex: 'providerName',
                  // dataIndex:'ss'
                },
                {
                  title: '详情',
                  dataIndex: 'providerUsername',
                  // dataIndex:'ss'
                },
                {
                  title: '绑定时间',
                  dataIndex: 'loggedIn',
                  // dataIndex:'ss'
                },
                {
                  title: '操作',
                  dataIndex: 'dd',
                  // dataIndex:'ss'
                },
              ]}
            />
          </ConfigProvider>
          <div className={'h-[10px]'}></div>
          <p>你还可以绑定以下第三方帐号</p>
          <div className={'flex'}>
            {/*https://gitlab.com/oauth/authorize?client_id=0cf45ded30469aba3f014b06fb61526ca70098f2a0b22d51c5c3ee60fc18c4d8&redirect_uri=https%3A%2F%2Fgitee.com%2Fauth%2Fgitlab%2Fcallback&response_type=code&state=f25d4b0c10b6a742bde3eae8be273c7df1f54190014aed0c*/}
            {/*https://github.com/login/oauth/authorize?client_id=5a179b878a9f6ac42acd&redirect_uri=https%3A%2F%2Fgitee.com%2Fauth%2Fgithub%2Fcallback&response_type=code&scope=user&state=460a986d8070f3d30fb2a6eb0485de2bdd5c31382f915a40*/}
            {(gitProviderList || []).map(({ name, type, url,clientID }) => (
              <ProviderOAuth name={name} type={type} url={url} clientID={clientID} />
            ))}
          </div>
        </Card>
      </CanyonCardPrimary>
    </div>
  );
};

export default Faa;
