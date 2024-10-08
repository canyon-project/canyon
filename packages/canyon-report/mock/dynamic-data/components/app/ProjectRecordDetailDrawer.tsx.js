window["components/app/ProjectRecordDetailDrawer.tsx"] = {
  "content": "import { useQuery } from \"@apollo/client\";\nimport dayjs from \"dayjs\";\nimport { useTranslation } from \"react-i18next\";\nimport { Link, useParams } from \"react-router-dom\";\n\nimport { GetProjectRecordDetailByShaDocument } from \"../../helpers/backend/gen/graphql.ts\";\nconst { Text } = Typography;\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nconsole.log(useRequest, axios);\nconst ProjectRecordDetailDrawer = ({ open, onClose, sha }: any) => {\n  const pam = useParams();\n  const { data, loading } = useQuery(GetProjectRecordDetailByShaDocument, {\n    variables: {\n      projectID: pam.id as string,\n      sha: sha,\n    },\n  });\n\n  const { t } = useTranslation();\n  // const pam = useParams();\n  const columns = [\n    {\n      title: t(\"projects.report_id\"),\n      dataIndex: \"reportID\",\n      render(_: any): JSX.Element {\n        // 标识位（勿动）\n        return <div className={\"text-ellipsis w-[240px]\"}>{_}</div>;\n      },\n    },\n    {\n      title: t(\"projects.statements\"),\n      dataIndex: \"statements\",\n      render(_: any): JSX.Element {\n        return <span>{_}%</span>;\n      },\n    },\n    {\n      title: t(\"projects.newlines\"),\n      dataIndex: \"newlines\",\n      render(_: any): JSX.Element {\n        return <span>{_}%</span>;\n      },\n    },\n    {\n      title: t(\"projects.reporter\"),\n      dataIndex: \"reporterUsername\",\n      render(_: any, t: any): any {\n        return (\n          <div>\n            <Avatar src={t.reporterAvatar} />\n            <Text style={{ marginLeft: \"10px\" }}>{t.reporterUsername}</Text>\n          </div>\n        );\n      },\n    },\n    {\n      title: t(\"projects.report_time\"),\n      dataIndex: \"lastReportTime\",\n      render(_: any) {\n        return dayjs(_).format(\"MM-DD HH:mm\");\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      render(_: any) {\n        return (\n          <div>\n            <Link\n              to={{\n                pathname: `/projects/${pam.id}/commits/${_.sha}`,\n                search: `?report_id=${encodeURIComponent(_.reportID)}`,\n              }}\n            >\n              {t(\"common.detail\")}\n            </Link>\n          </div>\n        );\n      },\n    },\n  ];\n\n  return (\n    <>\n      <Drawer\n        title={t(\"projects.reported_details\") + \"-\" + sha}\n        placement=\"right\"\n        width={\"85%\"}\n        onClose={onClose}\n        open={open}\n      >\n        <Table\n          loading={loading}\n          size={\"small\"}\n          rowKey={\"id\"}\n          columns={columns}\n          dataSource={data?.getProjectRecordDetailBySha || []}\n        />\n      </Drawer>\n    </>\n  );\n};\n\nexport default ProjectRecordDetailDrawer;\n",
  "coverage": {
    "path": "components/app/ProjectRecordDetailDrawer.tsx",
    "b": {
      "0": [
        0,
        10
      ],
      "1": [
        0,
        0
      ],
      "2": [
        54,
        27
      ]
    },
    "f": {
      "0": 54,
      "1": 10,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 10,
      "6": 10,
      "7": 10,
      "8": 10,
      "9": 10
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 54,
      "4": 54,
      "5": 54,
      "6": 54,
      "7": 10,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 10,
      "16": 10,
      "17": 10,
      "18": 10,
      "19": 10,
      "20": 10,
      "21": 54
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 27,
            "column": 16
          },
          "end": {
            "line": 70,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 27,
              "column": 16
            },
            "end": {
              "line": 70,
              "column": 9
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 27
      },
      "1": {
        "loc": {
          "start": {
            "line": 54,
            "column": 7
          },
          "end": {
            "line": 61,
            "column": 13
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 54,
              "column": 7
            },
            "end": {
              "line": 54,
              "column": 23
            }
          },
          {
            "start": {
              "line": 55,
              "column": 8
            },
            "end": {
              "line": 61,
              "column": 13
            }
          }
        ],
        "line": 54
      },
      "2": {
        "loc": {
          "start": {
            "line": 140,
            "column": 22
          },
          "end": {
            "line": 140,
            "column": 61
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 140,
              "column": 22
            },
            "end": {
              "line": 140,
              "column": 55
            }
          },
          {
            "start": {
              "line": 140,
              "column": 59
            },
            "end": {
              "line": 140,
              "column": 61
            }
          }
        ],
        "line": 140
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 11,
            "column": 34
          },
          "end": {
            "line": 11,
            "column": 35
          }
        },
        "loc": {
          "start": {
            "line": 11,
            "column": 67
          },
          "end": {
            "line": 145,
            "column": 1
          }
        },
        "line": 11
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 26,
            "column": 6
          },
          "end": {
            "line": 26,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 26,
            "column": 34
          },
          "end": {
            "line": 72,
            "column": 7
          }
        },
        "line": 26
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 30,
            "column": 26
          },
          "end": {
            "line": 30,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 30,
            "column": 44
          },
          "end": {
            "line": 64,
            "column": 1
          }
        },
        "line": 30
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 32,
            "column": 30
          },
          "end": {
            "line": 32,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 33,
            "column": 4
          },
          "end": {
            "line": 39,
            "column": 8
          }
        },
        "line": 33
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 37,
            "column": 12
          },
          "end": {
            "line": 37,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 37,
            "column": 19
          },
          "end": {
            "line": 39,
            "column": 7
          }
        },
        "line": 37
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 77,
            "column": 6
          },
          "end": {
            "line": 77,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 77,
            "column": 34
          },
          "end": {
            "line": 79,
            "column": 7
          }
        },
        "line": 77
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
            "column": 34
          },
          "end": {
            "line": 86,
            "column": 7
          }
        },
        "line": 84
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 91,
            "column": 6
          },
          "end": {
            "line": 91,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 91,
            "column": 34
          },
          "end": {
            "line": 98,
            "column": 7
          }
        },
        "line": 91
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 103,
            "column": 6
          },
          "end": {
            "line": 103,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 103,
            "column": 21
          },
          "end": {
            "line": 105,
            "column": 7
          }
        },
        "line": 103
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 109,
            "column": 6
          },
          "end": {
            "line": 109,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 109,
            "column": 21
          },
          "end": {
            "line": 122,
            "column": 7
          }
        },
        "line": 109
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 17
        },
        "end": {
          "line": 7,
          "column": 27
        }
      },
      "1": {
        "start": {
          "line": 10,
          "column": 0
        },
        "end": {
          "line": 10,
          "column": 31
        }
      },
      "2": {
        "start": {
          "line": 11,
          "column": 34
        },
        "end": {
          "line": 145,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 12,
          "column": 14
        },
        "end": {
          "line": 12,
          "column": 25
        }
      },
      "4": {
        "start": {
          "line": 13,
          "column": 28
        },
        "end": {
          "line": 18,
          "column": 4
        }
      },
      "5": {
        "start": {
          "line": 20,
          "column": 16
        },
        "end": {
          "line": 20,
          "column": 32
        }
      },
      "6": {
        "start": {
          "line": 22,
          "column": 18
        },
        "end": {
          "line": 124,
          "column": 3
        }
      },
      "7": {
        "start": {
          "line": 27,
          "column": 16
        },
        "end": {
          "line": 70,
          "column": 9
        }
      },
      "8": {
        "start": {
          "line": 30,
          "column": 26
        },
        "end": {
          "line": 64,
          "column": 1
        }
      },
      "9": {
        "start": {
          "line": 31,
          "column": 17
        },
        "end": {
          "line": 31,
          "column": 39
        }
      },
      "10": {
        "start": {
          "line": 32,
          "column": 19
        },
        "end": {
          "line": 40,
          "column": 3
        }
      },
      "11": {
        "start": {
          "line": 33,
          "column": 4
        },
        "end": {
          "line": 39,
          "column": 8
        }
      },
      "12": {
        "start": {
          "line": 38,
          "column": 8
        },
        "end": {
          "line": 38,
          "column": 41
        }
      },
      "13": {
        "start": {
          "line": 41,
          "column": 2
        },
        "end": {
          "line": 63,
          "column": 4
        }
      },
      "14": {
        "start": {
          "line": 67,
          "column": 10
        },
        "end": {
          "line": 69,
          "column": 12
        }
      },
      "15": {
        "start": {
          "line": 71,
          "column": 8
        },
        "end": {
          "line": 71,
          "column": 68
        }
      },
      "16": {
        "start": {
          "line": 78,
          "column": 8
        },
        "end": {
          "line": 78,
          "column": 33
        }
      },
      "17": {
        "start": {
          "line": 85,
          "column": 8
        },
        "end": {
          "line": 85,
          "column": 33
        }
      },
      "18": {
        "start": {
          "line": 92,
          "column": 8
        },
        "end": {
          "line": 97,
          "column": 10
        }
      },
      "19": {
        "start": {
          "line": 104,
          "column": 8
        },
        "end": {
          "line": 104,
          "column": 46
        }
      },
      "20": {
        "start": {
          "line": 110,
          "column": 8
        },
        "end": {
          "line": 121,
          "column": 10
        }
      },
      "21": {
        "start": {
          "line": 126,
          "column": 2
        },
        "end": {
          "line": 144,
          "column": 4
        }
      }
    }
  }
}