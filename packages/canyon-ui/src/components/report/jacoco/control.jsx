import Icon from '@ant-design/icons';
import { Space } from 'antd';

import { EmojionePackage } from './icons/EmojionePackage.tsx';
import JavaClass from './icons/JavaClass.tsx';
import { VscodeIconsFolderTypeCoverage } from './icons/VscodeIconsFolderTypeCoverage.tsx';
const JacocoControl = ({ name, items, onSelect }) => {
  return (
    <div>
      <div style={{ fontSize: '16px', height: '30px' }} className={'flex items-center'}>
        <Space>
          <Icon component={VscodeIconsFolderTypeCoverage} style={{ fontSize: '18px' }} />
          <a
            style={{ textDecoration: 'underline' }}
            onClick={() => {
              onSelect('');
            }}
          >
            {name}
          </a>
        </Space>

        {items[0] && (
          <>
            <span style={{ marginLeft: '8px', marginRight: '8px' }}>&gt;</span>
            <Space className={'flex items-center gap-1'}>
              <Icon component={EmojionePackage} style={{ fontSize: '18px' }} />
              <a
                onClick={() => {
                  onSelect(items[0].path);
                }}
              >
                {items[0].name}
              </a>
            </Space>
          </>
        )}

        {items[1] && (
          <>
            <span style={{ marginLeft: '8px', marginRight: '8px' }}>&gt;</span>
            <Space className={'flex items-center gap-1'}>
              <Icon component={JavaClass} style={{ fontSize: '18px' }} />
              <a
                onClick={() => {
                  onSelect(items[1].path);
                }}
              >
                {items[1].name}
              </a>
            </Space>
          </>
        )}
      </div>
    </div>
  );
};

export default JacocoControl;
