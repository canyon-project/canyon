import {Outlet} from "react-router-dom";
import {Tabs} from "antd";

const RepoPage = () => {
  return <div>
    <Tabs items={[
      {
        label:'Commits',
        key:'commits',
      },
      {
        label:'Coverage',
        key:'coverage',
      },
    ]}/>
    <Outlet/>
  </div>;
};

export default RepoPage;
