import { useQuery } from '@apollo/client';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GetProjectsNoDataDocument } from '../../../helpers/backend/gen/graphql.ts';
const { useToken } = theme;
const ProjectNoData: React.FC = () => {
  const { token } = useToken();
  const { t } = useTranslation();
  const { data, loading } = useQuery(GetProjectsNoDataDocument, {
    fetchPolicy: 'no-cache',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {data?.getProjectsNoData?.length && (
        <Tooltip title={t('projects.view_detail')}>
          <Button type={'link'} onClick={showModal}>
            {t('projects.no_data', { msg: data?.getProjectsNoData?.length || 0 })}
          </Button>
        </Tooltip>
      )}

      <Modal
        title={t('projects.no_data', { msg: data?.getProjectsNoData?.length || 0 })}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={'800px'}
        footer={false}
      >
        <Table
          loading={loading}
          size={'small'}
          style={{ border: `1px solid ${token.colorBorder}`, borderRadius: '4px' }}
          dataSource={data?.getProjectsNoData || []}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: t('projects.name'),
              dataIndex: 'pathWithNamespace',
              key: 'pathWithNamespace',
            },
            {
              title: 'Bu',
              dataIndex: 'bu',
            },
            {
              title: t('common.created_at'),
              dataIndex: 'createdAt',
              render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
            },
          ]}
        />
      </Modal>
    </>
  );
};

export default ProjectNoData;
