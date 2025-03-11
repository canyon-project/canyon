'use client';
import {
  Avatar,
  Button,
  Divider,
  message,
  Popover,
  Segmented,
  Select,
} from 'antd';
import {
  LogoutOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
} from '@ant-design/icons';

import languages from '../../../languages.json';
import i18n from '@/i18n.ts';
import { useMutation } from '@apollo/client';
import { UpdateUserSettingsDocument } from '@/graphql/gen/graphql.ts';
import useUserStore from '@/store/userStore.ts';

export default function UserPopover() {
  const { setUserSettings, userSettings, user } = useUserStore();

  const { username, email } = user || {
    username: 'Guest',
    email: ''
  };

  const [messageApi, contextHolder] = message.useMessage();
  const [updateUserSettings] = useMutation(UpdateUserSettingsDocument);

  const content = (
    <div className="w-[280px]">
      {contextHolder}
      {/* 用户信息 */}
      <div className="">
        <div className="text-gray-500 text-sm mb-2">{email}</div>
        <div className="flex items-center gap-3">
          <Avatar src="/placeholder.svg?height=40&width=40" size={40} />
          <div>
            <div className="font-medium">{username}</div>
          </div>
        </div>
      </div>

      <Divider style={{ margin: '6px 0' }} />

      {/* 菜单选项 */}
      <div className="">
        <Button
          type="text"
          block
          className=" !flex !items-center !justify-start"
          icon={<SettingOutlined className="text-gray-500" />}
        >
          <span className="ml-2">Settings</span>
        </Button>
        <Button
          type="text"
          block
          className=" !flex !items-center !justify-start"
          icon={<LogoutOutlined className="text-gray-500" />}
        >
          <span className="ml-2">Sign Out</span>
        </Button>
      </div>

      <Divider style={{ margin: '6px 0' }} />

      {/* 偏好设置 */}
      <div className="px-4">
        <div className="text-gray-500 mb-3">Preferences</div>

        <div className="flex justify-between items-center mb-4">
          <span>Theme</span>
          <Segmented
            size={'small'}
            shape="round"
            options={[
              { value: 'auto', icon: <img src={'/svgexport.svg'} /> },
              { value: 'light', icon: <SunOutlined /> },
              { value: 'dark', icon: <MoonOutlined /> },
            ]}
            value={userSettings?.theme}
            onChange={(value) => {
              updateUserSettings({
                variables: {
                  theme: value,
                },
              }).then(() => {
                messageApi.success('Theme changed');

                setUserSettings({
                  theme: value,
                });
              });
            }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span>Language</span>
          <Select
            size={'small'}
            value={userSettings?.language}
            onChange={(value) => {
              i18n.changeLanguage(value);

              updateUserSettings({
                variables: {
                  language: value,
                },
              }).then(() => {
                messageApi.success('Language changed');

                setUserSettings({
                  language: value,
                });
              });
            }}
            options={languages.map((item) => {
              return {
                label: item.name,
                value: item.code,
              };
            })}
            className={'w-[100px]'}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Popover content={content} placement="topLeft" trigger="hover">
        <div className="flex items-center gap-3 p-2 m-1   cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <Avatar src="/placeholder.svg?height=32&width=32" size={32} />
          <div style={{ flex: 1 }}>
            <div className="text-[14px]">{username}</div>
          </div>
          <img src="/shangxia.svg" alt="" />
        </div>
      </Popover>
    </div>
  );
}
