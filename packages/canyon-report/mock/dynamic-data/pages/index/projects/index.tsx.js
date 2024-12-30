window["pages/index/projects/index.tsx"] = {
  "content": "import {\n  FolderOutlined,\n  HeartFilled,\n  HeartOutlined,\n  PlusOutlined,\n  QuestionCircleOutlined,\n} from \"@ant-design/icons\";\nimport { useMutation, useQuery } from \"@apollo/client\";\nimport { ColumnsType } from \"antd/es/table\";\nimport { TextTypography } from \"../../../components/ui\";\nimport dayjs from \"dayjs\";\nimport { useState } from \"react\";\nimport { useTranslation } from \"react-i18next\";\nimport { Link } from \"react-router-dom\";\n\nimport { CanyonCardPrimary } from \"../../../components/old-ui\";\nimport {\n  DeleteProjectDocument,\n  FavorProjectDocument,\n  GetProjectsBuOptionsDocument,\n  GetProjectsDocument,\n  GetProjectsTagOptionsDocument,\n  Project,\n} from \"../../../helpers/backend/gen/graphql.ts\";\n\nconst { Text } = Typography;\n\nfunction countingStars(num: any) {\n  if (num >= 75 && num < 80) {\n    return \"🌟\";\n  } else if (num >= 80 && num < 85) {\n    return \"🌟🌟\";\n  } else if (num >= 85 && num < 90) {\n    return \"🌟🌟🌟\";\n  } else if (num >= 90 && num < 95) {\n    return \"🌟🌟🌟🌟\";\n  } else if (num >= 95 && num <= 100) {\n    return \"🌟🌟🌟🌟🌟\";\n  }\n}\nconst ProjectPage = () => {\n  const { t } = useTranslation();\n  const [deleteProject] = useMutation(DeleteProjectDocument);\n  const [favorProject] = useMutation(FavorProjectDocument);\n  const columns: ColumnsType<Project> = [\n    {\n      title: \"ID\",\n      dataIndex: \"id\",\n      key: \"id\",\n      render(text, record) {\n        return (\n          <Space>\n            <div\n              className={\"favor-heart\"}\n              style={{ visibility: record.favored ? \"unset\" : undefined }}\n              onClick={() => {\n                favorProject({\n                  variables: {\n                    projectID: record.id,\n                    favored: !record.favored,\n                  },\n                }).then(() => {\n                  refetch().then(() => {\n                    message.success(\"success\");\n                  });\n                });\n              }}\n            >\n              {record.favored ? (\n                <HeartFilled style={{ color: \"red\" }} />\n              ) : (\n                <HeartOutlined />\n              )}\n            </div>\n            {text.split(\"-\")[1]}\n          </Space>\n        );\n      },\n    },\n    {\n      title: t(\"projects.slug\"),\n      dataIndex: \"id\",\n      key: \"slug\",\n      render(text) {\n        return (\n          <span className={\"max-w-[80px] block\"}>{text.split(\"-\")[2]}</span>\n        );\n      },\n    },\n    {\n      title: t(\"projects.name\"),\n      dataIndex: \"pathWithNamespace\",\n      key: \"pathWithNamespace\",\n      render: (text, record) => {\n        return (\n          <div className={\"flex gap-1\"}>\n            <div>\n              <img\n                src=\"/gitproviders/gitlab.svg\"\n                alt=\"\"\n                className={\"w-[16px]\"}\n              />\n            </div>\n\n            <span style={{ width: \"4px\", display: \"inline-block\" }}></span>\n            <div className={\"flex gap-1 flex-col\"}>\n              <a\n                className={\"max-w-[240px]\"}\n                style={{ color: \"unset\" }}\n                target={\"_blank\"}\n                // @ts-ignore\n                href={`${window.GITLAB_URL}/${text}`}\n                rel=\"noreferrer\"\n              >\n                {text}\n              </a>\n              <Text\n                type={\"secondary\"}\n                style={{ fontSize: \"12px\", width: \"240px\" }}\n              >\n                {record.description}\n              </Text>\n            </div>\n          </div>\n        );\n      },\n    },\n    {\n      title: \"Bu\",\n      dataIndex: \"bu\",\n      sorter: true,\n    },\n    {\n      title: t(\"projects.report_times\"),\n      dataIndex: \"reportTimes\",\n      sorter: true,\n    },\n    {\n      title: (\n        <>\n          <Tooltip\n            title={t(\"projects.max_coverage_tooltip\")}\n            className={\"mr-2\"}\n          >\n            <QuestionCircleOutlined />\n          </Tooltip>\n          {t(\"projects.max_coverage\")}\n        </>\n      ),\n      dataIndex: \"maxCoverage\",\n      key: \"maxCoverage\",\n      sorter: true,\n      render: (text) => {\n        return (\n          <Space>\n            {text}%{countingStars(text)}\n          </Space>\n        );\n      },\n    },\n    {\n      title: t(\"projects.latest_report_time\"),\n      dataIndex: \"lastReportTime\",\n      sorter: true,\n      render(_) {\n        return <span>{dayjs(_).format(\"MM-DD HH:mm\")}</span>;\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      key: \"option\",\n      render: (_, { id }) => (\n        <>\n          <Link\n            to={{\n              pathname: `/projects/${id}`,\n            }}\n          >\n            {t(\"common.detail\")}\n          </Link>\n          <Divider type={\"vertical\"} />\n          <Link\n            to={{\n              pathname: `/projects/${id}/settings`,\n            }}\n          >\n            {t(\"common.settings\")}\n          </Link>\n        </>\n      ),\n    },\n  ];\n  const initBu = (() => {\n    try {\n      if (JSON.parse(localStorage.getItem(\"bu\") || \"[]\") instanceof Array) {\n        return JSON.parse(localStorage.getItem(\"bu\") || \"[]\");\n      } else {\n        return [];\n      }\n    } catch (e) {\n      return [];\n    }\n  })();\n\n  const initTag = (() => {\n    return localStorage.getItem(\"tag\") || \"\";\n  })();\n  const initFavorOnly = Boolean(localStorage.getItem(\"favorOnlyFilter\"));\n  const [keyword, setKeyword] = useState(\"\");\n  const [favorOnly, setFavorOnly] = useState(initFavorOnly);\n  const [bu, setBu] = useState<string[]>(initBu);\n  const [tag, setTag] = useState<string>(initTag);\n  const [current, setCurrent] = useState(1);\n  const [pageSize, setPageSize] = useState(10);\n  const [sorter, setSorter] = useState<any>({});\n\n  const { data: projectsBuOptionsData } = useQuery(\n    GetProjectsBuOptionsDocument,\n    {\n      fetchPolicy: \"no-cache\",\n    },\n  );\n\n  const { data: projectsTagOptionsData } = useQuery(\n    GetProjectsTagOptionsDocument,\n    {\n      fetchPolicy: \"no-cache\",\n    },\n  );\n\n  const {\n    data: projectsData,\n    loading,\n    refetch,\n  } = useQuery(GetProjectsDocument, {\n    variables: {\n      current: current,\n      pageSize: pageSize,\n      keyword: keyword,\n      bu: bu,\n      tag: tag,\n      lang: [\"JavaScript\"],\n      field: sorter.field || \"\",\n      order: sorter.order || \"\",\n      favorOnly: favorOnly,\n    },\n    fetchPolicy: \"no-cache\",\n  });\n\n  return (\n    <>\n      <TextTypography\n        title={t(\"menus.projects\")}\n        icon={<FolderOutlined />}\n        right={\n          <Link to={`/projects/new`}>\n            <Button type={\"primary\"} icon={<PlusOutlined />}>\n              {t(\"projects.create\")}\n            </Button>\n          </Link>\n        }\n      />\n\n      <div>\n        <div className={\"flex justify-between\"}>\n          <div>\n            <Select\n              defaultValue={initBu}\n              mode=\"multiple\"\n              onChange={(v) => {\n                setBu(v);\n                localStorage.setItem(\"bu\", JSON.stringify(v));\n              }}\n              placeholder={\"Bu\"}\n              className={\"w-[200px] mr-2\"}\n              options={(projectsBuOptionsData?.getProjectsBuOptions || []).map(\n                ({ bu, count }) => ({\n                  label: bu + ` ${count}`,\n                  value: bu,\n                }),\n              )}\n            />\n\n            <Select\n              allowClear={true}\n              defaultValue={initTag || undefined}\n              onChange={(v) => {\n                setTag(v || \"\");\n                localStorage.setItem(\"tag\", v || \"\");\n              }}\n              placeholder={\"Tag\"}\n              className={\"w-[200px] mr-2\"}\n              options={(\n                projectsTagOptionsData?.getProjectsTagOptions || []\n              ).map(({ name }) => ({\n                label: name,\n                value: name,\n              }))}\n            />\n\n            <Input.Search\n              placeholder={t(\"projects.search_keywords\")}\n              className={\"w-[420px] mb-3\"}\n              onSearch={(value) => {\n                setKeyword(value);\n                setCurrent(1);\n              }}\n            />\n            <Space className={\"ml-5\"}>\n              <Text type={\"secondary\"}>{t(\"common.favor.only\")}: </Text>\n              <Switch\n                checkedChildren={<HeartFilled />}\n                defaultChecked={Boolean(\n                  localStorage.getItem(\"favorOnlyFilter\"),\n                )}\n                onChange={(v) => {\n                  if (v) {\n                    localStorage.setItem(\"favorOnlyFilter\", \"1\");\n                  } else {\n                    localStorage.removeItem(\"favorOnlyFilter\");\n                  }\n                  setFavorOnly(v);\n                }}\n              />\n            </Space>\n          </div>\n        </div>\n\n        <CanyonCardPrimary>\n          <Table\n            showSorterTooltip={false}\n            loading={loading}\n            rowKey={\"id\"}\n            pagination={{\n              total: projectsData?.getProjects?.total,\n              showTotal: (total) => t(\"common.total_items\", { total }),\n              current,\n              pageSize,\n            }}\n            bordered={false}\n            dataSource={projectsData?.getProjects?.data || []}\n            // @ts-ignore\n            columns={columns}\n            onChange={(val, _, _sorter: any) => {\n              setSorter({\n                field: _sorter.field,\n                order: _sorter.order,\n              });\n              setCurrent(val.current || 1);\n              setPageSize(val.pageSize || 10);\n            }}\n          />\n        </CanyonCardPrimary>\n      </div>\n    </>\n  );\n};\n\nexport default ProjectPage;\n",
  "coverage": {
    "path": "pages/index/projects/index.tsx",
    "b": {
      "0": [
        1,
        89
      ],
      "1": [
        90,
        24
      ],
      "2": [
        8,
        81
      ],
      "3": [
        89,
        23
      ],
      "4": [
        15,
        66
      ],
      "5": [
        81,
        15
      ],
      "6": [
        0,
        66
      ],
      "7": [
        66,
        0
      ],
      "8": [
        0,
        66
      ],
      "9": [
        66,
        0
      ],
      "10": [
        0,
        90
      ],
      "11": [
        0,
        90
      ],
      "12": [
        46,
        0
      ],
      "13": [
        46,
        46
      ],
      "14": [
        46,
        46
      ],
      "15": [
        46,
        46
      ],
      "16": [
        46,
        46
      ],
      "17": [
        46,
        46
      ],
      "18": [
        46,
        10
      ],
      "19": [
        46,
        46
      ],
      "20": [
        0,
        0
      ],
      "21": [
        0,
        0
      ],
      "22": [
        46,
        26
      ],
      "23": [
        0,
        0
      ],
      "24": [
        46,
        36
      ],
      "25": [
        0,
        0
      ],
      "26": [
        0,
        0
      ]
    },
    "f": {
      "0": 90,
      "1": 46,
      "2": 90,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 90,
      "7": 90,
      "8": 90,
      "9": 90,
      "10": 90,
      "11": 46,
      "12": 46,
      "13": 0,
      "14": 504,
      "15": 0,
      "16": 900,
      "17": 2,
      "18": 0,
      "19": 30,
      "20": 0
    },
    "s": {
      "0": 8,
      "1": 90,
      "2": 1,
      "3": 89,
      "4": 8,
      "5": 81,
      "6": 15,
      "7": 66,
      "8": 0,
      "9": 66,
      "10": 0,
      "11": 8,
      "12": 46,
      "13": 46,
      "14": 46,
      "15": 46,
      "16": 90,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 90,
      "21": 90,
      "22": 90,
      "23": 90,
      "24": 90,
      "25": 46,
      "26": 46,
      "27": 46,
      "28": 46,
      "29": 0,
      "30": 0,
      "31": 46,
      "32": 46,
      "33": 46,
      "34": 46,
      "35": 46,
      "36": 46,
      "37": 46,
      "38": 46,
      "39": 46,
      "40": 46,
      "41": 46,
      "42": 46,
      "43": 46,
      "44": 46,
      "45": 0,
      "46": 0,
      "47": 504,
      "48": 0,
      "49": 0,
      "50": 900,
      "51": 2,
      "52": 2,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 30,
      "58": 0,
      "59": 0,
      "60": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 29,
            "column": 2
          },
          "end": {
            "line": 39,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 29,
              "column": 2
            },
            "end": {
              "line": 39,
              "column": 3
            }
          },
          {
            "start": {
              "line": 31,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          }
        ],
        "line": 29
      },
      "1": {
        "loc": {
          "start": {
            "line": 29,
            "column": 6
          },
          "end": {
            "line": 29,
            "column": 27
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 29,
              "column": 6
            },
            "end": {
              "line": 29,
              "column": 15
            }
          },
          {
            "start": {
              "line": 29,
              "column": 19
            },
            "end": {
              "line": 29,
              "column": 27
            }
          }
        ],
        "line": 29
      },
      "2": {
        "loc": {
          "start": {
            "line": 31,
            "column": 9
          },
          "end": {
            "line": 39,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 31,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          },
          {
            "start": {
              "line": 33,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          }
        ],
        "line": 31
      },
      "3": {
        "loc": {
          "start": {
            "line": 31,
            "column": 13
          },
          "end": {
            "line": 31,
            "column": 34
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 31,
              "column": 13
            },
            "end": {
              "line": 31,
              "column": 22
            }
          },
          {
            "start": {
              "line": 31,
              "column": 26
            },
            "end": {
              "line": 31,
              "column": 34
            }
          }
        ],
        "line": 31
      },
      "4": {
        "loc": {
          "start": {
            "line": 33,
            "column": 9
          },
          "end": {
            "line": 39,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 33,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          },
          {
            "start": {
              "line": 35,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          }
        ],
        "line": 33
      },
      "5": {
        "loc": {
          "start": {
            "line": 33,
            "column": 13
          },
          "end": {
            "line": 33,
            "column": 34
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 33,
              "column": 13
            },
            "end": {
              "line": 33,
              "column": 22
            }
          },
          {
            "start": {
              "line": 33,
              "column": 26
            },
            "end": {
              "line": 33,
              "column": 34
            }
          }
        ],
        "line": 33
      },
      "6": {
        "loc": {
          "start": {
            "line": 35,
            "column": 9
          },
          "end": {
            "line": 39,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 35,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          },
          {
            "start": {
              "line": 37,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          }
        ],
        "line": 35
      },
      "7": {
        "loc": {
          "start": {
            "line": 35,
            "column": 13
          },
          "end": {
            "line": 35,
            "column": 34
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 35,
              "column": 13
            },
            "end": {
              "line": 35,
              "column": 22
            }
          },
          {
            "start": {
              "line": 35,
              "column": 26
            },
            "end": {
              "line": 35,
              "column": 34
            }
          }
        ],
        "line": 35
      },
      "8": {
        "loc": {
          "start": {
            "line": 37,
            "column": 9
          },
          "end": {
            "line": 39,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 37,
              "column": 9
            },
            "end": {
              "line": 39,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 37
      },
      "9": {
        "loc": {
          "start": {
            "line": 37,
            "column": 13
          },
          "end": {
            "line": 37,
            "column": 36
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 37,
              "column": 13
            },
            "end": {
              "line": 37,
              "column": 22
            }
          },
          {
            "start": {
              "line": 37,
              "column": 26
            },
            "end": {
              "line": 37,
              "column": 36
            }
          }
        ],
        "line": 37
      },
      "10": {
        "loc": {
          "start": {
            "line": 55,
            "column": 35
          },
          "end": {
            "line": 55,
            "column": 71
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 55,
              "column": 52
            },
            "end": {
              "line": 55,
              "column": 59
            }
          },
          {
            "start": {
              "line": 55,
              "column": 62
            },
            "end": {
              "line": 55,
              "column": 71
            }
          }
        ],
        "line": 55
      },
      "11": {
        "loc": {
          "start": {
            "line": 69,
            "column": 15
          },
          "end": {
            "line": 73,
            "column": 15
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 70,
              "column": 16
            },
            "end": {
              "line": 70,
              "column": 56
            }
          },
          {
            "start": {
              "line": 72,
              "column": 16
            },
            "end": {
              "line": 72,
              "column": 33
            }
          }
        ],
        "line": 69
      },
      "12": {
        "loc": {
          "start": {
            "line": 195,
            "column": 6
          },
          "end": {
            "line": 199,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 195,
              "column": 6
            },
            "end": {
              "line": 199,
              "column": 7
            }
          },
          {
            "start": {
              "line": 197,
              "column": 13
            },
            "end": {
              "line": 199,
              "column": 7
            }
          }
        ],
        "line": 195
      },
      "13": {
        "loc": {
          "start": {
            "line": 195,
            "column": 21
          },
          "end": {
            "line": 195,
            "column": 55
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 195,
              "column": 21
            },
            "end": {
              "line": 195,
              "column": 47
            }
          },
          {
            "start": {
              "line": 195,
              "column": 51
            },
            "end": {
              "line": 195,
              "column": 55
            }
          }
        ],
        "line": 195
      },
      "14": {
        "loc": {
          "start": {
            "line": 196,
            "column": 26
          },
          "end": {
            "line": 196,
            "column": 60
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 196,
              "column": 26
            },
            "end": {
              "line": 196,
              "column": 52
            }
          },
          {
            "start": {
              "line": 196,
              "column": 56
            },
            "end": {
              "line": 196,
              "column": 60
            }
          }
        ],
        "line": 196
      },
      "15": {
        "loc": {
          "start": {
            "line": 206,
            "column": 11
          },
          "end": {
            "line": 206,
            "column": 44
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 206,
              "column": 11
            },
            "end": {
              "line": 206,
              "column": 38
            }
          },
          {
            "start": {
              "line": 206,
              "column": 42
            },
            "end": {
              "line": 206,
              "column": 44
            }
          }
        ],
        "line": 206
      },
      "16": {
        "loc": {
          "start": {
            "line": 243,
            "column": 13
          },
          "end": {
            "line": 243,
            "column": 31
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 243,
              "column": 13
            },
            "end": {
              "line": 243,
              "column": 25
            }
          },
          {
            "start": {
              "line": 243,
              "column": 29
            },
            "end": {
              "line": 243,
              "column": 31
            }
          }
        ],
        "line": 243
      },
      "17": {
        "loc": {
          "start": {
            "line": 244,
            "column": 13
          },
          "end": {
            "line": 244,
            "column": 31
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 244,
              "column": 13
            },
            "end": {
              "line": 244,
              "column": 25
            }
          },
          {
            "start": {
              "line": 244,
              "column": 29
            },
            "end": {
              "line": 244,
              "column": 31
            }
          }
        ],
        "line": 244
      },
      "18": {
        "loc": {
          "start": {
            "line": 276,
            "column": 24
          },
          "end": {
            "line": 276,
            "column": 73
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 276,
              "column": 24
            },
            "end": {
              "line": 276,
              "column": 67
            }
          },
          {
            "start": {
              "line": 276,
              "column": 71
            },
            "end": {
              "line": 276,
              "column": 73
            }
          }
        ],
        "line": 276
      },
      "19": {
        "loc": {
          "start": {
            "line": 286,
            "column": 28
          },
          "end": {
            "line": 286,
            "column": 48
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 286,
              "column": 28
            },
            "end": {
              "line": 286,
              "column": 35
            }
          },
          {
            "start": {
              "line": 286,
              "column": 39
            },
            "end": {
              "line": 286,
              "column": 48
            }
          }
        ],
        "line": 286
      },
      "20": {
        "loc": {
          "start": {
            "line": 288,
            "column": 23
          },
          "end": {
            "line": 288,
            "column": 30
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 288,
              "column": 23
            },
            "end": {
              "line": 288,
              "column": 24
            }
          },
          {
            "start": {
              "line": 288,
              "column": 28
            },
            "end": {
              "line": 288,
              "column": 30
            }
          }
        ],
        "line": 288
      },
      "21": {
        "loc": {
          "start": {
            "line": 289,
            "column": 44
          },
          "end": {
            "line": 289,
            "column": 51
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 289,
              "column": 44
            },
            "end": {
              "line": 289,
              "column": 45
            }
          },
          {
            "start": {
              "line": 289,
              "column": 49
            },
            "end": {
              "line": 289,
              "column": 51
            }
          }
        ],
        "line": 289
      },
      "22": {
        "loc": {
          "start": {
            "line": 294,
            "column": 16
          },
          "end": {
            "line": 294,
            "column": 67
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 294,
              "column": 16
            },
            "end": {
              "line": 294,
              "column": 61
            }
          },
          {
            "start": {
              "line": 294,
              "column": 65
            },
            "end": {
              "line": 294,
              "column": 67
            }
          }
        ],
        "line": 294
      },
      "23": {
        "loc": {
          "start": {
            "line": 317,
            "column": 18
          },
          "end": {
            "line": 321,
            "column": 19
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 317,
              "column": 18
            },
            "end": {
              "line": 321,
              "column": 19
            }
          },
          {
            "start": {
              "line": 319,
              "column": 25
            },
            "end": {
              "line": 321,
              "column": 19
            }
          }
        ],
        "line": 317
      },
      "24": {
        "loc": {
          "start": {
            "line": 341,
            "column": 24
          },
          "end": {
            "line": 341,
            "column": 61
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 341,
              "column": 24
            },
            "end": {
              "line": 341,
              "column": 55
            }
          },
          {
            "start": {
              "line": 341,
              "column": 59
            },
            "end": {
              "line": 341,
              "column": 61
            }
          }
        ],
        "line": 341
      },
      "25": {
        "loc": {
          "start": {
            "line": 349,
            "column": 25
          },
          "end": {
            "line": 349,
            "column": 41
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 349,
              "column": 25
            },
            "end": {
              "line": 349,
              "column": 36
            }
          },
          {
            "start": {
              "line": 349,
              "column": 40
            },
            "end": {
              "line": 349,
              "column": 41
            }
          }
        ],
        "line": 349
      },
      "26": {
        "loc": {
          "start": {
            "line": 350,
            "column": 26
          },
          "end": {
            "line": 350,
            "column": 44
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 350,
              "column": 26
            },
            "end": {
              "line": 350,
              "column": 38
            }
          },
          {
            "start": {
              "line": 350,
              "column": 42
            },
            "end": {
              "line": 350,
              "column": 44
            }
          }
        ],
        "line": 350
      }
    },
    "fnMap": {
      "0": {
        "name": "countingStars",
        "decl": {
          "start": {
            "line": 28,
            "column": 9
          },
          "end": {
            "line": 28,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 28,
            "column": 33
          },
          "end": {
            "line": 40,
            "column": 1
          }
        },
        "line": 28
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 41,
            "column": 20
          },
          "end": {
            "line": 41,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 41,
            "column": 26
          },
          "end": {
            "line": 357,
            "column": 1
          }
        },
        "line": 41
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 50,
            "column": 6
          },
          "end": {
            "line": 50,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 50,
            "column": 27
          },
          "end": {
            "line": 78,
            "column": 7
          }
        },
        "line": 50
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 56,
            "column": 23
          },
          "end": {
            "line": 56,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 56,
            "column": 29
          },
          "end": {
            "line": 67,
            "column": 15
          }
        },
        "line": 56
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 62,
            "column": 24
          },
          "end": {
            "line": 62,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 62,
            "column": 30
          },
          "end": {
            "line": 66,
            "column": 17
          }
        },
        "line": 62
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 63,
            "column": 33
          },
          "end": {
            "line": 63,
            "column": 34
          }
        },
        "loc": {
          "start": {
            "line": 63,
            "column": 39
          },
          "end": {
            "line": 65,
            "column": 19
          }
        },
        "line": 63
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 84,
            "column": 6
          },
          "end": {
            "line": 84,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 84,
            "column": 19
          },
          "end": {
            "line": 88,
            "column": 7
          }
        },
        "line": 84
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 94,
            "column": 14
          },
          "end": {
            "line": 94,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 94,
            "column": 32
          },
          "end": {
            "line": 126,
            "column": 7
          }
        },
        "line": 94
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 153,
            "column": 14
          },
          "end": {
            "line": 153,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 153,
            "column": 24
          },
          "end": {
            "line": 159,
            "column": 7
          }
        },
        "line": 153
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 165,
            "column": 6
          },
          "end": {
            "line": 165,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 165,
            "column": 16
          },
          "end": {
            "line": 167,
            "column": 7
          }
        },
        "line": 165
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 172,
            "column": 14
          },
          "end": {
            "line": 172,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 173,
            "column": 8
          },
          "end": {
            "line": 189,
            "column": 11
          }
        },
        "line": 173
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 193,
            "column": 18
          },
          "end": {
            "line": 193,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 193,
            "column": 24
          },
          "end": {
            "line": 203,
            "column": 3
          }
        },
        "line": 193
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 205,
            "column": 19
          },
          "end": {
            "line": 205,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 205,
            "column": 25
          },
          "end": {
            "line": 207,
            "column": 3
          }
        },
        "line": 205
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 270,
            "column": 24
          },
          "end": {
            "line": 270,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 270,
            "column": 31
          },
          "end": {
            "line": 273,
            "column": 15
          }
        },
        "line": 270
      },
      "14": {
        "name": "(anonymous_14)",
        "decl": {
          "start": {
            "line": 277,
            "column": 16
          },
          "end": {
            "line": 277,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 277,
            "column": 36
          },
          "end": {
            "line": 280,
            "column": 17
          }
        },
        "line": 277
      },
      "15": {
        "name": "(anonymous_15)",
        "decl": {
          "start": {
            "line": 287,
            "column": 24
          },
          "end": {
            "line": 287,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 287,
            "column": 31
          },
          "end": {
            "line": 290,
            "column": 15
          }
        },
        "line": 287
      },
      "16": {
        "name": "(anonymous_16)",
        "decl": {
          "start": {
            "line": 295,
            "column": 20
          },
          "end": {
            "line": 295,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 295,
            "column": 35
          },
          "end": {
            "line": 298,
            "column": 15
          }
        },
        "line": 295
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
            "column": 35
          },
          "end": {
            "line": 307,
            "column": 15
          }
        },
        "line": 304
      },
      "18": {
        "name": "(anonymous_18)",
        "decl": {
          "start": {
            "line": 316,
            "column": 26
          },
          "end": {
            "line": 316,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 316,
            "column": 33
          },
          "end": {
            "line": 323,
            "column": 17
          }
        },
        "line": 316
      },
      "19": {
        "name": "(anonymous_19)",
        "decl": {
          "start": {
            "line": 336,
            "column": 25
          },
          "end": {
            "line": 336,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 336,
            "column": 36
          },
          "end": {
            "line": 336,
            "column": 70
          }
        },
        "line": 336
      },
      "20": {
        "name": "(anonymous_20)",
        "decl": {
          "start": {
            "line": 344,
            "column": 22
          },
          "end": {
            "line": 344,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 344,
            "column": 48
          },
          "end": {
            "line": 351,
            "column": 13
          }
        },
        "line": 344
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 26,
          "column": 17
        },
        "end": {
          "line": 26,
          "column": 27
        }
      },
      "1": {
        "start": {
          "line": 29,
          "column": 2
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "2": {
        "start": {
          "line": 30,
          "column": 4
        },
        "end": {
          "line": 30,
          "column": 16
        }
      },
      "3": {
        "start": {
          "line": 31,
          "column": 9
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "4": {
        "start": {
          "line": 32,
          "column": 4
        },
        "end": {
          "line": 32,
          "column": 18
        }
      },
      "5": {
        "start": {
          "line": 33,
          "column": 9
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "6": {
        "start": {
          "line": 34,
          "column": 4
        },
        "end": {
          "line": 34,
          "column": 20
        }
      },
      "7": {
        "start": {
          "line": 35,
          "column": 9
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 36,
          "column": 4
        },
        "end": {
          "line": 36,
          "column": 22
        }
      },
      "9": {
        "start": {
          "line": 37,
          "column": 9
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "10": {
        "start": {
          "line": 38,
          "column": 4
        },
        "end": {
          "line": 38,
          "column": 24
        }
      },
      "11": {
        "start": {
          "line": 41,
          "column": 20
        },
        "end": {
          "line": 357,
          "column": 1
        }
      },
      "12": {
        "start": {
          "line": 42,
          "column": 16
        },
        "end": {
          "line": 42,
          "column": 32
        }
      },
      "13": {
        "start": {
          "line": 43,
          "column": 26
        },
        "end": {
          "line": 43,
          "column": 60
        }
      },
      "14": {
        "start": {
          "line": 44,
          "column": 25
        },
        "end": {
          "line": 44,
          "column": 58
        }
      },
      "15": {
        "start": {
          "line": 45,
          "column": 40
        },
        "end": {
          "line": 192,
          "column": 3
        }
      },
      "16": {
        "start": {
          "line": 51,
          "column": 8
        },
        "end": {
          "line": 77,
          "column": 10
        }
      },
      "17": {
        "start": {
          "line": 57,
          "column": 16
        },
        "end": {
          "line": 66,
          "column": 19
        }
      },
      "18": {
        "start": {
          "line": 63,
          "column": 18
        },
        "end": {
          "line": 65,
          "column": 21
        }
      },
      "19": {
        "start": {
          "line": 64,
          "column": 20
        },
        "end": {
          "line": 64,
          "column": 47
        }
      },
      "20": {
        "start": {
          "line": 85,
          "column": 8
        },
        "end": {
          "line": 87,
          "column": 10
        }
      },
      "21": {
        "start": {
          "line": 95,
          "column": 8
        },
        "end": {
          "line": 125,
          "column": 10
        }
      },
      "22": {
        "start": {
          "line": 154,
          "column": 8
        },
        "end": {
          "line": 158,
          "column": 10
        }
      },
      "23": {
        "start": {
          "line": 166,
          "column": 8
        },
        "end": {
          "line": 166,
          "column": 61
        }
      },
      "24": {
        "start": {
          "line": 173,
          "column": 8
        },
        "end": {
          "line": 189,
          "column": 11
        }
      },
      "25": {
        "start": {
          "line": 193,
          "column": 17
        },
        "end": {
          "line": 203,
          "column": 6
        }
      },
      "26": {
        "start": {
          "line": 194,
          "column": 4
        },
        "end": {
          "line": 202,
          "column": 5
        }
      },
      "27": {
        "start": {
          "line": 195,
          "column": 6
        },
        "end": {
          "line": 199,
          "column": 7
        }
      },
      "28": {
        "start": {
          "line": 196,
          "column": 8
        },
        "end": {
          "line": 196,
          "column": 62
        }
      },
      "29": {
        "start": {
          "line": 198,
          "column": 8
        },
        "end": {
          "line": 198,
          "column": 18
        }
      },
      "30": {
        "start": {
          "line": 201,
          "column": 6
        },
        "end": {
          "line": 201,
          "column": 16
        }
      },
      "31": {
        "start": {
          "line": 205,
          "column": 18
        },
        "end": {
          "line": 207,
          "column": 6
        }
      },
      "32": {
        "start": {
          "line": 206,
          "column": 4
        },
        "end": {
          "line": 206,
          "column": 45
        }
      },
      "33": {
        "start": {
          "line": 208,
          "column": 24
        },
        "end": {
          "line": 208,
          "column": 72
        }
      },
      "34": {
        "start": {
          "line": 209,
          "column": 32
        },
        "end": {
          "line": 209,
          "column": 44
        }
      },
      "35": {
        "start": {
          "line": 210,
          "column": 36
        },
        "end": {
          "line": 210,
          "column": 59
        }
      },
      "36": {
        "start": {
          "line": 211,
          "column": 22
        },
        "end": {
          "line": 211,
          "column": 48
        }
      },
      "37": {
        "start": {
          "line": 212,
          "column": 24
        },
        "end": {
          "line": 212,
          "column": 49
        }
      },
      "38": {
        "start": {
          "line": 213,
          "column": 32
        },
        "end": {
          "line": 213,
          "column": 43
        }
      },
      "39": {
        "start": {
          "line": 214,
          "column": 34
        },
        "end": {
          "line": 214,
          "column": 46
        }
      },
      "40": {
        "start": {
          "line": 215,
          "column": 30
        },
        "end": {
          "line": 215,
          "column": 47
        }
      },
      "41": {
        "start": {
          "line": 217,
          "column": 42
        },
        "end": {
          "line": 222,
          "column": 3
        }
      },
      "42": {
        "start": {
          "line": 224,
          "column": 43
        },
        "end": {
          "line": 229,
          "column": 3
        }
      },
      "43": {
        "start": {
          "line": 235,
          "column": 6
        },
        "end": {
          "line": 248,
          "column": 4
        }
      },
      "44": {
        "start": {
          "line": 250,
          "column": 2
        },
        "end": {
          "line": 356,
          "column": 4
        }
      },
      "45": {
        "start": {
          "line": 271,
          "column": 16
        },
        "end": {
          "line": 271,
          "column": 25
        }
      },
      "46": {
        "start": {
          "line": 272,
          "column": 16
        },
        "end": {
          "line": 272,
          "column": 62
        }
      },
      "47": {
        "start": {
          "line": 277,
          "column": 36
        },
        "end": {
          "line": 280,
          "column": 17
        }
      },
      "48": {
        "start": {
          "line": 288,
          "column": 16
        },
        "end": {
          "line": 288,
          "column": 32
        }
      },
      "49": {
        "start": {
          "line": 289,
          "column": 16
        },
        "end": {
          "line": 289,
          "column": 53
        }
      },
      "50": {
        "start": {
          "line": 295,
          "column": 35
        },
        "end": {
          "line": 298,
          "column": 15
        }
      },
      "51": {
        "start": {
          "line": 305,
          "column": 16
        },
        "end": {
          "line": 305,
          "column": 34
        }
      },
      "52": {
        "start": {
          "line": 306,
          "column": 16
        },
        "end": {
          "line": 306,
          "column": 30
        }
      },
      "53": {
        "start": {
          "line": 317,
          "column": 18
        },
        "end": {
          "line": 321,
          "column": 19
        }
      },
      "54": {
        "start": {
          "line": 318,
          "column": 20
        },
        "end": {
          "line": 318,
          "column": 65
        }
      },
      "55": {
        "start": {
          "line": 320,
          "column": 20
        },
        "end": {
          "line": 320,
          "column": 63
        }
      },
      "56": {
        "start": {
          "line": 322,
          "column": 18
        },
        "end": {
          "line": 322,
          "column": 34
        }
      },
      "57": {
        "start": {
          "line": 336,
          "column": 36
        },
        "end": {
          "line": 336,
          "column": 70
        }
      },
      "58": {
        "start": {
          "line": 345,
          "column": 14
        },
        "end": {
          "line": 348,
          "column": 17
        }
      },
      "59": {
        "start": {
          "line": 349,
          "column": 14
        },
        "end": {
          "line": 349,
          "column": 43
        }
      },
      "60": {
        "start": {
          "line": 350,
          "column": 14
        },
        "end": {
          "line": 350,
          "column": 46
        }
      }
    }
  }
}