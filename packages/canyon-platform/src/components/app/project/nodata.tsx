import { useQuery } from '@apollo/client';
import { Button, Modal, Table, Tooltip } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { GetProjectsNoDataDocument } from '../../../helpers/backend/gen/graphql.ts';

const ProjectNoData: React.FC = () => {
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
        <Tooltip title={'View Details'}>
          <Button type={'link'} onClick={showModal}>
            {`${data?.getProjectsNoData?.length || 0} projects no data`}
          </Button>
        </Tooltip>
      )}

      <Modal
        title={`${data?.getProjectsNoData?.length} projects no data`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={'800px'}
        footer={false}
      >
        <Table
          loading={loading}
          size={'small'}
          style={{ border: '1px solid #f0f0f0', background: 'white', borderRadius: '4px' }}
          dataSource={data?.getProjectsNoData || []}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: t('projects.table.name'),
              dataIndex: 'pathWithNamespace',
              key: 'pathWithNamespace',
            },
            {
              title: 'Bu',
              dataIndex: 'bu',
            },
            {
              title: 'Created At',
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
