window["pages/index/projects/[id]/index.tsx"] = {
  "content": "import Icon, {\n  AimOutlined,\n  BranchesOutlined,\n  EditOutlined,\n  QuestionCircleOutlined,\n} from \"@ant-design/icons\";\nimport { useMutation, useQuery } from \"@apollo/client\";\nimport { TourProps } from \"antd\";\nimport { ColumnsType } from \"antd/es/table\";\nimport dayjs from \"dayjs\";\nimport ReactECharts from \"echarts-for-react\";\nimport { useEffect, useRef, useState } from \"react\";\nimport { useTranslation } from \"react-i18next\";\nimport { Link, useNavigate, useParams } from \"react-router-dom\";\n\nimport ProjectRecordDetailDrawer from \"../../../../components/app/ProjectRecordDetailDrawer.tsx\";\nimport MaterialSymbolsCommitSharp from \"../../../../components/icons/MaterialSymbolsCommitSharp.tsx\";\nimport {\n  DeleteProjectRecordDocument,\n  GetProjectByIdDocument,\n  GetProjectChartDataDocument,\n  GetProjectCompartmentDataDocument,\n  GetProjectRecordsDocument,\n  ProjectRecordsModel,\n} from \"../../../../helpers/backend/gen/graphql.ts\";\n\nconst { useToken } = theme;\nconst { Title, Text } = Typography;\n// const content = ()=>{\n//   return <div>\n//     nihao\n//   </div>\n// }\nconst ProjectOverviewPage = () => {\n  const { token } = useToken();\n  const { t } = useTranslation();\n  const [keyword, setKeyword] = useState(\"\");\n  const [current, setCurrent] = useState(1);\n  const [pageSize, setPageSize] = useState(10);\n  const [open, setOpen] = useState(false);\n  const [sha, setSha] = useState(\"\");\n  const initDefaultBranchOnly = Boolean(\n    localStorage.getItem(\"defaultBranchOnly\"),\n  );\n  const [defaultBranchOnly, setDefaultBranchOnly] = useState(\n    initDefaultBranchOnly,\n  );\n  const onClose = () => {\n    setOpen(false);\n  };\n\n  const pam = useParams();\n\n  const { data: projectsData, loading } = useQuery(GetProjectRecordsDocument, {\n    variables: {\n      projectID: pam.id as string,\n      current: current,\n      pageSize: pageSize,\n      keyword: keyword,\n      onlyDefault: defaultBranchOnly,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n\n  const { data: projectByIdData } = useQuery(GetProjectByIdDocument, {\n    variables: {\n      projectID: pam.id as string,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n\n  const { data: projectChartData, loading: projectChartDataLoading } = useQuery(\n    GetProjectChartDataDocument,\n    {\n      variables: {\n        projectID: pam.id as string,\n        branch: \"-\",\n      },\n      fetchPolicy: \"no-cache\",\n    },\n  );\n\n  const {\n    data: projectCompartmentDataData,\n    loading: projectCompartmentDataLoading,\n  } = useQuery(GetProjectCompartmentDataDocument, {\n    variables: {\n      projectID: pam.id as string,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n  const [deleteProjectRecord] = useMutation(DeleteProjectRecordDocument);\n  const ref1 = useRef(null);\n  const ref2 = useRef(null);\n  const [tourOpen, setTourOpen] = useState(false);\n  const steps: TourProps[\"steps\"] = [\n    {\n      title: t(\"projects.statements_tour_title\"),\n      description: t(\"projects.statements_tour_description\"),\n      target: () => ref1.current,\n    },\n    {\n      title: t(\"projects.newlines_tour_title\"),\n      description: t(\"projects.newlines_tour_description\"),\n      target: () => ref2.current,\n    },\n  ];\n\n  useEffect(() => {\n    if (!localStorage.getItem(\"touropen\")) {\n      setTimeout(() => {\n        setTourOpen(true);\n        localStorage.setItem(\"touropen\", \"true\");\n      }, 2000);\n    }\n  }, []);\n\n  const columns: ColumnsType<ProjectRecordsModel> = [\n    {\n      title: (\n        <div>\n          <Icon component={MaterialSymbolsCommitSharp} className={\"mr-1\"} />\n          Sha\n        </div>\n      ),\n      dataIndex: \"sha\",\n      width: \"100px\",\n      render(_, { webUrl }): JSX.Element {\n        return (\n          <a href={webUrl} target={\"_blank\"} rel=\"noreferrer\">\n            {_?.slice(0, 7)}\n          </a>\n        );\n      },\n    },\n    {\n      title: (\n        <>\n          <BranchesOutlined className={\"mr-1\"} />\n          {t(\"projects.branch\")}\n        </>\n      ),\n      dataIndex: \"branch\",\n      ellipsis: true,\n      width: \"120px\",\n    },\n    {\n      title: (\n        <>\n          <AimOutlined className={\"mr-1\"} />\n          {t(\"projects.compare_target\")}\n        </>\n      ),\n      dataIndex: \"compareTarget\",\n      width: \"120px\",\n      render(_, { compareUrl }): JSX.Element {\n        return (\n          <a href={compareUrl} target={\"_blank\"} rel=\"noreferrer\">\n            {_.length === 40 ? _.slice(0, 7) : _}\n          </a>\n        );\n      },\n    },\n    {\n      title: <>{t(\"Build\")}</>,\n      align: \"center\",\n      width: \"70px\",\n      render(_, record) {\n        return (\n          <>\n            {record.buildID !== \"-\" ? (\n              <a href={record.buildURL} target={\"_blank\"} rel=\"noreferrer\">\n                <img\n                  className={\"w-[16px]\"}\n                  src={`/gitproviders/${record.buildProvider === \"-\" ? \"gitlab\" : record.buildProvider}.svg`}\n                  alt=\"\"\n                />\n              </a>\n            ) : (\n              <span>-</span>\n            )}\n          </>\n        );\n      },\n    },\n    {\n      title: t(\"projects.message\"),\n      dataIndex: \"message\",\n      width: \"160px\",\n      ellipsis: true,\n    },\n    {\n      title: (\n        <div ref={ref1}>\n          <Tooltip title={t(\"projects.statements_tooltip\")} className={\"mr-2\"}>\n            <QuestionCircleOutlined />\n          </Tooltip>\n          {t(\"projects.statements\")}\n        </div>\n      ),\n      dataIndex: \"statements\",\n      // width: '148px',\n      render(_, { sha }) {\n        return (\n          <Link\n            to={{\n              pathname: `/projects/${pam.id}/commits/${sha}`,\n            }}\n          >\n            {_}%\n          </Link>\n        );\n      },\n      // width: '150px',\n      // render(_, { sha }) {\n      //   return (\n      //     <div className={'flex'}>\n      //       <Link\n      //         // style={{border:'1px solid #000'}}\n      //         className={'block w-[60px]'}\n      //         to={{\n      //           pathname: `/projects/${pam.id}/commits/${sha}`,\n      //         }}\n      //       >\n      //         {_}%\n      //       </Link>\n      //       <Popover content={content} title=\"Title\">\n      //         <img src={im} alt='coverage'/>\n      //       </Popover>\n      //\n      //     </div>\n      //   );\n      // },\n    },\n    {\n      title: (\n        <div ref={ref2}>\n          <Tooltip title={t(\"projects.newlines_tooltip\")} className={\"mr-2\"}>\n            <QuestionCircleOutlined />\n          </Tooltip>\n          {t(\"projects.newlines\")}\n        </div>\n      ),\n      dataIndex: \"newlines\",\n      // width: '130px',\n      render(_, { sha }) {\n        return (\n          <Link\n            to={{\n              pathname: `/projects/${pam.id}/commits/${sha}`,\n            }}\n          >\n            {_}%\n          </Link>\n        );\n      },\n    },\n    {\n      title: t(\"projects.report_times\"),\n      dataIndex: \"times\",\n      width: \"80px\",\n    },\n    {\n      title: t(\"projects.latest_report_time\"),\n      dataIndex: \"lastReportTime\",\n      width: \"135px\",\n      render(_) {\n        return <span>{dayjs(_).format(\"MM-DD HH:mm\")}</span>;\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      width: \"125px\",\n      render(_): JSX.Element {\n        return (\n          <div>\n            <a\n              onClick={() => {\n                setOpen(true);\n                setSha(_.sha);\n              }}\n            >\n              {t(\"projects.reported_details\")}\n            </a>\n            <Divider type={\"vertical\"} />\n\n            <Popconfirm\n              title=\"Delete the project record\"\n              description=\"Are you sure to delete this project record?\"\n              onConfirm={() => {\n                deleteProjectRecord({\n                  variables: {\n                    projectID: pam.id as string,\n                    sha: _.sha,\n                  },\n                })\n                  .then(() => {\n                    window.location.reload();\n                  })\n                  .catch((err) => {\n                    console.log(err);\n                  });\n              }}\n              onCancel={() => {\n                console.log(\"cancel\");\n              }}\n              okText=\"Yes\"\n              cancelText=\"No\"\n            >\n              <a className={\"text-red-500 hover:text-red-600\"}>\n                {t(\"common.delete\")}\n              </a>\n            </Popconfirm>\n          </div>\n        );\n      },\n    },\n  ];\n\n  const option = {\n    backgroundColor: \"transparent\",\n    grid: {\n      top: \"30px\",\n      left: \"30px\",\n      right: \"10px\",\n      bottom: \"20px\",\n    },\n    tooltip: {\n      trigger: \"axis\",\n    },\n    legend: {\n      x: \"right\",\n      data: [t(\"projects.statements\"), t(\"projects.newlines\")],\n    },\n    xAxis: {\n      type: \"category\",\n      data:\n        projectChartData?.getProjectChartData.map(({ sha }) =>\n          sha.slice(0, 7),\n        ) || [],\n    },\n    yAxis: {\n      type: \"value\",\n    },\n    series: [t(\"projects.statements\"), t(\"projects.newlines\")].map(\n      (_, index) => ({\n        name: _,\n        data:\n          projectChartData?.getProjectChartData.map(\n            ({ statements, newlines }) => (index === 0 ? statements : newlines),\n          ) || [],\n        type: \"line\",\n      }),\n    ),\n  };\n  const nav = useNavigate();\n  return (\n    <div className={\"\"}>\n      <div className={\"mb-10\"}>\n        <div className={\"flex\"}>\n          <Title level={2}>\n            {projectByIdData?.getProjectByID.pathWithNamespace}\n            <EditOutlined\n              className={\"ml-3 cursor-pointer text-[#0071c2]\"}\n              style={{ fontSize: \"20px\" }}\n              onClick={() => {\n                nav(`/projects/${pam.id}/configure`);\n              }}\n            />\n          </Title>\n        </div>\n\n        <div>\n          <Text type={\"secondary\"}>\n            {t(\"projects.config.project.id\")}:{\" \"}\n            {projectByIdData?.getProjectByID.id}\n          </Text>\n          <Text className={\"ml-6\"} type={\"secondary\"}>\n            {t(\"projects.default.branch\")}:{\" \"}\n            {projectByIdData?.getProjectByID.defaultBranch}\n          </Text>\n        </div>\n        {(projectByIdData?.getProjectByID.tags || []).length > 0 && (\n          <div className={\"pt-5\"}>\n            <Text className={\"mr-3\"} type={\"secondary\"}>\n              {t(\"projects.config.tag\")}:\n            </Text>\n            {projectByIdData?.getProjectByID.tags.map(\n              ({ color, name, link }, index) => (\n                <Tag\n                  style={{ cursor: link ? \"pointer\" : \"default\" }}\n                  key={index}\n                  color={color}\n                  onClick={() => {\n                    if (link) {\n                      window.open(link);\n                    }\n                  }}\n                >\n                  {name}\n                </Tag>\n              ),\n            )}\n          </div>\n        )}\n      </div>\n\n      <Text className={\"block mb-3\"} style={{ fontWeight: 500, fontSize: 16 }}>\n        {t(\"projects.overview\")}\n      </Text>\n      <Tour\n        open={tourOpen}\n        onClose={() => {\n          setTourOpen(false);\n        }}\n        steps={steps}\n      />\n      <div className={\"flex mb-10\"}>\n        <Spin spinning={projectCompartmentDataLoading}>\n          <div\n            className={`[list-style:none] grid grid-cols-[repeat(2,_215px)] grid-rows-[repeat(2,_1fr)] gap-[16px] h-full mr-[16px]`}\n          >\n            {(projectCompartmentDataData?.getProjectCompartmentData || []).map(\n              (item, index) => {\n                return (\n                  <div\n                    className={\n                      \"p-[20px] h-[150px] flex justify-between flex-col bg-white dark:bg-[#0C0D0E]\"\n                    }\n                    style={{\n                      border: `1px solid ${token.colorBorder}`,\n                      borderRadius: `${token.borderRadius}px`,\n                    }}\n                    key={index}\n                  >\n                    <Text type={\"secondary\"}>{t(item.label)}</Text>\n                    <Text className={\"text-xl\"}>{item.value}</Text>\n                  </div>\n                );\n              },\n            )}\n          </div>\n        </Spin>\n\n        <div style={{ flex: 1 }}>\n          <Spin spinning={projectChartDataLoading}>\n            <div\n              className={\"p-[18px] bg-white dark:bg-[#0C0D0E]\"}\n              style={{\n                border: `1px solid ${token.colorBorder}`,\n                borderRadius: `${token.borderRadius}px`,\n              }}\n            >\n              <div className={\"flex items-center\"}>\n                <Title level={5} style={{ marginBottom: \"0\" }}>\n                  {t(\"projects.trends_in_coverage\")}\n                </Title>\n                <Text\n                  type={\"secondary\"}\n                  className={\"ml-2\"}\n                  style={{ fontSize: 12 }}\n                >\n                  {t(\"projects.trends.tooltip\")}\n                </Text>\n              </div>\n              <ReactECharts\n                theme={\n                  localStorage.getItem(\"theme\") === \"dark\"\n                    ? \"dark\"\n                    : {\n                        color: [\"#287DFA\", \"#FFB400\"],\n                      }\n                }\n                style={{ height: \"254px\" }}\n                option={option}\n              />\n            </div>\n          </Spin>\n        </div>\n      </div>\n\n      <Text className={\"block mb-3\"} style={{ fontWeight: 500, fontSize: 16 }}>\n        {t(\"projects.records\")}\n      </Text>\n      <div\n        className={\"flex\"}\n        style={{ marginBottom: \"16px\", justifyContent: \"space-between\" }}\n      >\n        <div className={\"flex items-center gap-5\"}>\n          <Input.Search\n            defaultValue={keyword}\n            placeholder={t(\"projects.overview_search_keywords\")}\n            onSearch={(value) => {\n              setKeyword(value);\n              setCurrent(1);\n            }}\n            style={{ width: \"600px\" }}\n          />\n          <Space>\n            <Text type={\"secondary\"}>\n              {t(\"projects.only.default.branch\")}:{\" \"}\n            </Text>\n            <Switch\n              defaultChecked={Boolean(\n                localStorage.getItem(\"defaultBranchOnly\"),\n              )}\n              onChange={(v) => {\n                if (v) {\n                  localStorage.setItem(\"defaultBranchOnly\", \"1\");\n                } else {\n                  localStorage.removeItem(\"defaultBranchOnly\");\n                }\n                setDefaultBranchOnly(v);\n              }}\n            />\n          </Space>\n        </div>\n\n        <div className={\"flex gap-2\"} style={{ display: \"none\" }}>\n          {[\"#1f77b4\", \"#ff7f0e\", \"#2ca02c\"].map((item, index) => {\n            return (\n              <div className={\"flex items-center gap-1\"} key={index}>\n                <span\n                  className={\"block w-[20px] h-[12px] rounded-sm\"}\n                  style={{ backgroundColor: item }}\n                ></span>\n                <span className={\"text-sm\"}>\n                  {{\n                    0: \"手工测试\",\n                    1: \"UI自动化测试\",\n                    2: \"单元测试\",\n                  }[index] || \"unknown\"}\n                </span>\n              </div>\n            );\n          })}\n        </div>\n      </div>\n      {/*div*/}\n      <Table\n        loading={loading}\n        style={{\n          border: `1px solid ${token.colorBorder}`,\n          borderRadius: `${token.borderRadius}px`,\n        }}\n        bordered={false}\n        rowKey={\"sha\"}\n        // @ts-ignore\n        columns={columns}\n        pagination={{\n          showTotal: (total) => t(\"common.total_items\", { total }),\n          total: projectsData?.getProjectRecords?.total,\n          current,\n          pageSize,\n          // current: projectsData?.getProjects?.current,\n          // pageSize: projectsData?.getProjects?.pageSize,\n        }}\n        dataSource={projectsData?.getProjectRecords?.data || []}\n        onChange={(val) => {\n          setCurrent(val.current || 1);\n          setPageSize(val.pageSize || 10);\n          // setKeyword(keyword);\n        }}\n      />\n\n      {/*默太狂就共用一个*/}\n      <ProjectRecordDetailDrawer open={open} onClose={onClose} sha={sha} />\n    </div>\n  );\n};\n\nexport default ProjectOverviewPage;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/index.tsx",
    "b": {
      "0": [
        1,
        9
      ],
      "1": [
        90,
        0
      ],
      "2": [
        90,
        0
      ],
      "3": [
        0,
        90
      ],
      "4": [
        47,
        31
      ],
      "5": [
        94,
        62
      ],
      "6": [
        2784,
        2784
      ],
      "7": [
        47,
        23
      ],
      "8": [
        47,
        24
      ],
      "9": [
        0,
        23
      ],
      "10": [
        0,
        0
      ],
      "11": [
        47,
        10
      ],
      "12": [
        0,
        47
      ],
      "13": [
        0,
        0
      ],
      "14": [
        141,
        0
      ],
      "15": [
        47,
        38
      ],
      "16": [
        0,
        0
      ],
      "17": [
        0,
        0
      ]
    },
    "f": {
      "0": 47,
      "1": 1,
      "2": 61,
      "3": 0,
      "4": 10,
      "5": 0,
      "6": 90,
      "7": 90,
      "8": 90,
      "9": 90,
      "10": 90,
      "11": 90,
      "12": 90,
      "13": 1,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 2784,
      "19": 94,
      "20": 5568,
      "21": 0,
      "22": 23,
      "23": 0,
      "24": 0,
      "25": 148,
      "26": 0,
      "27": 0,
      "28": 141,
      "29": 23,
      "30": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 47,
      "4": 47,
      "5": 47,
      "6": 47,
      "7": 47,
      "8": 47,
      "9": 47,
      "10": 47,
      "11": 47,
      "12": 47,
      "13": 1,
      "14": 47,
      "15": 47,
      "16": 47,
      "17": 47,
      "18": 47,
      "19": 47,
      "20": 47,
      "21": 47,
      "22": 47,
      "23": 47,
      "24": 61,
      "25": 0,
      "26": 47,
      "27": 10,
      "28": 1,
      "29": 0,
      "30": 0,
      "31": 47,
      "32": 90,
      "33": 90,
      "34": 90,
      "35": 90,
      "36": 90,
      "37": 90,
      "38": 90,
      "39": 1,
      "40": 1,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 47,
      "46": 2784,
      "47": 94,
      "48": 5568,
      "49": 47,
      "50": 47,
      "51": 0,
      "52": 23,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 148,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 141,
      "64": 23,
      "65": 0,
      "66": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 110,
            "column": 4
          },
          "end": {
            "line": 115,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 110,
              "column": 4
            },
            "end": {
              "line": 115,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 110
      },
      "1": {
        "loc": {
          "start": {
            "line": 159,
            "column": 13
          },
          "end": {
            "line": 159,
            "column": 48
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 159,
              "column": 31
            },
            "end": {
              "line": 159,
              "column": 44
            }
          },
          {
            "start": {
              "line": 159,
              "column": 47
            },
            "end": {
              "line": 159,
              "column": 48
            }
          }
        ],
        "line": 159
      },
      "2": {
        "loc": {
          "start": {
            "line": 171,
            "column": 13
          },
          "end": {
            "line": 181,
            "column": 13
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 172,
              "column": 14
            },
            "end": {
              "line": 178,
              "column": 18
            }
          },
          {
            "start": {
              "line": 180,
              "column": 14
            },
            "end": {
              "line": 180,
              "column": 28
            }
          }
        ],
        "line": 171
      },
      "3": {
        "loc": {
          "start": {
            "line": 175,
            "column": 40
          },
          "end": {
            "line": 175,
            "column": 102
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 175,
              "column": 71
            },
            "end": {
              "line": 175,
              "column": 79
            }
          },
          {
            "start": {
              "line": 175,
              "column": 82
            },
            "end": {
              "line": 175,
              "column": 102
            }
          }
        ],
        "line": 175
      },
      "4": {
        "loc": {
          "start": {
            "line": 338,
            "column": 8
          },
          "end": {
            "line": 340,
            "column": 15
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 338,
              "column": 8
            },
            "end": {
              "line": 340,
              "column": 9
            }
          },
          {
            "start": {
              "line": 340,
              "column": 13
            },
            "end": {
              "line": 340,
              "column": 15
            }
          }
        ],
        "line": 338
      },
      "5": {
        "loc": {
          "start": {
            "line": 349,
            "column": 10
          },
          "end": {
            "line": 351,
            "column": 17
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 349,
              "column": 10
            },
            "end": {
              "line": 351,
              "column": 11
            }
          },
          {
            "start": {
              "line": 351,
              "column": 15
            },
            "end": {
              "line": 351,
              "column": 17
            }
          }
        ],
        "line": 349
      },
      "6": {
        "loc": {
          "start": {
            "line": 350,
            "column": 43
          },
          "end": {
            "line": 350,
            "column": 78
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 350,
              "column": 57
            },
            "end": {
              "line": 350,
              "column": 67
            }
          },
          {
            "start": {
              "line": 350,
              "column": 70
            },
            "end": {
              "line": 350,
              "column": 78
            }
          }
        ],
        "line": 350
      },
      "7": {
        "loc": {
          "start": {
            "line": 383,
            "column": 9
          },
          "end": {
            "line": 405,
            "column": 9
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 383,
              "column": 9
            },
            "end": {
              "line": 383,
              "column": 64
            }
          },
          {
            "start": {
              "line": 384,
              "column": 10
            },
            "end": {
              "line": 404,
              "column": 16
            }
          }
        ],
        "line": 383
      },
      "8": {
        "loc": {
          "start": {
            "line": 383,
            "column": 10
          },
          "end": {
            "line": 383,
            "column": 52
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 383,
              "column": 10
            },
            "end": {
              "line": 383,
              "column": 46
            }
          },
          {
            "start": {
              "line": 383,
              "column": 50
            },
            "end": {
              "line": 383,
              "column": 52
            }
          }
        ],
        "line": 383
      },
      "9": {
        "loc": {
          "start": {
            "line": 391,
            "column": 35
          },
          "end": {
            "line": 391,
            "column": 63
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 391,
              "column": 42
            },
            "end": {
              "line": 391,
              "column": 51
            }
          },
          {
            "start": {
              "line": 391,
              "column": 54
            },
            "end": {
              "line": 391,
              "column": 63
            }
          }
        ],
        "line": 391
      },
      "10": {
        "loc": {
          "start": {
            "line": 395,
            "column": 20
          },
          "end": {
            "line": 397,
            "column": 21
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 395,
              "column": 20
            },
            "end": {
              "line": 397,
              "column": 21
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 395
      },
      "11": {
        "loc": {
          "start": {
            "line": 423,
            "column": 14
          },
          "end": {
            "line": 423,
            "column": 73
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 423,
              "column": 14
            },
            "end": {
              "line": 423,
              "column": 67
            }
          },
          {
            "start": {
              "line": 423,
              "column": 71
            },
            "end": {
              "line": 423,
              "column": 73
            }
          }
        ],
        "line": 423
      },
      "12": {
        "loc": {
          "start": {
            "line": 468,
            "column": 18
          },
          "end": {
            "line": 472,
            "column": 23
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 469,
              "column": 22
            },
            "end": {
              "line": 469,
              "column": 28
            }
          },
          {
            "start": {
              "line": 470,
              "column": 22
            },
            "end": {
              "line": 472,
              "column": 23
            }
          }
        ],
        "line": 468
      },
      "13": {
        "loc": {
          "start": {
            "line": 508,
            "column": 16
          },
          "end": {
            "line": 512,
            "column": 17
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 508,
              "column": 16
            },
            "end": {
              "line": 512,
              "column": 17
            }
          },
          {
            "start": {
              "line": 510,
              "column": 23
            },
            "end": {
              "line": 512,
              "column": 17
            }
          }
        ],
        "line": 508
      },
      "14": {
        "loc": {
          "start": {
            "line": 528,
            "column": 19
          },
          "end": {
            "line": 532,
            "column": 39
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 528,
              "column": 19
            },
            "end": {
              "line": 532,
              "column": 26
            }
          },
          {
            "start": {
              "line": 532,
              "column": 30
            },
            "end": {
              "line": 532,
              "column": 39
            }
          }
        ],
        "line": 528
      },
      "15": {
        "loc": {
          "start": {
            "line": 558,
            "column": 20
          },
          "end": {
            "line": 558,
            "column": 63
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 558,
              "column": 20
            },
            "end": {
              "line": 558,
              "column": 57
            }
          },
          {
            "start": {
              "line": 558,
              "column": 61
            },
            "end": {
              "line": 558,
              "column": 63
            }
          }
        ],
        "line": 558
      },
      "16": {
        "loc": {
          "start": {
            "line": 560,
            "column": 21
          },
          "end": {
            "line": 560,
            "column": 37
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 560,
              "column": 21
            },
            "end": {
              "line": 560,
              "column": 32
            }
          },
          {
            "start": {
              "line": 560,
              "column": 36
            },
            "end": {
              "line": 560,
              "column": 37
            }
          }
        ],
        "line": 560
      },
      "17": {
        "loc": {
          "start": {
            "line": 561,
            "column": 22
          },
          "end": {
            "line": 561,
            "column": 40
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 561,
              "column": 22
            },
            "end": {
              "line": 561,
              "column": 34
            }
          },
          {
            "start": {
              "line": 561,
              "column": 38
            },
            "end": {
              "line": 561,
              "column": 40
            }
          }
        ],
        "line": 561
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 34,
            "column": 28
          },
          "end": {
            "line": 34,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 34,
            "column": 34
          },
          "end": {
            "line": 570,
            "column": 1
          }
        },
        "line": 34
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 48,
            "column": 18
          },
          "end": {
            "line": 48,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 48,
            "column": 24
          },
          "end": {
            "line": 50,
            "column": 3
          }
        },
        "line": 48
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 100,
            "column": 14
          },
          "end": {
            "line": 100,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 100,
            "column": 20
          },
          "end": {
            "line": 100,
            "column": 32
          }
        },
        "line": 100
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 105,
            "column": 14
          },
          "end": {
            "line": 105,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 105,
            "column": 20
          },
          "end": {
            "line": 105,
            "column": 32
          }
        },
        "line": 105
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 109,
            "column": 12
          },
          "end": {
            "line": 109,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 109,
            "column": 18
          },
          "end": {
            "line": 116,
            "column": 3
          }
        },
        "line": 109
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 111,
            "column": 17
          },
          "end": {
            "line": 111,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 111,
            "column": 23
          },
          "end": {
            "line": 114,
            "column": 7
          }
        },
        "line": 111
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 128,
            "column": 6
          },
          "end": {
            "line": 128,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 128,
            "column": 41
          },
          "end": {
            "line": 134,
            "column": 7
          }
        },
        "line": 128
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 156,
            "column": 6
          },
          "end": {
            "line": 156,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 156,
            "column": 45
          },
          "end": {
            "line": 162,
            "column": 7
          }
        },
        "line": 156
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 168,
            "column": 6
          },
          "end": {
            "line": 168,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 168,
            "column": 24
          },
          "end": {
            "line": 184,
            "column": 7
          }
        },
        "line": 168
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 203,
            "column": 6
          },
          "end": {
            "line": 203,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 203,
            "column": 25
          },
          "end": {
            "line": 213,
            "column": 7
          }
        },
        "line": 203
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 246,
            "column": 6
          },
          "end": {
            "line": 246,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 246,
            "column": 25
          },
          "end": {
            "line": 256,
            "column": 7
          }
        },
        "line": 246
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 267,
            "column": 6
          },
          "end": {
            "line": 267,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 267,
            "column": 16
          },
          "end": {
            "line": 269,
            "column": 7
          }
        },
        "line": 267
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 274,
            "column": 6
          },
          "end": {
            "line": 274,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 274,
            "column": 29
          },
          "end": {
            "line": 316,
            "column": 7
          }
        },
        "line": 274
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 278,
            "column": 23
          },
          "end": {
            "line": 278,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 278,
            "column": 29
          },
          "end": {
            "line": 281,
            "column": 15
          }
        },
        "line": 278
      },
      "14": {
        "name": "(anonymous_14)",
        "decl": {
          "start": {
            "line": 290,
            "column": 25
          },
          "end": {
            "line": 290,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 290,
            "column": 31
          },
          "end": {
            "line": 303,
            "column": 15
          }
        },
        "line": 290
      },
      "15": {
        "name": "(anonymous_15)",
        "decl": {
          "start": {
            "line": 297,
            "column": 24
          },
          "end": {
            "line": 297,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 297,
            "column": 30
          },
          "end": {
            "line": 299,
            "column": 19
          }
        },
        "line": 297
      },
      "16": {
        "name": "(anonymous_16)",
        "decl": {
          "start": {
            "line": 300,
            "column": 25
          },
          "end": {
            "line": 300,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 300,
            "column": 34
          },
          "end": {
            "line": 302,
            "column": 19
          }
        },
        "line": 300
      },
      "17": {
        "name": "(anonymous_17)",
        "decl": {
          "start": {
            "line": 304,
            "column": 24
          },
          "end": {
            "line": 304,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 304,
            "column": 30
          },
          "end": {
            "line": 306,
            "column": 15
          }
        },
        "line": 304
      },
      "18": {
        "name": "(anonymous_18)",
        "decl": {
          "start": {
            "line": 338,
            "column": 50
          },
          "end": {
            "line": 338,
            "column": 51
          }
        },
        "loc": {
          "start": {
            "line": 339,
            "column": 10
          },
          "end": {
            "line": 339,
            "column": 25
          }
        },
        "line": 339
      },
      "19": {
        "name": "(anonymous_19)",
        "decl": {
          "start": {
            "line": 346,
            "column": 6
          },
          "end": {
            "line": 346,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 346,
            "column": 21
          },
          "end": {
            "line": 353,
            "column": 7
          }
        },
        "line": 346
      },
      "20": {
        "name": "(anonymous_20)",
        "decl": {
          "start": {
            "line": 350,
            "column": 12
          },
          "end": {
            "line": 350,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 350,
            "column": 43
          },
          "end": {
            "line": 350,
            "column": 78
          }
        },
        "line": 350
      },
      "21": {
        "name": "(anonymous_21)",
        "decl": {
          "start": {
            "line": 366,
            "column": 23
          },
          "end": {
            "line": 366,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 366,
            "column": 29
          },
          "end": {
            "line": 368,
            "column": 15
          }
        },
        "line": 366
      },
      "22": {
        "name": "(anonymous_22)",
        "decl": {
          "start": {
            "line": 389,
            "column": 14
          },
          "end": {
            "line": 389,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 390,
            "column": 16
          },
          "end": {
            "line": 401,
            "column": 22
          }
        },
        "line": 390
      },
      "23": {
        "name": "(anonymous_23)",
        "decl": {
          "start": {
            "line": 394,
            "column": 27
          },
          "end": {
            "line": 394,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 394,
            "column": 33
          },
          "end": {
            "line": 398,
            "column": 19
          }
        },
        "line": 394
      },
      "24": {
        "name": "(anonymous_24)",
        "decl": {
          "start": {
            "line": 413,
            "column": 17
          },
          "end": {
            "line": 413,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 413,
            "column": 23
          },
          "end": {
            "line": 415,
            "column": 9
          }
        },
        "line": 413
      },
      "25": {
        "name": "(anonymous_25)",
        "decl": {
          "start": {
            "line": 424,
            "column": 14
          },
          "end": {
            "line": 424,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 424,
            "column": 31
          },
          "end": {
            "line": 440,
            "column": 15
          }
        },
        "line": 424
      },
      "26": {
        "name": "(anonymous_26)",
        "decl": {
          "start": {
            "line": 493,
            "column": 22
          },
          "end": {
            "line": 493,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 493,
            "column": 33
          },
          "end": {
            "line": 496,
            "column": 13
          }
        },
        "line": 493
      },
      "27": {
        "name": "(anonymous_27)",
        "decl": {
          "start": {
            "line": 507,
            "column": 24
          },
          "end": {
            "line": 507,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 507,
            "column": 31
          },
          "end": {
            "line": 514,
            "column": 15
          }
        },
        "line": 507
      },
      "28": {
        "name": "(anonymous_28)",
        "decl": {
          "start": {
            "line": 520,
            "column": 49
          },
          "end": {
            "line": 520,
            "column": 50
          }
        },
        "loc": {
          "start": {
            "line": 520,
            "column": 66
          },
          "end": {
            "line": 536,
            "column": 11
          }
        },
        "line": 520
      },
      "29": {
        "name": "(anonymous_29)",
        "decl": {
          "start": {
            "line": 551,
            "column": 21
          },
          "end": {
            "line": 551,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 551,
            "column": 32
          },
          "end": {
            "line": 551,
            "column": 66
          }
        },
        "line": 551
      },
      "30": {
        "name": "(anonymous_30)",
        "decl": {
          "start": {
            "line": 559,
            "column": 18
          },
          "end": {
            "line": 559,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 559,
            "column": 27
          },
          "end": {
            "line": 563,
            "column": 9
          }
        },
        "line": 559
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 27,
          "column": 21
        },
        "end": {
          "line": 27,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 28,
          "column": 24
        },
        "end": {
          "line": 28,
          "column": 34
        }
      },
      "2": {
        "start": {
          "line": 34,
          "column": 28
        },
        "end": {
          "line": 570,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 35,
          "column": 20
        },
        "end": {
          "line": 35,
          "column": 30
        }
      },
      "4": {
        "start": {
          "line": 36,
          "column": 16
        },
        "end": {
          "line": 36,
          "column": 32
        }
      },
      "5": {
        "start": {
          "line": 37,
          "column": 32
        },
        "end": {
          "line": 37,
          "column": 44
        }
      },
      "6": {
        "start": {
          "line": 38,
          "column": 32
        },
        "end": {
          "line": 38,
          "column": 43
        }
      },
      "7": {
        "start": {
          "line": 39,
          "column": 34
        },
        "end": {
          "line": 39,
          "column": 46
        }
      },
      "8": {
        "start": {
          "line": 40,
          "column": 26
        },
        "end": {
          "line": 40,
          "column": 41
        }
      },
      "9": {
        "start": {
          "line": 41,
          "column": 24
        },
        "end": {
          "line": 41,
          "column": 36
        }
      },
      "10": {
        "start": {
          "line": 42,
          "column": 32
        },
        "end": {
          "line": 44,
          "column": 3
        }
      },
      "11": {
        "start": {
          "line": 45,
          "column": 52
        },
        "end": {
          "line": 47,
          "column": 3
        }
      },
      "12": {
        "start": {
          "line": 48,
          "column": 18
        },
        "end": {
          "line": 50,
          "column": 3
        }
      },
      "13": {
        "start": {
          "line": 49,
          "column": 4
        },
        "end": {
          "line": 49,
          "column": 19
        }
      },
      "14": {
        "start": {
          "line": 52,
          "column": 14
        },
        "end": {
          "line": 52,
          "column": 25
        }
      },
      "15": {
        "start": {
          "line": 54,
          "column": 42
        },
        "end": {
          "line": 63,
          "column": 4
        }
      },
      "16": {
        "start": {
          "line": 65,
          "column": 36
        },
        "end": {
          "line": 70,
          "column": 4
        }
      },
      "17": {
        "start": {
          "line": 72,
          "column": 71
        },
        "end": {
          "line": 81,
          "column": 3
        }
      },
      "18": {
        "start": {
          "line": 86,
          "column": 6
        },
        "end": {
          "line": 91,
          "column": 4
        }
      },
      "19": {
        "start": {
          "line": 92,
          "column": 32
        },
        "end": {
          "line": 92,
          "column": 72
        }
      },
      "20": {
        "start": {
          "line": 93,
          "column": 15
        },
        "end": {
          "line": 93,
          "column": 27
        }
      },
      "21": {
        "start": {
          "line": 94,
          "column": 15
        },
        "end": {
          "line": 94,
          "column": 27
        }
      },
      "22": {
        "start": {
          "line": 95,
          "column": 34
        },
        "end": {
          "line": 95,
          "column": 49
        }
      },
      "23": {
        "start": {
          "line": 96,
          "column": 36
        },
        "end": {
          "line": 107,
          "column": 3
        }
      },
      "24": {
        "start": {
          "line": 100,
          "column": 20
        },
        "end": {
          "line": 100,
          "column": 32
        }
      },
      "25": {
        "start": {
          "line": 105,
          "column": 20
        },
        "end": {
          "line": 105,
          "column": 32
        }
      },
      "26": {
        "start": {
          "line": 109,
          "column": 2
        },
        "end": {
          "line": 116,
          "column": 9
        }
      },
      "27": {
        "start": {
          "line": 110,
          "column": 4
        },
        "end": {
          "line": 115,
          "column": 5
        }
      },
      "28": {
        "start": {
          "line": 111,
          "column": 6
        },
        "end": {
          "line": 114,
          "column": 15
        }
      },
      "29": {
        "start": {
          "line": 112,
          "column": 8
        },
        "end": {
          "line": 112,
          "column": 26
        }
      },
      "30": {
        "start": {
          "line": 113,
          "column": 8
        },
        "end": {
          "line": 113,
          "column": 49
        }
      },
      "31": {
        "start": {
          "line": 118,
          "column": 52
        },
        "end": {
          "line": 318,
          "column": 3
        }
      },
      "32": {
        "start": {
          "line": 129,
          "column": 8
        },
        "end": {
          "line": 133,
          "column": 10
        }
      },
      "33": {
        "start": {
          "line": 157,
          "column": 8
        },
        "end": {
          "line": 161,
          "column": 10
        }
      },
      "34": {
        "start": {
          "line": 169,
          "column": 8
        },
        "end": {
          "line": 183,
          "column": 10
        }
      },
      "35": {
        "start": {
          "line": 204,
          "column": 8
        },
        "end": {
          "line": 212,
          "column": 10
        }
      },
      "36": {
        "start": {
          "line": 247,
          "column": 8
        },
        "end": {
          "line": 255,
          "column": 10
        }
      },
      "37": {
        "start": {
          "line": 268,
          "column": 8
        },
        "end": {
          "line": 268,
          "column": 61
        }
      },
      "38": {
        "start": {
          "line": 275,
          "column": 8
        },
        "end": {
          "line": 315,
          "column": 10
        }
      },
      "39": {
        "start": {
          "line": 279,
          "column": 16
        },
        "end": {
          "line": 279,
          "column": 30
        }
      },
      "40": {
        "start": {
          "line": 280,
          "column": 16
        },
        "end": {
          "line": 280,
          "column": 30
        }
      },
      "41": {
        "start": {
          "line": 291,
          "column": 16
        },
        "end": {
          "line": 302,
          "column": 21
        }
      },
      "42": {
        "start": {
          "line": 298,
          "column": 20
        },
        "end": {
          "line": 298,
          "column": 45
        }
      },
      "43": {
        "start": {
          "line": 301,
          "column": 20
        },
        "end": {
          "line": 301,
          "column": 37
        }
      },
      "44": {
        "start": {
          "line": 305,
          "column": 16
        },
        "end": {
          "line": 305,
          "column": 38
        }
      },
      "45": {
        "start": {
          "line": 320,
          "column": 17
        },
        "end": {
          "line": 355,
          "column": 3
        }
      },
      "46": {
        "start": {
          "line": 339,
          "column": 10
        },
        "end": {
          "line": 339,
          "column": 25
        }
      },
      "47": {
        "start": {
          "line": 346,
          "column": 21
        },
        "end": {
          "line": 353,
          "column": 7
        }
      },
      "48": {
        "start": {
          "line": 350,
          "column": 43
        },
        "end": {
          "line": 350,
          "column": 78
        }
      },
      "49": {
        "start": {
          "line": 356,
          "column": 14
        },
        "end": {
          "line": 356,
          "column": 27
        }
      },
      "50": {
        "start": {
          "line": 357,
          "column": 2
        },
        "end": {
          "line": 569,
          "column": 4
        }
      },
      "51": {
        "start": {
          "line": 367,
          "column": 16
        },
        "end": {
          "line": 367,
          "column": 53
        }
      },
      "52": {
        "start": {
          "line": 390,
          "column": 16
        },
        "end": {
          "line": 401,
          "column": 22
        }
      },
      "53": {
        "start": {
          "line": 395,
          "column": 20
        },
        "end": {
          "line": 397,
          "column": 21
        }
      },
      "54": {
        "start": {
          "line": 396,
          "column": 22
        },
        "end": {
          "line": 396,
          "column": 40
        }
      },
      "55": {
        "start": {
          "line": 414,
          "column": 10
        },
        "end": {
          "line": 414,
          "column": 29
        }
      },
      "56": {
        "start": {
          "line": 425,
          "column": 16
        },
        "end": {
          "line": 439,
          "column": 18
        }
      },
      "57": {
        "start": {
          "line": 494,
          "column": 14
        },
        "end": {
          "line": 494,
          "column": 32
        }
      },
      "58": {
        "start": {
          "line": 495,
          "column": 14
        },
        "end": {
          "line": 495,
          "column": 28
        }
      },
      "59": {
        "start": {
          "line": 508,
          "column": 16
        },
        "end": {
          "line": 512,
          "column": 17
        }
      },
      "60": {
        "start": {
          "line": 509,
          "column": 18
        },
        "end": {
          "line": 509,
          "column": 65
        }
      },
      "61": {
        "start": {
          "line": 511,
          "column": 18
        },
        "end": {
          "line": 511,
          "column": 63
        }
      },
      "62": {
        "start": {
          "line": 513,
          "column": 16
        },
        "end": {
          "line": 513,
          "column": 40
        }
      },
      "63": {
        "start": {
          "line": 521,
          "column": 12
        },
        "end": {
          "line": 535,
          "column": 14
        }
      },
      "64": {
        "start": {
          "line": 551,
          "column": 32
        },
        "end": {
          "line": 551,
          "column": 66
        }
      },
      "65": {
        "start": {
          "line": 560,
          "column": 10
        },
        "end": {
          "line": 560,
          "column": 39
        }
      },
      "66": {
        "start": {
          "line": 561,
          "column": 10
        },
        "end": {
          "line": 561,
          "column": 42
        }
      }
    }
  }
}