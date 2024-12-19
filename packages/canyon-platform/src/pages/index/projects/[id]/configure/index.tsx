import Icon, { AppstoreOutlined, ExperimentOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Editor } from "@monaco-editor/react";
import { FormRegion, TextTypography } from "../../../../../components/ui";

import {
    GetProjectByIdDocument,
    UpdateProjectDocument,
} from "../../../../../helpers/backend/gen/graphql.ts";
import BasicForms from "./helper/BasicForms.tsx";
import { SolarUserIdLinear } from "./helper/icons/SolarUserIdLinear.tsx";
import MemberTable from "./helper/MemberTable.tsx";
import TagTable from "./helper/TagTable.tsx";
const gridStyle: any = {
    width: "100%",
};
const { Text } = Typography;
const { useToken } = theme;
const ProjectConfigure = () => {
    const prm: any = useParams();
    const { token } = useToken();
    const { t } = useTranslation();
    const { data: GetProjectByIdDocumentData } = useQuery(
        GetProjectByIdDocument,
        {
            variables: {
                projectID: prm.id,
            },
            fetchPolicy: "no-cache",
        },
    );
    const [updateProject] = useMutation(UpdateProjectDocument);
    const showMessage = () => {
        message.success("保存成功");
    };
    const [coverage, setCoverage] = useState<string>("");

    const [defaultBranch, setDefaultBranch] = useState<string>("");

    const basicFormsRef = useRef<any>(null);
    return (
        <div>
            <TextTypography
                title={t("projects.config.title")}
                icon={<AppstoreOutlined />}
            />
            <FormRegion
                title={t("projects.config.basic.information")}
                icon={<Icon component={SolarUserIdLinear} />}
                onSave={() => {
                    basicFormsRef.current?.submit();
                }}
            >
                <BasicForms
                    ref={basicFormsRef}
                    data={GetProjectByIdDocumentData?.getProjectByID}
                />
            </FormRegion>
            <div className={"h-5"}></div>
            <Card
                title={
                    <div className={"flex items-center"}>
                        <ExperimentOutlined
                            className={"text-[#687076] mr-2 text-[16px]"}
                        />
                        <span>{t("projects.config.coverage")}</span>
                    </div>
                }
            >
                <Card.Grid hoverable={false} style={gridStyle}>
                    <div className={"mb-5"}>
                        <div className={"mb-2"}>
                            <div>{t("projects.default.branch")}</div>
                            <Text className={"text-xs"} type={"secondary"}>
                                {t("projects.config.default.branch.desc")}
                            </Text>
                        </div>
                        {GetProjectByIdDocumentData && (
                            <Select
                                defaultValue={
                                    GetProjectByIdDocumentData?.getProjectByID
                                        .defaultBranch
                                }
                                placeholder={"请选择默认分支"}
                                className={"w-[240px]"}
                                showSearch={true}
                                options={(
                                    GetProjectByIdDocumentData?.getProjectByID
                                        .branchOptions || []
                                ).map((item) => ({
                                    label: item,
                                    value: item,
                                }))}
                                onSelect={(value) => {
                                    setDefaultBranch(value as string);
                                }}
                            />
                        )}
                    </div>

                    <div className={"mb-5"}>
                        <div className={"mb-2"}>
                            <div>{t("projects.config.detection.range")}</div>
                            <Text className={"text-xs"} type={"secondary"}>
                                {t("projects.config.tooltips")}
                                <a
                                    href="https://github.com/isaacs/minimatch"
                                    target={"_blank"}
                                    rel="noreferrer"
                                >
                                    {t("projects.config.minimatch")}
                                </a>
                                <a
                                    href="https://github.com/canyon-project/canyon/tree/main/examples/config/coverage.json"
                                    target={"_blank"}
                                    rel="noreferrer"
                                >
                                    {t("projects.config.view.example")}
                                </a>
                                <span className={"ml-2"}>
                                    {t("projects.config.example2")}
                                </span>
                            </Text>
                        </div>
                        <div
                            style={{ border: "1px solid " + token.colorBorder }}
                        >
                            {GetProjectByIdDocumentData?.getProjectByID && (
                                <Editor
                                    theme={
                                        {
                                            light: "light",
                                            dark: "vs-dark",
                                        }[
                                            localStorage.getItem("theme") ||
                                                "light"
                                        ]
                                    }
                                    defaultValue={
                                        GetProjectByIdDocumentData
                                            ?.getProjectByID.coverage
                                    }
                                    onChange={(value) => {
                                        setCoverage(value || "");
                                    }}
                                    height={"240px"}
                                    language={"json"}
                                    options={{
                                        minimap: {
                                            enabled: false,
                                        },
                                        fontSize: 12,
                                        wordWrap: "wordWrapColumn",
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <Button
                        type={"primary"}
                        onClick={() => {
                            try {
                                // coverage用户输入了才检测
                                if (coverage !== "") {
                                    JSON.parse(coverage);
                                }

                                updateProject({
                                    variables: {
                                        projectID: prm.id,
                                        coverage:
                                            coverage ||
                                            GetProjectByIdDocumentData
                                                ?.getProjectByID.coverage ||
                                            "",
                                        description: "__null__",
                                        defaultBranch:
                                            defaultBranch ||
                                            GetProjectByIdDocumentData
                                                ?.getProjectByID
                                                .defaultBranch ||
                                            "-",
                                    },
                                }).then(() => {
                                    showMessage();
                                });
                            } catch (e) {
                                message.error("Invalid JSON");
                            }
                        }}
                    >
                        {t("projects.config.save.changes")}
                    </Button>
                </Card.Grid>
            </Card>
            <div className={"h-5"}></div>
            <MemberTable
                members={GetProjectByIdDocumentData?.getProjectByID.members}
            />
            <div className={"h-5"}></div>
            <TagTable tags={GetProjectByIdDocumentData?.getProjectByID.tags} />
            <div className={"h-5"}></div>
        </div>
    );
};

export default ProjectConfigure;
