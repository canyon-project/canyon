import { useNavigate } from 'react-router-dom';
function matchPattern(str) {
  return /^\/projects\/\d+(?!(\/\d+))$/.test(str);
}

export function genBreadcrumbItems(pathname:string) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const nav = useNavigate();
  if (matchPattern(pathname)) {
    return [
      {
        title: <span className={'cursor-pointer'}>Projects</span>,
        onClick() {
          nav('/projects');
        },
      },
      {
        title: 'Overview',
      },
    ];
  } else if (pathname.includes('commits')) {
    return [
      {
        title: <span className={'cursor-pointer'}>Projects</span>,
        onClick() {
          nav('/projects');
        },
      },
      {
        title: <span className={'cursor-pointer'}>Overview</span>,
        onClick() {
          const regex = /\/projects\/(\d+)\//;
          const match = pathname.match(regex);
          if (match) {
            const projectId = match[1];
            nav(`/projects/${projectId}`);
          } else {
            console.log('未找到匹配的项目ID');
          }
        },
      },
      {
        title: 'Coverage Details',
      },
    ];
  } else {
    return [];
  }
}
