import Icon, {
  ArrowRightOutlined,
  CreditCardOutlined,
  FolderOutlined,
  LineChartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useRequest } from 'ahooks';
import axios from 'axios';
import { CanyonLayoutBase, CanyonModalGlobalSearch } from 'canyon-ui';
import { useTranslation } from 'react-i18next';

import book from '../assets/book.svg';
import UilUsersAlt from '../assets/users-icon.tsx';
import { MeDocument } from '../helpers/backend/gen/graphql.ts';
import { genBreadcrumbItems } from '../layouts/genBreadcrumbItems.tsx';

function Index() {
  const { t } = useTranslation();
  useEffect(() => {
    if (localStorage.getItem('token') === null) {
      localStorage.clear();
      localStorage.setItem('callback', window.location.href);
      nav('/login');
    }
  }, []);

  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    if (loc.pathname === '/') {
      nav('/projects');
    }

    try {
      // @ts-ignore
      if (meData?.me.username && meData?.me.username !== 'tzhangm') {
        // @ts-ignore
        fetch(window.__canyon__.dsn, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            // @ts-ignore
            coverage: window.__coverage__,
            // @ts-ignore
            commitSha: window.__canyon__.commitSha,
            // @ts-ignore
            projectID: window.__canyon__.projectID,
            // @ts-ignore
            instrumentCwd: window.__canyon__.instrumentCwd,
            // @ts-ignore
            reportID: `${meData?.me.username}|${loc.pathname}`,
            // @ts-ignore
            branch: window.__canyon__.branch,
          }),
        });
      }
    } catch (e) {
      // console.log(e);
    }
  }, [loc.pathname]);

  useEffect(() => {
    setMenuSelectedKey(loc.pathname.replace('/', ''));
  }, [loc.pathname]);
  const { data: meData } = useQuery(MeDocument);
  const { data: baseData } = useRequest(() => axios.get('/api/base').then(({ data }) => data), {
    onSuccess(data) {
      window.GITLAB_URL = data.GITLAB_URL;
    },
  });
  const [menuSelectedKey, setMenuSelectedKey] = useState<string>('projects');
  window.canyonModalGlobalSearchRef = useRef(null);
  return (
    <>
      <CanyonLayoutBase
        breadcrumb={
          <div>
            {/*榜单mark*/}
            <Breadcrumb className={'py-3'} items={genBreadcrumbItems(loc.pathname)} />
          </div>
        }
        itemsDropdown={[
          {
            label: (
              <div className={'text-red-500'}>
                <LogoutOutlined className={'mr-2'} />
                Logout
              </div>
            ),
            onClick: () => {
              localStorage.clear();
              window.location.href = '/login';
            },
          },
        ]}
        MeData={meData}
        onClickGlobalSearch={() => {
          window.canyonModalGlobalSearchRef.current.report();
        }}
        title={'Canyon'}
        logo={
          <div>
            <img src='/logo.svg' alt='' className={'w-[28px]'} />
          </div>
        }
        mainTitleRightNode={
          <div>
            <Tooltip
              title={
                <div>
                  <span>{t('menus.docs')}</span>
                  <ArrowRightOutlined />
                </div>
              }
            >
              <a
                href={baseData?.SYSTEM_QUESTION_LINK}
                target={'_blank'}
                rel='noreferrer'
                className={'ml-2'}
              >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <img src={book} />
              </a>
            </Tooltip>
            {/*marker position*/}
          </div>
        }
        menuSelectedKey={menuSelectedKey}
        onSelectMenu={(selectInfo) => {
          setMenuSelectedKey(selectInfo.key);
          nav(`/${selectInfo.key}`);
        }}
        menuItems={[
          {
            label: t('menus.projects'),
            key: 'projects',
            icon: <FolderOutlined />,
          },
          {
            label: t('menus.settings'),
            key: 'settings',
            icon: <SettingOutlined />,
          },
        ].concat(
          meData?.me.username === 'tzhangm123'
            ? [
                {
                  label: t('menus.usage'),
                  key: 'usage',
                  icon: <LineChartOutlined />,
                },
                {
                  label: t('menus.billing'),
                  key: 'billing',
                  icon: <CreditCardOutlined />,
                },
                {
                  label: t('menus.members'),
                  key: 'members',
                  icon: <Icon component={UilUsersAlt} style={{ fontSize: '15px' }} />,
                },
              ]
            : [],
        )}
        renderMainContent={<Outlet />}
        search={false}
        account={false}
      />
      <CanyonModalGlobalSearch ref={canyonModalGlobalSearchRef} />
    </>
  );
}

export default Index;
