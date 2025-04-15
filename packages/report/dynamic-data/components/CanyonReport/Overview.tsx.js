window["components/CanyonReport/Overview.tsx"] = {
  "content": "import { CopyOutlined, ShareAltOutlined } from \"@ant-design/icons\";\n// @ts-ignore\nimport { CopyToClipboard } from \"react-copy-to-clipboard\";\nimport { useSearchParams } from \"react-router-dom\";\n\nimport { getCOlor } from \"../../helpers/utils/common.ts\";\nimport { capitalizeFirstLetter } from \"./helper.tsx\";\nconst obj = {\n  statements: 0,\n  branches: 1,\n  functions: 2,\n  lines: 3,\n  newlines: 4,\n};\nconst { Text } = Typography;\nconst CanyonReportOverview = ({\n  activatedPath,\n  pathWithNamespace,\n  onSelect,\n  summaryTreeItem,\n}) => {\n  const [sprm] = useSearchParams();\n  const { t } = useTranslation();\n  return (\n    <div>\n      {/*<span>{JSON.stringify(summaryTreeItem.summary)}</span>*/}\n      <div className={\"mb-2\"} style={{ fontSize: \"16px\", fontWeight: \"bold\" }}>\n        <a\n          className={\"cursor-pointer\"}\n          onClick={() => {\n            onSelect({ path: \"\" });\n          }}\n        >\n          {pathWithNamespace}\n        </a>\n        {/*<span> / </span>*/}\n        {activatedPath?.split(\"/\").map((i, index, arr) => {\n          return (\n            <>\n              {activatedPath !== \"\" ? <span> / </span> : null}\n              <a\n                className={\"cursor-pointer\"}\n                onClick={() => {\n                  const newpath = arr\n                    .filter((i, index3) => index3 < index + 1)\n                    .reduce((c, p, index) => {\n                      return c + (index === 0 ? \"\" : \"/\") + p;\n                    }, \"\");\n                  onSelect({ path: newpath });\n                }}\n              >\n                {i.replace(\"~\", pathWithNamespace)}\n              </a>\n            </>\n          );\n        })}\n        <Divider type={\"vertical\"} className={\"ml-3 mr-3\"} />\n        <CopyToClipboard\n          text={activatedPath || \"null\"}\n          onCopy={() => {\n            message.success(\"复制路径成功\");\n          }}\n        >\n          <a className={\"cursor-pointer mr-2\"}>\n            <CopyOutlined style={{ fontSize: \"14px\", fontWeight: \"bold\" }} />\n          </a>\n        </CopyToClipboard>\n\n        <CopyToClipboard\n          text={location.href}\n          onCopy={() => {\n            message.success(\"复制分享链接成功\");\n          }}\n        >\n          <a className={\"cursor-pointer\"}>\n            <ShareAltOutlined\n              style={{ fontSize: \"14px\", fontWeight: \"bold\" }}\n            />\n          </a>\n        </CopyToClipboard>\n      </div>\n\n      <div className={\"flex gap-2 mb-3\"}>\n        {Object.entries(summaryTreeItem.summary)\n          .sort((a, b) => {\n            return obj[a[0]] - obj[b[0]];\n          })\n          .map(([key, value]) => {\n            return (\n              <div className={\"flex gap-1 items-center\"}>\n                <span style={{ fontWeight: \"600\", fontSize: \"14px\" }}>\n                  {value.pct}%\n                </span>\n                <Text style={{ fontSize: \"14px\" }} type={\"secondary\"}>\n                  {t(\"projects.\" + key)}:\n                </Text>\n                <Tag bordered={false}>\n                  {value.covered}/{value.total}\n                </Tag>\n              </div>\n            );\n          })}\n      </div>\n      <div\n        style={{\n          backgroundColor: getCOlor(summaryTreeItem.summary.statements.pct),\n        }}\n        className={\"w-full h-[10px] mb-3\"}\n      ></div>\n    </div>\n  );\n};\n\nexport default CanyonReportOverview;\n",
  "coverage": {
    "path": "components/CanyonReport/Overview.tsx",
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
      "8": 0,
      "9": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 40,
            "column": 15
          },
          "end": {
            "line": 40,
            "column": 61
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 40,
              "column": 38
            },
            "end": {
              "line": 40,
              "column": 54
            }
          },
          {
            "start": {
              "line": 40,
              "column": 57
            },
            "end": {
              "line": 40,
              "column": 61
            }
          }
        ],
        "line": 40
      },
      "1": {
        "loc": {
          "start": {
            "line": 47,
            "column": 34
          },
          "end": {
            "line": 47,
            "column": 56
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 47,
              "column": 48
            },
            "end": {
              "line": 47,
              "column": 50
            }
          },
          {
            "start": {
              "line": 47,
              "column": 53
            },
            "end": {
              "line": 47,
              "column": 56
            }
          }
        ],
        "line": 47
      },
      "2": {
        "loc": {
          "start": {
            "line": 59,
            "column": 16
          },
          "end": {
            "line": 59,
            "column": 39
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 59,
              "column": 16
            },
            "end": {
              "line": 59,
              "column": 29
            }
          },
          {
            "start": {
              "line": 59,
              "column": 33
            },
            "end": {
              "line": 59,
              "column": 39
            }
          }
        ],
        "line": 59
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 16,
            "column": 29
          },
          "end": {
            "line": 16,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 21,
            "column": 6
          },
          "end": {
            "line": 112,
            "column": 1
          }
        },
        "line": 21
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 30,
            "column": 19
          },
          "end": {
            "line": 30,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 30,
            "column": 25
          },
          "end": {
            "line": 32,
            "column": 11
          }
        },
        "line": 30
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 37,
            "column": 39
          },
          "end": {
            "line": 37,
            "column": 40
          }
        },
        "loc": {
          "start": {
            "line": 37,
            "column": 58
          },
          "end": {
            "line": 56,
            "column": 9
          }
        },
        "line": 37
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 43,
            "column": 25
          },
          "end": {
            "line": 43,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 43,
            "column": 31
          },
          "end": {
            "line": 50,
            "column": 17
          }
        },
        "line": 43
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 45,
            "column": 28
          },
          "end": {
            "line": 45,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 45,
            "column": 43
          },
          "end": {
            "line": 45,
            "column": 61
          }
        },
        "line": 45
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 46,
            "column": 28
          },
          "end": {
            "line": 46,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 46,
            "column": 45
          },
          "end": {
            "line": 48,
            "column": 21
          }
        },
        "line": 46
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 60,
            "column": 18
          },
          "end": {
            "line": 60,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 60,
            "column": 24
          },
          "end": {
            "line": 62,
            "column": 11
          }
        },
        "line": 60
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 71,
            "column": 18
          },
          "end": {
            "line": 71,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 71,
            "column": 24
          },
          "end": {
            "line": 73,
            "column": 11
          }
        },
        "line": 71
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 85,
            "column": 16
          },
          "end": {
            "line": 85,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 85,
            "column": 26
          },
          "end": {
            "line": 87,
            "column": 11
          }
        },
        "line": 85
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 88,
            "column": 15
          },
          "end": {
            "line": 88,
            "column": 16
          }
        },
        "loc": {
          "start": {
            "line": 88,
            "column": 33
          },
          "end": {
            "line": 102,
            "column": 11
          }
        },
        "line": 88
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 8,
          "column": 12
        },
        "end": {
          "line": 14,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 15,
          "column": 17
        },
        "end": {
          "line": 15,
          "column": 27
        }
      },
      "2": {
        "start": {
          "line": 16,
          "column": 29
        },
        "end": {
          "line": 112,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 22,
          "column": 17
        },
        "end": {
          "line": 22,
          "column": 34
        }
      },
      "4": {
        "start": {
          "line": 23,
          "column": 16
        },
        "end": {
          "line": 23,
          "column": 32
        }
      },
      "5": {
        "start": {
          "line": 24,
          "column": 2
        },
        "end": {
          "line": 111,
          "column": 4
        }
      },
      "6": {
        "start": {
          "line": 31,
          "column": 12
        },
        "end": {
          "line": 31,
          "column": 35
        }
      },
      "7": {
        "start": {
          "line": 38,
          "column": 10
        },
        "end": {
          "line": 55,
          "column": 12
        }
      },
      "8": {
        "start": {
          "line": 44,
          "column": 34
        },
        "end": {
          "line": 48,
          "column": 26
        }
      },
      "9": {
        "start": {
          "line": 45,
          "column": 43
        },
        "end": {
          "line": 45,
          "column": 61
        }
      },
      "10": {
        "start": {
          "line": 47,
          "column": 22
        },
        "end": {
          "line": 47,
          "column": 62
        }
      },
      "11": {
        "start": {
          "line": 49,
          "column": 18
        },
        "end": {
          "line": 49,
          "column": 46
        }
      },
      "12": {
        "start": {
          "line": 61,
          "column": 12
        },
        "end": {
          "line": 61,
          "column": 38
        }
      },
      "13": {
        "start": {
          "line": 72,
          "column": 12
        },
        "end": {
          "line": 72,
          "column": 40
        }
      },
      "14": {
        "start": {
          "line": 86,
          "column": 12
        },
        "end": {
          "line": 86,
          "column": 41
        }
      },
      "15": {
        "start": {
          "line": 89,
          "column": 12
        },
        "end": {
          "line": 101,
          "column": 14
        }
      }
    }
  }
}