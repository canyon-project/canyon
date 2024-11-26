window["components/CanyonReport/TreeTable.tsx"] = {
  "content": "import { FileOutlined, FolderFilled } from \"@ant-design/icons\";\n\nimport { getCOlor, percent } from \"../../helpers/utils/common.ts\";\nimport { checkSuffix } from \"./helper.tsx\";\n\nconst CanyonReportTreeTable = ({\n  dataSource,\n  loading,\n  activatedPath,\n  onSelect,\n  onlyChange,\n}) => {\n  const { t } = useTranslation();\n  const newlinesColumns = onlyChange\n    ? [\n        {\n          title: t(\"projects.newlines\"),\n          width: \"200px\",\n          sorter: (a, b) => {\n            return a.summary.newlines.pct - b.summary.newlines.pct;\n          },\n          dataIndex: [\"summary\", \"newlines\", \"total\"],\n          render(text, record) {\n            return (\n              <Space>\n                <Progress\n                  percent={record.summary.newlines.pct}\n                  strokeLinecap=\"butt\"\n                  size={\"small\"}\n                  style={{ width: \"100px\" }}\n                  strokeColor={getCOlor(record.summary.newlines.pct)}\n                  className={\"pr-5\"}\n                  status={\"normal\"}\n                />\n                <span style={{ fontSize: \"10px\" }}>\n                  ({record.summary.newlines.covered}/\n                  {record.summary.newlines.total})\n                </span>\n                {/*{record.summary.newlines.covered}%*/}\n              </Space>\n            );\n          },\n        },\n      ]\n    : [];\n  // const newlinesColumns = [];\n  return (\n    <div>\n      <ConfigProvider\n        theme={{\n          token: {\n            borderRadius: 0,\n          },\n        }}\n      >\n        <Table\n          loading={loading}\n          bordered={true}\n          pagination={false}\n          size={\"small\"}\n          // children={false}\n          dataSource={dataSource}\n          // onRow={(record, rowIndex) => {\n          //   return {\n          //     onClick: (event) => {\n          //       console.log(record);\n          //       onSelect(record);\n          //     }, // click row\n          //   };\n          // }}\n          columns={[\n            {\n              title: t(\"projects.detail.files\"),\n              key: \"path\",\n              dataIndex: \"path\",\n              render(text, record) {\n                return (\n                  <a\n                    className={\"flex gap-1\"}\n                    onClick={() => {\n                      onSelect(record);\n                    }}\n                  >\n                    {text.includes(\".\") && checkSuffix(text) ? (\n                      <FileOutlined style={{ fontSize: \"16px\" }} />\n                    ) : (\n                      <FolderFilled style={{ fontSize: \"16px\" }} />\n                    )}\n                    {text.split(\"/\").at(-1)}\n                  </a>\n                );\n              },\n            },\n\n            {\n              title: t(\"common.total\"),\n              key: \"total\",\n              dataIndex: [\"summary\", \"statements\", \"total\"],\n              sorter(a, b) {\n                return a.summary.statements.total - b.summary.statements.total;\n              },\n            },\n            {\n              title: t(\"common.covered\"),\n              key: \"covered\",\n              dataIndex: [\"summary\", \"statements\", \"covered\"],\n              sorter(a, b) {\n                return (\n                  a.summary.statements.covered - b.summary.statements.covered\n                );\n              },\n            },\n          ]\n            .concat(newlinesColumns)\n            .concat([\n              {\n                title: t(\"projects.config.coverage\") + \" %\",\n                width: \"300px\",\n                key: \"c\",\n                dataIndex: [\"summary\", \"statements\", \"pct\"],\n                sorter(a, b) {\n                  return a.summary.statements.pct - b.summary.statements.pct;\n                },\n                render(text) {\n                  return (\n                    <Progress\n                      percent={text}\n                      strokeLinecap=\"butt\"\n                      size={\"small\"}\n                      strokeColor={getCOlor(text)}\n                      className={\"pr-5\"}\n                      status={\"normal\"}\n                    />\n                  );\n                },\n              },\n            ])}\n        />\n      </ConfigProvider>\n    </div>\n  );\n};\n\nexport default CanyonReportTreeTable;\n",
  "coverage": {
    "path": "components/CanyonReport/TreeTable.tsx",
    "b": {
      "0": [
        0,
        0
      ],
      "1": [
        0,
        0
      ],
      "2": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0
    },
    "s": {
      "0": 8,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 14,
            "column": 26
          },
          "end": {
            "line": 45,
            "column": 8
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 15,
              "column": 6
            },
            "end": {
              "line": 44,
              "column": 7
            }
          },
          {
            "start": {
              "line": 45,
              "column": 6
            },
            "end": {
              "line": 45,
              "column": 8
            }
          }
        ],
        "line": 14
      },
      "1": {
        "loc": {
          "start": {
            "line": 84,
            "column": 21
          },
          "end": {
            "line": 88,
            "column": 21
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 85,
              "column": 22
            },
            "end": {
              "line": 85,
              "column": 67
            }
          },
          {
            "start": {
              "line": 87,
              "column": 22
            },
            "end": {
              "line": 87,
              "column": 67
            }
          }
        ],
        "line": 84
      },
      "2": {
        "loc": {
          "start": {
            "line": 84,
            "column": 21
          },
          "end": {
            "line": 84,
            "column": 60
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 84,
              "column": 21
            },
            "end": {
              "line": 84,
              "column": 39
            }
          },
          {
            "start": {
              "line": 84,
              "column": 43
            },
            "end": {
              "line": 84,
              "column": 60
            }
          }
        ],
        "line": 84
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 6,
            "column": 30
          },
          "end": {
            "line": 6,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 12,
            "column": 6
          },
          "end": {
            "line": 142,
            "column": 1
          }
        },
        "line": 12
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 19,
            "column": 18
          },
          "end": {
            "line": 19,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 19,
            "column": 28
          },
          "end": {
            "line": 21,
            "column": 11
          }
        },
        "line": 19
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 23,
            "column": 10
          },
          "end": {
            "line": 23,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 23,
            "column": 31
          },
          "end": {
            "line": 42,
            "column": 11
          }
        },
        "line": 23
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 76,
            "column": 14
          },
          "end": {
            "line": 76,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 76,
            "column": 35
          },
          "end": {
            "line": 92,
            "column": 15
          }
        },
        "line": 76
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 80,
            "column": 29
          },
          "end": {
            "line": 80,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 80,
            "column": 35
          },
          "end": {
            "line": 82,
            "column": 21
          }
        },
        "line": 80
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 99,
            "column": 14
          },
          "end": {
            "line": 99,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 99,
            "column": 27
          },
          "end": {
            "line": 101,
            "column": 15
          }
        },
        "line": 99
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 107,
            "column": 14
          },
          "end": {
            "line": 107,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 107,
            "column": 27
          },
          "end": {
            "line": 111,
            "column": 15
          }
        },
        "line": 107
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 121,
            "column": 16
          },
          "end": {
            "line": 121,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 121,
            "column": 29
          },
          "end": {
            "line": 123,
            "column": 17
          }
        },
        "line": 121
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 124,
            "column": 16
          },
          "end": {
            "line": 124,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 124,
            "column": 29
          },
          "end": {
            "line": 135,
            "column": 17
          }
        },
        "line": 124
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 6,
          "column": 30
        },
        "end": {
          "line": 142,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 13,
          "column": 16
        },
        "end": {
          "line": 13,
          "column": 32
        }
      },
      "2": {
        "start": {
          "line": 14,
          "column": 26
        },
        "end": {
          "line": 45,
          "column": 8
        }
      },
      "3": {
        "start": {
          "line": 20,
          "column": 12
        },
        "end": {
          "line": 20,
          "column": 67
        }
      },
      "4": {
        "start": {
          "line": 24,
          "column": 12
        },
        "end": {
          "line": 41,
          "column": 14
        }
      },
      "5": {
        "start": {
          "line": 47,
          "column": 2
        },
        "end": {
          "line": 141,
          "column": 4
        }
      },
      "6": {
        "start": {
          "line": 77,
          "column": 16
        },
        "end": {
          "line": 91,
          "column": 18
        }
      },
      "7": {
        "start": {
          "line": 81,
          "column": 22
        },
        "end": {
          "line": 81,
          "column": 39
        }
      },
      "8": {
        "start": {
          "line": 100,
          "column": 16
        },
        "end": {
          "line": 100,
          "column": 79
        }
      },
      "9": {
        "start": {
          "line": 108,
          "column": 16
        },
        "end": {
          "line": 110,
          "column": 18
        }
      },
      "10": {
        "start": {
          "line": 122,
          "column": 18
        },
        "end": {
          "line": 122,
          "column": 77
        }
      },
      "11": {
        "start": {
          "line": 125,
          "column": 18
        },
        "end": {
          "line": 134,
          "column": 20
        }
      }
    }
  }
}