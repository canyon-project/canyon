import { SearchOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { useToken } = theme;

const CanyonReportControl = ({
  numberFiles,
  onChangeOnlyChange,
  onChangeOnlyChangeKeywords,
  keywords,
  onlyChange,
  onChangeShowMode,
  showMode,
}) => {
  const { token } = useToken();
  const prm = useParams();
  const { t } = useTranslation();
  return (
    <>
      <div className={'flex mb-2 justify-between'}>
        <div className={'flex gap-2 flex-col'}>
          <Space>
            <Radio.Group
              size={'small'}
              defaultValue={showMode}
              buttonStyle='solid'
              onChange={(v) => {
                onChangeShowMode(v.target.value);
              }}
            >
              <Radio.Button value='tree'>{t('projects.detail.code.tree')}</Radio.Button>
              <Radio.Button value='list'>{t('projects.detail.file.list')}</Radio.Button>
            </Radio.Group>
            <span style={{ fontSize: '14px' }}>
              {/*<span className={'mr-2'}>{numberFiles}</span>*/}
              {t('projects.detail.total.files', { msg: numberFiles })}
              {/*覆盖率提升优先级列表*/}
            </span>
          </Space>
        </div>

        <div className={'flex items-center gap-2'}>
          <Typography.Text type={'secondary'} style={{ fontSize: '12px' }}>
            {t('projects.detail.only.changed')}:{' '}
          </Typography.Text>
          <Switch
            checked={onlyChange}
            size={'small'}
            onChange={onChangeOnlyChange}
            // checkedChildren={<HeartFilled />}
          />
          <Input
            value={keywords}
            addonBefore={<SearchOutlined />}
            placeholder={t('projects.detail.search.placeholder')}
            className={'w-[240px]'}
            size={'small'}
            onChange={onChangeOnlyChangeKeywords}
          />
        </div>
      </div>
    </>
  );
};

export default CanyonReportControl;
