import CanyonReport from "canyon-report";
import {useRequest} from "ahooks";
import axios from "axios";
import { useEffect, useState } from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {handleSelectFile} from "../../../../../helper.ts";
import {Spin} from "antd";
const App123 = () => {
  const prm = useParams();
  const nav = useNavigate();
  const [sprm] = useSearchParams();
  const {data} = useRequest(() => {
   return  axios.get(`/api/coverage/summary/map`,{
      params: {
        projectID: prm.id as string,
        reportID: sprm.get("report_id"),
        sha: prm.sha,
      }
   }).then(res=>res.data)
  });


  const {data:projectData} = useRequest(() => {
    return  axios.get(`/api/project/${prm.id}`,{
      params: {
        // projectID: prm.id as string,
      }
    }).then(res=>res.data)
  });

  const [activatedPath, setActivatedPath] = useState(
    prm["*"].slice(2, prm["*"].length) || "",
  );


  const onSelect = (val) => {
    setActivatedPath(val);
    if (!val.includes(".")) {
      return Promise.resolve({
        fileContent: "",
        fileCoverage: {},
      });
    }
    return handleSelectFile({
      filepath: val,
      reportID: sprm.get("report_id"),
      sha: prm.sha || "",
      projectID: prm.id || "",
    }).then((res) => {
      return {
        fileContent: res.fileContent,
        fileCoverage: res.fileCoverage,
        fileCodeChange: res.fileCodeChange,
      };
    });
  }

  // 导航
  useEffect(() => {
    const params = new URLSearchParams();
    if (sprm.get("report_id")) {
      params.append("report_id", sprm.get("report_id") || "");
    }
    if (sprm.get("mode")) {
      params.append("mode", sprm.get("mode") || "");
    }
    // params.append("path", activatedPath);

    // 将参数拼接到路径中
    const pathWithParams = `/projects/${prm.id}/commits/${prm.sha}/-/${activatedPath}?${params.toString()}${location.hash}`;

    nav(pathWithParams);
  }, [activatedPath]);


  return (
    <Spin spinning={!(projectData&&data)}>
      <CanyonReport name={projectData?.path} value={activatedPath} dataSource={data} onSelect={onSelect} />
    </Spin>
  );
};

export default App123;
