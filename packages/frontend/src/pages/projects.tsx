import { useTranslation } from 'react-i18next';
import BasicLayout from '@/layouts/BasicLayout.tsx';

const ProjectPage = () => {
  const { t } = useTranslation();
  return <BasicLayout>{t('menus.projects')}</BasicLayout>;
};

export default ProjectPage;
