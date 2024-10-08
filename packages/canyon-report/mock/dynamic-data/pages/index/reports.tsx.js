window["pages/index/reports.tsx"] = {
  "content": "import ReactECharts from \"echarts-for-react\";\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport { Select, Space, Table } from \"antd\";\nimport { useQuery } from \"@apollo/client\";\nimport { GetProjectsBuOptionsDocument } from \"../../helpers/backend/gen/graphql.ts\";\nimport { CanyonCardPrimary } from \"../../components/old-ui\";\nimport dayjs from \"dayjs\";\n\nconst { RangePicker } = DatePicker;\nconst optionsWithDisabled = [\n  { label: \"图表\", value: \"图表\" },\n  { label: \"表格\", value: \"表格\" },\n  // { label: 'Orange', value: 'Orange', disabled: true },\n];\n\nconst Reports = () => {\n  const [showType, setShowType] = useState(\"图表\");\n  const [bu, setBu] = useState(\"机票\");\n  const [range, setRange] = useState([dayjs().subtract(30, \"days\"), dayjs()]);\n\n  const { data: getProjectsBuOptionsDocumentData } = useQuery(\n    GetProjectsBuOptionsDocument,\n  );\n  const { data: data = [], loading } = useRequest(\n    () =>\n      axios\n        .get(`/api/coverage/reports`, {\n          params: {\n            bu,\n            start: range[0].format(\"YYYY-MM-DD\"),\n            end: range[1].format(\"YYYY-MM-DD\"),\n          },\n        })\n        .then((res) => res.data),\n    {\n      refreshDeps: [bu, range],\n    },\n  );\n\n  const columns = [\n    {\n      title: \"项目\",\n      dataIndex: \"pathWithNamespace\",\n      key: \"pathWithNamespace\",\n    },\n    {\n      title: \"描述\",\n      dataIndex: \"description\",\n      key: \"description\",\n      ellipsis: true,\n      width: \"40%\",\n    },\n    {\n      title: \"UI自动化\",\n      dataIndex: \"auto\",\n      key: \"auto\",\n      sorter: (a, b) => a.auto - b.auto,\n      defaultSortOrder: \"descend\",\n    },\n    {\n      title: \"单元测试\",\n      dataIndex: \"ut\",\n      key: \"ut\",\n      sorter: (a, b) => a.ut - b.ut,\n    },\n  ];\n\n  const opppppp = useMemo(() => {\n    const option = {\n      // title: {\n      //   text: '各仓库覆盖率数据统计'\n      // },\n      tooltip: {\n        trigger: \"axis\",\n        axisPointer: {\n          type: \"shadow\",\n        },\n      },\n      legend: {},\n      grid: {\n        left: \"3%\",\n        right: \"4%\",\n        bottom: \"3%\",\n        containLabel: true,\n      },\n      xAxis: {\n        type: \"value\",\n        boundaryGap: [0, 0.01],\n      },\n      yAxis: {\n        type: \"category\",\n        data: [\"Brazil\", \"Indonesia\", \"USA\", \"India\", \"China\", \"World\"],\n      },\n      series: [\n        {\n          name: \"UI自动化\",\n          type: \"bar\",\n          data: [],\n        },\n        {\n          name: \"单元测试\",\n          type: \"bar\",\n          data: [],\n        },\n      ],\n    };\n    option.yAxis.data = data.map(\n      (item) => item.pathWithNamespace.split(\"/\")[1],\n    );\n    option.series = [\n      {\n        name: \"UI自动化\",\n        type: \"bar\",\n        data: data.map((item) => item.auto),\n        label: {\n          show: true,\n          position: \"right\",\n        },\n      },\n      {\n        name: \"单元测试\",\n        type: \"bar\",\n        data: data.map((item) => item.ut),\n        label: {\n          show: true,\n          position: \"right\",\n        },\n      },\n    ];\n    return option;\n  }, [data]);\n\n  // 输出从\n  return (\n    <CanyonCardPrimary>\n      <div className={\"bg-white dark:bg-[#0F0D28] p-5\"}>\n        <h3 className={\"mb-5\"}>各仓库覆盖率数据统计</h3>\n\n        <Space className={\"mb-5\"}>\n          <Radio.Group\n            options={optionsWithDisabled}\n            onChange={(v) => {\n              setShowType(v.target.value);\n            }}\n            value={showType}\n            optionType=\"button\"\n            buttonStyle=\"solid\"\n          />\n          <Select\n            className={\"w-[200px]\"}\n            value={bu}\n            options={\n              getProjectsBuOptionsDocumentData?.getProjectsBuOptions.map(\n                ({ bu }) => ({\n                  label: `${bu}`,\n                  value: bu,\n                }),\n              ) || []\n            }\n            onChange={(v) => {\n              setBu(v);\n            }}\n          />\n\n          <RangePicker\n            value={range}\n            onChange={(v) => {\n              setRange(v);\n            }}\n            presets={[\n              {\n                label: \"最近30天\",\n                // text: '最近7天',\n                value: [dayjs().subtract(30, \"days\"), dayjs()],\n              },\n              {\n                label: \"6月份\",\n                value: [dayjs(\"2024-06-01\"), dayjs(\"2024-06-30\")],\n              },\n              {\n                label: \"5月份\",\n                value: [dayjs(\"2024-05-01\"), dayjs(\"2024-05-31\")],\n              },\n              {\n                label: \"4月份\",\n                value: [dayjs(\"2024-04-01\"), dayjs(\"2024-04-30\")],\n              },\n            ]}\n          />\n        </Space>\n\n        <Spin spinning={loading}>\n          {showType === \"图表\" ? (\n            data.length > 0 ? (\n              <ReactECharts\n                theme={\n                  localStorage.getItem(\"theme\") === \"dark\"\n                    ? \"dark\"\n                    : {\n                        color: [\"#287DFA\", \"#FFB400\"],\n                      }\n                }\n                option={opppppp}\n                style={{\n                  height: `${data.length * 50 + 100}px`,\n                }}\n              />\n            ) : (\n              <div>暂无数据</div>\n            )\n          ) : (\n            <Table\n              dataSource={data}\n              columns={columns}\n              pagination={false}\n              size={\"small\"}\n            />\n          )}\n        </Spin>\n      </div>\n    </CanyonCardPrimary>\n  );\n};\n\nexport default Reports;\n",
  "coverage": {
    "path": "pages/index/reports.tsx",
    "b": {
      "0": [
        16
      ],
      "1": [
        21,
        11
      ],
      "2": [
        21,
        0
      ],
      "3": [
        5,
        16
      ],
      "4": [
        0,
        5
      ]
    },
    "f": {
      "0": 21,
      "1": 6,
      "2": 5,
      "3": 0,
      "4": 0,
      "5": 21,
      "6": 175,
      "7": 175,
      "8": 175,
      "9": 0,
      "10": 140,
      "11": 0,
      "12": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 21,
      "4": 21,
      "5": 21,
      "6": 21,
      "7": 21,
      "8": 6,
      "9": 5,
      "10": 21,
      "11": 0,
      "12": 0,
      "13": 21,
      "14": 21,
      "15": 21,
      "16": 175,
      "17": 21,
      "18": 175,
      "19": 175,
      "20": 21,
      "21": 21,
      "22": 0,
      "23": 140,
      "24": 0,
      "25": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 25,
            "column": 16
          },
          "end": {
            "line": 25,
            "column": 25
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 25,
              "column": 23
            },
            "end": {
              "line": 25,
              "column": 25
            }
          }
        ],
        "line": 25
      },
      "1": {
        "loc": {
          "start": {
            "line": 154,
            "column": 14
          },
          "end": {
            "line": 159,
            "column": 21
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 154,
              "column": 14
            },
            "end": {
              "line": 159,
              "column": 15
            }
          },
          {
            "start": {
              "line": 159,
              "column": 19
            },
            "end": {
              "line": 159,
              "column": 21
            }
          }
        ],
        "line": 154
      },
      "2": {
        "loc": {
          "start": {
            "line": 194,
            "column": 11
          },
          "end": {
            "line": 219,
            "column": 11
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 195,
              "column": 12
            },
            "end": {
              "line": 211,
              "column": 13
            }
          },
          {
            "start": {
              "line": 213,
              "column": 12
            },
            "end": {
              "line": 218,
              "column": 14
            }
          }
        ],
        "line": 194
      },
      "3": {
        "loc": {
          "start": {
            "line": 195,
            "column": 12
          },
          "end": {
            "line": 211,
            "column": 13
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 196,
              "column": 14
            },
            "end": {
              "line": 208,
              "column": 16
            }
          },
          {
            "start": {
              "line": 210,
              "column": 14
            },
            "end": {
              "line": 210,
              "column": 29
            }
          }
        ],
        "line": 195
      },
      "4": {
        "loc": {
          "start": {
            "line": 198,
            "column": 18
          },
          "end": {
            "line": 202,
            "column": 23
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 199,
              "column": 22
            },
            "end": {
              "line": 199,
              "column": 28
            }
          },
          {
            "start": {
              "line": 200,
              "column": 22
            },
            "end": {
              "line": 202,
              "column": 23
            }
          }
        ],
        "line": 198
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 17,
            "column": 16
          },
          "end": {
            "line": 17,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 17,
            "column": 22
          },
          "end": {
            "line": 224,
            "column": 1
          }
        },
        "line": 17
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 26,
            "column": 4
          },
          "end": {
            "line": 26,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 27,
            "column": 6
          },
          "end": {
            "line": 35,
            "column": 32
          }
        },
        "line": 27
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 35,
            "column": 14
          },
          "end": {
            "line": 35,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 35,
            "column": 23
          },
          "end": {
            "line": 35,
            "column": 31
          }
        },
        "line": 35
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 58,
            "column": 14
          },
          "end": {
            "line": 58,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 58,
            "column": 24
          },
          "end": {
            "line": 58,
            "column": 39
          }
        },
        "line": 58
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 65,
            "column": 14
          },
          "end": {
            "line": 65,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 65,
            "column": 24
          },
          "end": {
            "line": 65,
            "column": 35
          }
        },
        "line": 65
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 69,
            "column": 26
          },
          "end": {
            "line": 69,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 69,
            "column": 32
          },
          "end": {
            "line": 132,
            "column": 3
          }
        },
        "line": 69
      },
      "6": {
        "name": "(anonymous_6)",
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
            "column": 16
          },
          "end": {
            "line": 109,
            "column": 52
          }
        },
        "line": 109
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 115,
            "column": 23
          },
          "end": {
            "line": 115,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 115,
            "column": 33
          },
          "end": {
            "line": 115,
            "column": 42
          }
        },
        "line": 115
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 124,
            "column": 23
          },
          "end": {
            "line": 124,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 124,
            "column": 33
          },
          "end": {
            "line": 124,
            "column": 40
          }
        },
        "line": 124
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 143,
            "column": 22
          },
          "end": {
            "line": 143,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 143,
            "column": 29
          },
          "end": {
            "line": 145,
            "column": 13
          }
        },
        "line": 143
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 155,
            "column": 16
          },
          "end": {
            "line": 155,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 155,
            "column": 29
          },
          "end": {
            "line": 158,
            "column": 17
          }
        },
        "line": 155
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 161,
            "column": 22
          },
          "end": {
            "line": 161,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 161,
            "column": 29
          },
          "end": {
            "line": 163,
            "column": 13
          }
        },
        "line": 161
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 168,
            "column": 22
          },
          "end": {
            "line": 168,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 168,
            "column": 29
          },
          "end": {
            "line": 170,
            "column": 13
          }
        },
        "line": 168
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 10,
          "column": 24
        },
        "end": {
          "line": 10,
          "column": 34
        }
      },
      "1": {
        "start": {
          "line": 11,
          "column": 28
        },
        "end": {
          "line": 15,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 17,
          "column": 16
        },
        "end": {
          "line": 224,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 18,
          "column": 34
        },
        "end": {
          "line": 18,
          "column": 48
        }
      },
      "4": {
        "start": {
          "line": 19,
          "column": 22
        },
        "end": {
          "line": 19,
          "column": 36
        }
      },
      "5": {
        "start": {
          "line": 20,
          "column": 28
        },
        "end": {
          "line": 20,
          "column": 77
        }
      },
      "6": {
        "start": {
          "line": 22,
          "column": 53
        },
        "end": {
          "line": 24,
          "column": 3
        }
      },
      "7": {
        "start": {
          "line": 25,
          "column": 39
        },
        "end": {
          "line": 39,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 27,
          "column": 6
        },
        "end": {
          "line": 35,
          "column": 32
        }
      },
      "9": {
        "start": {
          "line": 35,
          "column": 23
        },
        "end": {
          "line": 35,
          "column": 31
        }
      },
      "10": {
        "start": {
          "line": 41,
          "column": 18
        },
        "end": {
          "line": 67,
          "column": 3
        }
      },
      "11": {
        "start": {
          "line": 58,
          "column": 24
        },
        "end": {
          "line": 58,
          "column": 39
        }
      },
      "12": {
        "start": {
          "line": 65,
          "column": 24
        },
        "end": {
          "line": 65,
          "column": 35
        }
      },
      "13": {
        "start": {
          "line": 69,
          "column": 18
        },
        "end": {
          "line": 132,
          "column": 12
        }
      },
      "14": {
        "start": {
          "line": 70,
          "column": 19
        },
        "end": {
          "line": 107,
          "column": 5
        }
      },
      "15": {
        "start": {
          "line": 108,
          "column": 4
        },
        "end": {
          "line": 110,
          "column": 6
        }
      },
      "16": {
        "start": {
          "line": 109,
          "column": 16
        },
        "end": {
          "line": 109,
          "column": 52
        }
      },
      "17": {
        "start": {
          "line": 111,
          "column": 4
        },
        "end": {
          "line": 130,
          "column": 6
        }
      },
      "18": {
        "start": {
          "line": 115,
          "column": 33
        },
        "end": {
          "line": 115,
          "column": 42
        }
      },
      "19": {
        "start": {
          "line": 124,
          "column": 33
        },
        "end": {
          "line": 124,
          "column": 40
        }
      },
      "20": {
        "start": {
          "line": 131,
          "column": 4
        },
        "end": {
          "line": 131,
          "column": 18
        }
      },
      "21": {
        "start": {
          "line": 135,
          "column": 2
        },
        "end": {
          "line": 223,
          "column": 4
        }
      },
      "22": {
        "start": {
          "line": 144,
          "column": 14
        },
        "end": {
          "line": 144,
          "column": 42
        }
      },
      "23": {
        "start": {
          "line": 155,
          "column": 29
        },
        "end": {
          "line": 158,
          "column": 17
        }
      },
      "24": {
        "start": {
          "line": 162,
          "column": 14
        },
        "end": {
          "line": 162,
          "column": 23
        }
      },
      "25": {
        "start": {
          "line": 169,
          "column": 14
        },
        "end": {
          "line": 169,
          "column": 26
        }
      }
    }
  }
}