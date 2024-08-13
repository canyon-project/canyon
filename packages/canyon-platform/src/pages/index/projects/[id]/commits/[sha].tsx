import { useQuery } from "@apollo/client";
import { useRequest } from "ahooks";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import CanyonReport from "../../../../../components/CanyonReport";
import { GetProjectByIdDocument } from "../../../../../helpers/backend/gen/graphql.ts";
import { getCoverageSummaryMapService, handleSelectFile } from "./helper";
const { useToken } = theme;

const Sha = () => {
  const prm = useParams();
  const nav = useNavigate();
  const [sprm] = useSearchParams();
  // 在组件中
  const location = useLocation();
  const currentPathname = location.pathname;
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

  const [activatedPath, setActivatedPath] = useState(sprm.get("path") || "");
  const [mainData, setMainData] = useState<any>(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sprm.get("report_id")) {
      params.append("report_id", sprm.get("report_id") || "");
    }
    if (sprm.get("mode")) {
      params.append("mode", sprm.get("mode") || "");
    }
    params.append("path", activatedPath);

    // 将参数拼接到路径中
    const pathWithParams = `${currentPathname}?${params.toString()}${location.hash}`;

    nav(pathWithParams);

    if (activatedPath.includes(".")) {
      handleSelectFile({
        filepath: activatedPath,
        reportID: sprm.get("report_id") || "",
        sha: prm.sha || "",
        projectID: prm.id || "",
        mode: sprm.get("mode") || "",
      }).then((r) => {
        if (r.fileCoverage) {
          // console.log(r)
          setMainData(r);
        } else {
          setMainData(false);
        }
      });
    } else {
      // console.log('设么也不做');
      setMainData(false);
    }
  }, [activatedPath]);

  return (
    <>
      <div
        className="p-2 rounded-md bg-white dark:bg-[#151718] flex "
        style={{
          boxShadow: `${token.boxShadowTertiary}`,
          display: "none",
        }}
      >
        <div>
          <div>Ant Design Title 1</div>
          <div>
            sign, a design language for background applications, is refined by
          </div>
        </div>
        <Divider type={"vertical"} style={{ height: "60px" }} />
        <div>
          <div>Ant Design Title 1</div>
          <div>
            sign, a design language for background applications, is refined by
          </div>
        </div>
        <Divider type={"vertical"} style={{ height: "60px" }} />
        <div>
          <div>Ant Design Title 1</div>
          <div>
            sign, a design language for background applications, is refined by
          </div>
        </div>
      </div>
      <div className={"h-[10px]"}></div>
      <div
        className="p-2 rounded-md bg-white dark:bg-[#151718]"
        style={{
          // border: `1px solid ${token.colorBorder}`,
          boxShadow: `${token.boxShadowTertiary}`,
        }}
      >
        <>
          {getProjectByIdDocumentData?.getProjectByID.language ===
            "JavaScript" && (
            <CanyonReport
              theme={localStorage.getItem("theme") || "light"}
              mainData={mainData}
              pathWithNamespace={pathWithNamespace}
              activatedPath={activatedPath}
              coverageSummaryMapData={coverageSummaryMapData || []}
              loading={loading}
              onSelect={(v: any) => {
                setActivatedPath(v.path);
              }}
            />
          )}
        </>
      </div>
    </>
  );
};

export default Sha;
