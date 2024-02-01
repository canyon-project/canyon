import { useQuery } from '@apollo/client';
import { Avatar, Divider, Drawer, Table } from 'antd';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { GetProjectRecordDetailByShaDocument } from '../../helpers/backend/gen/graphql.ts';

const ProjectRecordDetailDrawer = ({ open, onClose, sha }) => {
  const pam = useParams();
  const { data,loading } = useQuery(GetProjectRecordDetailByShaDocument, {
    variables: {
      projectID: pam.id as string,
      sha: sha,
    },
  });

  const { t } = useTranslation();
  const nav = useNavigate();
  // const pam = useParams();
  const columns = [
    {
      title: 'Coverage ID',
      dataIndex: 'id',
    },
    {
      title: 'Report ID',
      dataIndex: 'reportID',
    },
    {
      title: 'Sha',
      dataIndex: 'sha',
    },
    {
      title: 'Statements',
      dataIndex: 'statements',
      render(_: any): JSX.Element {
        return <span>{_}%</span>;
      },
    },
    {
      title: 'New Lines',
      dataIndex: 'newlines',
      render(_: any): JSX.Element {
        return <span>{_}%</span>;
      },
    },
    {
      title: t('Reporter'),
      dataIndex: 'reporterUsername',
      render(_: any, t: any): any {
        return (
          <div>
            <Avatar src={t.reporterAvatar} />
            <span style={{ marginLeft: '10px', color: '#4f5162' }}>{t.reporterUsername}</span>
          </div>
        );
      },
    },
    {
      title: 'Times',
      dataIndex: 'createdAt',
      render(_: any) {
        return dayjs(_).format('MM-DD HH:mm');
      },
    },
    {
      title: 'Option',
      render(_: any) {
        return (
          <div>
            <Link
              to={{
                pathname: `/projects/${pam.id}/commits/${_.sha}`,
                search: `?report_id=${_.reportID}`,
              }}
            >
              Detail
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Drawer title={'Report Log'} placement='right' width={'85%'} onClose={onClose} open={open}>
        <Table
          pagination={{
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={loading}
          size={'small'}
          rowKey={'id'}
          columns={columns}
          dataSource={data?.getProjectRecordDetailBySha || []}
        />
      </Drawer>
    </>
  );
};

export default ProjectRecordDetailDrawer;
