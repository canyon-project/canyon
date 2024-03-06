// import { ArrowRightOutlined, MoreOutlined } from '@ant-design/icons';
// import { Avatar, Breadcrumb, Dropdown, Menu, Tooltip } from 'antd';
// import { Outlet } from 'react-router-dom';

import {
  ArrowRightOutlined,
  FolderOutlined,
  MoreOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  MenuProps,
  Select,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import { FC, ReactNode } from 'react';

import { CanyonCardPrimary } from '../card';
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
  onClickGlobalSearch?: () => void;
  MeData:any
  itemsDropdown:any
}
const CanyonLayoutBase: FC<CanyonLayoutBaseProps> = ({
  title = 'Canyon',
  logo,
  mainTitleRightNode,
  menuSelectedKey = '',
  onSelectMenu,
  menuItems,
  renderMainContent,
  onClickGlobalSearch,
                                                       MeData,
                                                       itemsDropdown
}) => {
  const { token } = useToken();

  // const meData = {
  //   me: {
  //     avatar: '',
  //     nickname: '张涛',
  //     email: 'tzhangm@trip.com',
  //   },
  // };

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
                // style={{ borderBottom: `1px solid ${token.colorBorder}` }}
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

              <div className={'px-2'}>
                <CanyonCardPrimary>
                  <Button
                    type='text'
                    className={'w-full'}
                    onClick={() => {
                      onClickGlobalSearch?.();
                    }}
                  >
                    <div className={'flex justify-between'}>
                      <SearchOutlined />
                      <Text>Search</Text>

                      <div className={'inline-block'}>
                        <kbd className='px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'>
                          ⌘
                        </kbd>
                        <kbd className='px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'>
                          K
                        </kbd>
                      </div>
                    </div>
                  </Button>
                </CanyonCardPrimary>
              </div>

              <div className={'px-2 flex flex-col mb-3'}>
                <Text type={'secondary'} style={{ fontSize: '10px' }}>
                  Account
                </Text>
                <CanyonCardPrimary>
                  <Select
                    variant={'borderless'}
                    // size={'large'}
                    defaultValue='lucy'
                    // className={'mx-1'}
                    style={{ width: '100%' }}
                    // onChange={handleChange}
                    options={[
                      {
                        label: 'Personal account',
                        options: [
                          { label: 'Jack', value: 'jack' },
                          { label: 'Lucy', value: 'lucy' },
                        ],
                      },
                      {
                        label: 'Organizations',
                        options: [{ label: 'yiminghe', value: 'Yiminghe' }],
                      },
                    ]}
                  />
                </CanyonCardPrimary>
              </div>

              <div
                style={{
                  borderBottom: '1px solid #dfe3e6',
                }}
              />

              <Menu
                onSelect={(selectInfo) => {
                  onSelectMenu?.(selectInfo);
                }}
                selectedKeys={[menuSelectedKey]}
                items={menuItems}
                className={'dark:bg-[#151718] px-1'}
                style={{ flex: '1' }}
              />

              <Dropdown
                menu={{
                  items: itemsDropdown,
                  onClick: () => {},
                }}
              >
                <div
                  className={
                    'h-[77px] py-[16px] px-[16px] flex items-center justify-between cursor-pointer'
                  }
                  style={{ borderTop: `1px solid ${token.colorBorder}` }}
                >
                  <Avatar src={MeData?.me.avatar}></Avatar>
                  <div className={'flex flex-col'}>
                    <Text>{MeData?.me.nickname}</Text>
                    <Text type={'secondary'}>{MeData?.me.email || ''}</Text>
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
