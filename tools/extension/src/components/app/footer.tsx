import { ArrowRightOutlined, CaretRightOutlined } from '@ant-design/icons';
import { Collapse, type CollapseProps, theme } from 'antd';
import type { CSSProperties } from 'react';

const { useToken } = theme;
const text =
  'Canyon offers a solution that involves adding a code probe during the construction of JavaScript projects and triggering the code probe upon page loading to gather code coverage data.';

const AppFooter = () => {
  const { token } = useToken();
  const panelStyle: React.CSSProperties = {
    marginBottom: 24,
    background: token.colorPrimaryBg,
    border: 'none',
  };
  const getItems: (panelStyle: CSSProperties) => CollapseProps['items'] = (panelStyle) => [
    {
      key: '1',
      label: (
        <span
          style={{
            fontWeight: 'bold',
            color: token.colorPrimary,
          }}
        >
          {'Canyon is a JavaScript code coverage solution'}
        </span>
      ),
      children: (
        <div
          style={{
            color: token.colorPrimary,
          }}
        >
          <p>{text}</p>
          <span
            onClick={() => {
              window.open('https://github.com/canyon-project/canyon');
            }}
            style={{ textAlign: 'right', display: 'block', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Learn more
            <ArrowRightOutlined style={{ marginLeft: '10px' }} />
          </span>
        </div>
      ),
      style: panelStyle,
    },
  ];

  return (
    <footer>
      <Collapse
        bordered={false}
        defaultActiveKey={[]}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined
            style={{
              color: token.colorPrimary,
            }}
            rotate={isActive ? 90 : 0}
          />
        )}
        items={getItems(panelStyle)}
      />
    </footer>
  );
};

export default AppFooter;
