import { useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import CanyonReport from "canyon-report";
import { GetProjectByIdDocument } from "@/helpers/backend/gen/graphql.ts";
import { getCoverageSummaryMapService, handleSelectFile } from "../helper";
const { useToken } = theme;

const Sha = () => {
  const prm = useParams();
  const nav = useNavigate();
  const [sprm] = useSearchParams();
  const location = useLocation();
  const { data: getProjectByIdDocumentData } = useQuery(
    GetProjectByIdDocument,
    {
      variables: {
        projectID: prm["id"] as string,
      },
    },
  );
  const pathWithNamespace =
    getProjectByIdDocumentData?.getProjectByID.pathWithNamespace.split("/")[1];
  const { token } = useToken();

  const { data: coverageSummaryMapData, loading } = useRequest(
    () =>
      getCoverageSummaryMapService({
        projectID: prm.id as string,
        reportID: sprm.get("report_id"),
        sha: prm.sha,
      }),
    {
      onSuccess() {},
    },
  );

  const [activatedPath, setActivatedPath] = useState(
    prm["*"].slice(2, prm["*"].length) || "",
  );
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
    const pathWithParams = `/${location.pathname.split("/")[1]}/${prm.id}/commits/${prm.sha}/-/${activatedPath}?${params.toString()}${location.hash}`;

    nav(pathWithParams);
  }, [activatedPath]);

  return (
    <>
      <div
        className="p-2 rounded-md bg-white dark:bg-[#151718]"
        style={{
          boxShadow: `${token.boxShadowTertiary}`,
        }}
      >
        <CanyonReport
          value={activatedPath}
          name={pathWithNamespace}
          dataSource={coverageSummaryMapData}
          onSelect={(val: string) => {
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
          }}
          defaultOnlyShowChanged={Boolean(sprm.get("mode"))}
        />
      </div>
    </>
  );
};

export default Sha;
