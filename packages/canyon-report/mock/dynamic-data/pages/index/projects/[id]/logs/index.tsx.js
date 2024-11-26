window["pages/index/projects/[id]/logs/index.tsx"] = {
  "content": "import ProjectLogsChart from \"@/pages/index/projects/[id]/logs/helper/Chart.tsx\";\nimport { GetCoverageLogsDocument } from \"@/helpers/backend/gen/graphql.ts\";\nimport { useQuery } from \"@apollo/client\";\n\nconst dataSource = [\n  {\n    key: \"1\",\n    name: \"胡彦斌\",\n    age: 32,\n    address: \"西湖区湖底公园1号\",\n  },\n  {\n    key: \"2\",\n    name: \"胡彦祖\",\n    age: 42,\n    address: \"西湖区湖底公园1号\",\n  },\n];\n\nconst columns = [\n  {\n    title: \"ID\",\n    dataIndex: \"id\",\n    key: \"id\",\n  },\n  {\n    title: \"Project ID\",\n    dataIndex: \"projectID\",\n    key: \"projectID\",\n  },\n  {\n    title: \"Sha\",\n    dataIndex: \"sha\",\n    key: \"sha\",\n    render: (text) => {\n      return text.slice(0, 7);\n    },\n  },\n  {\n    title: \"Report ID\",\n    dataIndex: \"reportID\",\n    key: \"reportID\",\n    //   省略\n    ellipsis: true,\n  },\n  {\n    title: \"Size\",\n    dataIndex: \"size\",\n    key: \"size\",\n  },\n  {\n    title: \"Tags\",\n    dataIndex: \"tags\",\n    render: (tags) => {\n      return tags.map((tag) => {\n        return (\n          <Tag color=\"blue\" key={tag.value}>\n            {tag.label}\n          </Tag>\n        );\n      });\n    },\n  },\n  {\n    title: \"Created At\",\n    dataIndex: \"createdAt\",\n    key: \"createdAt\",\n  },\n];\n\nconst ProjectLogsPage = () => {\n  // GetReportLogs\n  // projectID 可选\n  // sha 可选\n  // reportID 可选\n  // tags 可选 {name:'zt'}\n  const { data } = useQuery(GetCoverageLogsDocument);\n  return (\n    <div>\n      <Table dataSource={data?.getCoverageLogs.data || []} columns={columns} />\n      {/*<ProjectLogsChart />*/}\n    </div>\n  );\n};\n\nexport default ProjectLogsPage;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/logs/index.tsx",
    "b": {
      "0": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 8,
      "6": 0,
      "7": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 80,
            "column": 25
          },
          "end": {
            "line": 80,
            "column": 57
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 80,
              "column": 25
            },
            "end": {
              "line": 80,
              "column": 51
            }
          },
          {
            "start": {
              "line": 80,
              "column": 55
            },
            "end": {
              "line": 80,
              "column": 57
            }
          }
        ],
        "line": 80
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 35,
            "column": 12
          },
          "end": {
            "line": 35,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 35,
            "column": 22
          },
          "end": {
            "line": 37,
            "column": 5
          }
        },
        "line": 35
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 54,
            "column": 12
          },
          "end": {
            "line": 54,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 54,
            "column": 22
          },
          "end": {
            "line": 62,
            "column": 5
          }
        },
        "line": 54
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 55,
            "column": 22
          },
          "end": {
            "line": 55,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 55,
            "column": 31
          },
          "end": {
            "line": 61,
            "column": 7
          }
        },
        "line": 55
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 71,
            "column": 24
          },
          "end": {
            "line": 71,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 71,
            "column": 30
          },
          "end": {
            "line": 84,
            "column": 1
          }
        },
        "line": 71
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 5,
          "column": 19
        },
        "end": {
          "line": 18,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 20,
          "column": 16
        },
        "end": {
          "line": 69,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 36,
          "column": 6
        },
        "end": {
          "line": 36,
          "column": 30
        }
      },
      "3": {
        "start": {
          "line": 55,
          "column": 6
        },
        "end": {
          "line": 61,
          "column": 9
        }
      },
      "4": {
        "start": {
          "line": 56,
          "column": 8
        },
        "end": {
          "line": 60,
          "column": 10
        }
      },
      "5": {
        "start": {
          "line": 71,
          "column": 24
        },
        "end": {
          "line": 84,
          "column": 1
        }
      },
      "6": {
        "start": {
          "line": 77,
          "column": 19
        },
        "end": {
          "line": 77,
          "column": 52
        }
      },
      "7": {
        "start": {
          "line": 78,
          "column": 2
        },
        "end": {
          "line": 83,
          "column": 4
        }
      }
    }
  }
}