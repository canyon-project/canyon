// import { ArrowRightOutlined, MoreOutlined } from '@ant-design/icons';
// import { Avatar, Breadcrumb, Dropdown, Menu, Tooltip } from 'antd';
// import { Outlet } from 'react-router-dom';

import {
  ArrowRightOutlined,
  FolderOutlined,
  MoreOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Menu, MenuProps, theme, Tooltip, Typography } from 'antd';
import { FC, ReactNode } from 'react';

import Footer from './footer.tsx';
import ScrollBasedLayout from './ScrollBasedLayout.tsx';
const { useToken } = theme;
const { Text, Title } = Typography;
interface CanyonLayoutBaseProps {
  title?: string;
  logo?: ReactNode;
  mainTitleRightNode?: ReactNode;
  menuSelectedKey?: string;
  onSelectMenu?: (selectInfo: { key: string }) => void;
  menuItems: MenuProps['items'];
  renderMainContent?: ReactNode;
}
const CanyonLayoutBase: FC<CanyonLayoutBaseProps> = ({
  title = 'Canyon',
  logo,
  mainTitleRightNode,
  menuSelectedKey = '',
  onSelectMenu,
  menuItems,
                                                       renderMainContent
}) => {
  const { token } = useToken();

  const meData = {
    me: {
      avatar: '',
      nickname: '张涛',
      email: 'tzhangm@trip.com',
    },
  };

  return (
    <div>
      <>
        <ScrollBasedLayout
          sideBar={
            <div
              className={'w-[260px] h-[100vh] overflow-hidden flex flex-col'}
              style={{ borderRight: `1px solid ${token.colorBorder}` }}
            >
              <div
                className={'px-3 py-[16px] mb-[8px]'}
                style={{ borderBottom: `1px solid ${token.colorBorder}` }}
              >
                <div className={'flex items-center justify-between'}>
                  <Title
                    level={4}
                    className={'cursor-pointer flex'}
                    style={{ marginBottom: 0 }}
                    onClick={() => {
                      // nav(`/`);
                    }}
                  >
                    {/*<img*/}
                    {/*  className={'w-[30px] mr-[8px]'}*/}
                    {/*  src={localStorage.getItem('theme') === 'dark' ? lightLogoSvg : logoSvg}*/}
                    {/*  alt=''*/}
                    {/*/>*/}
                    {logo}
                    <span className={'ml-[8px]'}>{title}</span>
                  </Title>

                  <div>{mainTitleRightNode}</div>
                </div>
              </div>
              <Menu
                onSelect={(selectInfo) => {
                  onSelectMenu?.(selectInfo);
                }}
                selectedKeys={[menuSelectedKey]}
                items={menuItems}
                className={'dark:bg-[#151718]'}
                style={{ flex: '1' }}
              />

              <Dropdown menu={{ items: [], onClick: () => {} }}>
                <div
                  className={
                    'h-[77px] py-[16px] px-[16px] flex items-center justify-between cursor-pointer'
                  }
                  style={{ borderTop: `1px solid ${token.colorBorder}` }}
                >
                  <Avatar src={meData?.me.avatar}></Avatar>
                  <div className={'flex flex-col'}>
                    <Text>{meData?.me.nickname}</Text>
                    <Text type={'secondary'}>{meData?.me.email || ''}</Text>
                  </div>
                  <MoreOutlined className={'dark:text-[#fff]'} />
                </div>
              </Dropdown>
            </div>
          }
          mainContent={
            <div className={'flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]'}>
              <div className={'m-auto w-[1250px] p-[24px]'}>
                {/*内容*/}
                <div className={'h-[1000px]'}>{renderMainContent}</div>
              </div>
            </div>
          }
          footer={<Footer />}
        />
      </>
    </div>
  );
};

export default CanyonLayoutBase;
