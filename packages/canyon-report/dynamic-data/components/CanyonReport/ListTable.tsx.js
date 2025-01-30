window["components/CanyonReport/ListTable.tsx"] = {
  "content": "import Highlighter from \"react-highlight-words\";\n\nimport { getCOlor, percent } from \"../../helpers/utils/common.ts\";\nconst CanyonReportListTable = ({\n  dataSource,\n  loading,\n  keywords,\n  onSelect,\n  onlyChange,\n}) => {\n  const { t } = useTranslation();\n  const newlinesColumns = onlyChange\n    ? [\n        {\n          title: t(\"projects.newlines\"),\n          width: \"240px\",\n          sorter: (a, b) => {\n            return (\n              percent(a.newlines.covered, a.newlines.total) -\n              percent(b.newlines.covered, b.newlines.total)\n            );\n          },\n          // key: 'total',\n          dataIndex: [\"newlines\", \"total\"],\n          render(text, record) {\n            return (\n              <Space>\n                <Progress\n                  percent={percent(\n                    record.newlines.covered,\n                    record.newlines.total,\n                  )}\n                  strokeLinecap=\"butt\"\n                  size={\"small\"}\n                  style={{ width: \"100px\" }}\n                  strokeColor={getCOlor(\n                    percent(record.newlines.covered, record.newlines.total),\n                  )}\n                  className={\"pr-5\"}\n                  status={\"normal\"}\n                />\n                <span style={{ fontSize: \"10px\" }}>\n                  ({record.newlines.covered}/{record.newlines.total})\n                </span>\n              </Space>\n            );\n          },\n        },\n        // {\n        //   title: 'covered',\n        //   key: 'covered',\n        //   dataIndex: ['summary', 'newlines', 'covered'],\n        // },\n      ]\n    : [];\n  return (\n    <div>\n      <ConfigProvider\n        theme={{\n          token: {\n            borderRadius: 0,\n          },\n        }}\n      >\n        {\" \"}\n        <Table\n          bordered={true}\n          pagination={{\n            defaultPageSize: 15,\n          }}\n          // pagination={false}\n          size={\"small\"}\n          dataSource={dataSource}\n          loading={loading}\n          columns={[\n            {\n              title: t(\"projects.detail.files\"),\n              key: \"path\",\n              dataIndex: \"path\",\n              // width: '200px',\n              render(text) {\n                return (\n                  <a\n                    className={\"block break-words w-[420px]\"}\n                    onClick={() => {\n                      onSelect({\n                        path: text,\n                      });\n                    }}\n                  >\n                    <Highlighter\n                      highlightClassName=\"YourHighlightClass\"\n                      searchWords={[keywords]}\n                      autoEscape={true}\n                      textToHighlight={text}\n                    />\n                  </a>\n                );\n              },\n            },\n            {\n              title: t(\"common.total\"),\n              key: \"total\",\n              dataIndex: [\"statements\", \"total\"],\n              sorter(a, b) {\n                return a.statements.total - b.statements.total;\n              },\n            },\n            {\n              title: t(\"common.covered\"),\n              key: \"covered\",\n              dataIndex: [\"statements\", \"covered\"],\n              sorter(a, b) {\n                return a.statements.covered - b.statements.covered;\n              },\n            },\n          ]\n            .concat(newlinesColumns)\n            .concat([\n              {\n                title: t(\"projects.config.coverage\") + \" %\",\n                width: \"300px\",\n                key: \"c\",\n                sorter: (a, b) => {\n                  return a.statements.pct - b.statements.pct;\n                },\n                dataIndex: [\"statements\", \"pct\"],\n                render(text) {\n                  return (\n                    <Progress\n                      percent={text}\n                      strokeLinecap=\"butt\"\n                      size={\"small\"}\n                      strokeColor={getCOlor(text)}\n                      className={\"pr-5\"}\n                      status={\"normal\"}\n                    />\n                  );\n                },\n              },\n            ])}\n        />\n      </ConfigProvider>\n    </div>\n  );\n};\n\nexport default CanyonReportListTable;\n",
  "coverage": {
    "path": "components/CanyonReport/ListTable.tsx",
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
            "line": 12,
            "column": 26
          },
          "end": {
            "line": 55,
            "column": 8
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 13,
              "column": 6
            },
            "end": {
              "line": 54,
              "column": 7
            }
          },
          {
            "start": {
              "line": 55,
              "column": 6
            },
            "end": {
              "line": 55,
              "column": 8
            }
          }
        ],
        "line": 12
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 4,
            "column": 30
          },
          "end": {
            "line": 4,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 6
          },
          "end": {
            "line": 146,
            "column": 1
          }
        },
        "line": 10
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 17,
            "column": 18
          },
          "end": {
            "line": 17,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 17,
            "column": 28
          },
          "end": {
            "line": 22,
            "column": 11
          }
        },
        "line": 17
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 25,
            "column": 10
          },
          "end": {
            "line": 25,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 25,
            "column": 31
          },
          "end": {
            "line": 47,
            "column": 11
          }
        },
        "line": 25
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 81,
            "column": 14
          },
          "end": {
            "line": 81,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 27
          },
          "end": {
            "line": 99,
            "column": 15
          }
        },
        "line": 81
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 85,
            "column": 29
          },
          "end": {
            "line": 85,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 85,
            "column": 35
          },
          "end": {
            "line": 89,
            "column": 21
          }
        },
        "line": 85
      },
      "5": {
        "name": "(anonymous_5)",
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
            "column": 27
          },
          "end": {
            "line": 107,
            "column": 15
          }
        },
        "line": 105
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 113,
            "column": 14
          },
          "end": {
            "line": 113,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 113,
            "column": 27
          },
          "end": {
            "line": 115,
            "column": 15
          }
        },
        "line": 113
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 124,
            "column": 24
          },
          "end": {
            "line": 124,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 124,
            "column": 34
          },
          "end": {
            "line": 126,
            "column": 17
          }
        },
        "line": 124
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 128,
            "column": 16
          },
          "end": {
            "line": 128,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 128,
            "column": 29
          },
          "end": {
            "line": 139,
            "column": 17
          }
        },
        "line": 128
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 4,
          "column": 30
        },
        "end": {
          "line": 146,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 11,
          "column": 16
        },
        "end": {
          "line": 11,
          "column": 32
        }
      },
      "2": {
        "start": {
          "line": 12,
          "column": 26
        },
        "end": {
          "line": 55,
          "column": 8
        }
      },
      "3": {
        "start": {
          "line": 18,
          "column": 12
        },
        "end": {
          "line": 21,
          "column": 14
        }
      },
      "4": {
        "start": {
          "line": 26,
          "column": 12
        },
        "end": {
          "line": 46,
          "column": 14
        }
      },
      "5": {
        "start": {
          "line": 56,
          "column": 2
        },
        "end": {
          "line": 145,
          "column": 4
        }
      },
      "6": {
        "start": {
          "line": 82,
          "column": 16
        },
        "end": {
          "line": 98,
          "column": 18
        }
      },
      "7": {
        "start": {
          "line": 86,
          "column": 22
        },
        "end": {
          "line": 88,
          "column": 25
        }
      },
      "8": {
        "start": {
          "line": 106,
          "column": 16
        },
        "end": {
          "line": 106,
          "column": 63
        }
      },
      "9": {
        "start": {
          "line": 114,
          "column": 16
        },
        "end": {
          "line": 114,
          "column": 67
        }
      },
      "10": {
        "start": {
          "line": 125,
          "column": 18
        },
        "end": {
          "line": 125,
          "column": 61
        }
      },
      "11": {
        "start": {
          "line": 129,
          "column": 18
        },
        "end": {
          "line": 138,
          "column": 20
        }
      }
    }
  }
}