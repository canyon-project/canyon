window["components/CanyonReport/index.tsx"] = {
  "content": "import { genSummaryTreeItem } from \"canyon-data\";\n\nimport CanyonReportControl from \"./Control.tsx\";\nimport CanyonReportCoverageDetail from \"./CoverageDetail.tsx\";\nimport { checkSuffix } from \"./helper.tsx\";\nimport CanyonReportListTable from \"./ListTable.tsx\";\nimport CanyonReportOverview from \"./Overview.tsx\";\nimport CanyonReportTreeTable from \"./TreeTable.tsx\";\n\nfunction checkSummaryOnlyChange(item, onlyChange) {\n  // 如果只看改变的为false，就返回全部\n  if (onlyChange === false) {\n    return true;\n  }\n  // 不然就检查item.change\n  if (onlyChange && item.change) {\n    return true;\n  } else {\n    return false;\n  }\n}\nfunction checkSummaryKeywords(item, keywords) {\n  return item.path.toLowerCase().includes(keywords.toLowerCase());\n}\nfunction checkSummaryRange(item, range) {\n  const pct = item.statements.pct;\n  return pct >= range[0] && pct <= range[1];\n}\n\n// 1.summary最主要的数据，有外面传入\n// 2.当前默认defaultPath = sprm.get('path')，锚点\nconst CanyonReport = ({\n  // summary,\n  activatedPath,\n  pathWithNamespace,\n  coverageSummaryMapData,\n  loading,\n  onSelect,\n  mainData,\n  theme,\n}) => {\n  // 几个状态\n  // 1.展示模式//tree||list\n  const [showMode, setShowMode] = useState(\"tree\");\n  // 2.当前是文件还是文件夹\n  const fMode = useMemo(() => {\n    // return 获取当前path，判断是否含有 .\n    return activatedPath.includes(\".\") && checkSuffix(activatedPath)\n      ? \"file\"\n      : \"folder\";\n  }, [activatedPath]);\n  // 3.是否只展示变更文件\n  // 4.其他的放在各自的状态里\n\n  // 5.文件路径关键字搜索\n  const [keywords, setKeywords] = useState(\"\");\n  const [onlyChange, setOnlyChange] = useState(false);\n  const [range, setRange] = useState([0, 100]);\n\n  // useEffect(()=>{\n  //   document.querySelector(\"#nihao\").scrollIntoView(true);\n  // },[])\n\n  const coverageSummaryMapDataFiltered = useMemo(() => {\n    return coverageSummaryMapData.filter(\n      (item) =>\n        checkSummaryOnlyChange(item, onlyChange) &&\n        checkSummaryKeywords(item, keywords) &&\n        checkSummaryRange(item, range),\n    );\n  }, [coverageSummaryMapData, onlyChange, keywords, range]);\n\n  const summary = coverageSummaryMapDataFiltered.reduce(\n    (acc: any, cur: any) => {\n      acc[cur.path] = cur;\n      return acc;\n    },\n    {},\n  );\n  const summaryTreeItem = genSummaryTreeItem(activatedPath, summary);\n  function onChangeOnlyChangeKeywords(v) {\n    setKeywords(v.target.value);\n  }\n\n  function onChangeOnlyChange(v) {\n    // console.log(v,'v')\n    setOnlyChange(v);\n  }\n  function onChangeShowMode(mode) {\n    setShowMode(mode);\n  }\n  function onChangeRange(va) {\n    setRange(va);\n  }\n  return (\n    <div>\n      <CanyonReportControl\n        showMode={showMode}\n        numberFiles={\n          coverageSummaryMapDataFiltered.filter((item) =>\n            item.path.includes(activatedPath),\n          ).length\n        }\n        keywords={keywords}\n        range={range}\n        onlyChange={onlyChange}\n        onChangeOnlyChange={onChangeOnlyChange}\n        onChangeOnlyChangeKeywords={onChangeOnlyChangeKeywords}\n        onChangeShowMode={onChangeShowMode}\n        onChangeRange={onChangeRange}\n      />\n      <Divider style={{ margin: \"0\", marginBottom: \"10px\" }} />\n      <CanyonReportOverview\n        summaryTreeItem={summaryTreeItem}\n        activatedPath={activatedPath}\n        pathWithNamespace={pathWithNamespace}\n        onSelect={onSelect}\n      />\n      {showMode === \"tree\" && fMode === \"folder\" && (\n        <CanyonReportTreeTable\n          onlyChange={onlyChange}\n          dataSource={summaryTreeItem.children}\n          loading={loading}\n          activatedPath={activatedPath}\n          onSelect={onSelect}\n        />\n      )}\n      {showMode === \"list\" && fMode === \"folder\" && (\n        <CanyonReportListTable\n          onlyChange={onlyChange}\n          onSelect={onSelect}\n          keywords={keywords}\n          loading={loading}\n          dataSource={coverageSummaryMapDataFiltered.filter((item) =>\n            item.path.includes(activatedPath),\n          )}\n        />\n      )}\n      <Spin spinning={!mainData && fMode === \"file\"}>\n        {fMode === \"file\" && mainData && (\n          <CanyonReportCoverageDetail\n            theme={theme}\n            data={{\n              coverage: mainData?.fileCoverage,\n              sourcecode: mainData?.fileContent,\n              newlines: mainData?.fileCodeChange,\n            }}\n          />\n        )}\n      </Spin>\n\n      <FloatButton.BackTop />\n    </div>\n  );\n};\n\nexport default CanyonReport;\n",
  "coverage": {
    "path": "components/CanyonReport/index.tsx",
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
      ],
      "3": [
        0,
        0
      ],
      "4": [
        0,
        0
      ],
      "5": [
        0,
        0
      ],
      "6": [
        0,
        0,
        0
      ],
      "7": [
        0,
        0,
        0
      ],
      "8": [
        0,
        0,
        0
      ],
      "9": [
        0,
        0
      ],
      "10": [
        0,
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
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0
    },
    "s": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 8,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 12,
            "column": 2
          },
          "end": {
            "line": 14,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 12,
              "column": 2
            },
            "end": {
              "line": 14,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 12
      },
      "1": {
        "loc": {
          "start": {
            "line": 16,
            "column": 2
          },
          "end": {
            "line": 20,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 16,
              "column": 2
            },
            "end": {
              "line": 20,
              "column": 3
            }
          },
          {
            "start": {
              "line": 18,
              "column": 9
            },
            "end": {
              "line": 20,
              "column": 3
            }
          }
        ],
        "line": 16
      },
      "2": {
        "loc": {
          "start": {
            "line": 16,
            "column": 6
          },
          "end": {
            "line": 16,
            "column": 31
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 16,
              "column": 6
            },
            "end": {
              "line": 16,
              "column": 16
            }
          },
          {
            "start": {
              "line": 16,
              "column": 20
            },
            "end": {
              "line": 16,
              "column": 31
            }
          }
        ],
        "line": 16
      },
      "3": {
        "loc": {
          "start": {
            "line": 27,
            "column": 9
          },
          "end": {
            "line": 27,
            "column": 43
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 27,
              "column": 9
            },
            "end": {
              "line": 27,
              "column": 24
            }
          },
          {
            "start": {
              "line": 27,
              "column": 28
            },
            "end": {
              "line": 27,
              "column": 43
            }
          }
        ],
        "line": 27
      },
      "4": {
        "loc": {
          "start": {
            "line": 48,
            "column": 11
          },
          "end": {
            "line": 50,
            "column": 16
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 49,
              "column": 8
            },
            "end": {
              "line": 49,
              "column": 14
            }
          },
          {
            "start": {
              "line": 50,
              "column": 8
            },
            "end": {
              "line": 50,
              "column": 16
            }
          }
        ],
        "line": 48
      },
      "5": {
        "loc": {
          "start": {
            "line": 48,
            "column": 11
          },
          "end": {
            "line": 48,
            "column": 68
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 48,
              "column": 11
            },
            "end": {
              "line": 48,
              "column": 38
            }
          },
          {
            "start": {
              "line": 48,
              "column": 42
            },
            "end": {
              "line": 48,
              "column": 68
            }
          }
        ],
        "line": 48
      },
      "6": {
        "loc": {
          "start": {
            "line": 67,
            "column": 8
          },
          "end": {
            "line": 69,
            "column": 38
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 67,
              "column": 8
            },
            "end": {
              "line": 67,
              "column": 48
            }
          },
          {
            "start": {
              "line": 68,
              "column": 8
            },
            "end": {
              "line": 68,
              "column": 44
            }
          },
          {
            "start": {
              "line": 69,
              "column": 8
            },
            "end": {
              "line": 69,
              "column": 38
            }
          }
        ],
        "line": 67
      },
      "7": {
        "loc": {
          "start": {
            "line": 119,
            "column": 7
          },
          "end": {
            "line": 127,
            "column": 7
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 119,
              "column": 7
            },
            "end": {
              "line": 119,
              "column": 26
            }
          },
          {
            "start": {
              "line": 119,
              "column": 30
            },
            "end": {
              "line": 119,
              "column": 48
            }
          },
          {
            "start": {
              "line": 120,
              "column": 8
            },
            "end": {
              "line": 126,
              "column": 10
            }
          }
        ],
        "line": 119
      },
      "8": {
        "loc": {
          "start": {
            "line": 128,
            "column": 7
          },
          "end": {
            "line": 138,
            "column": 7
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 128,
              "column": 7
            },
            "end": {
              "line": 128,
              "column": 26
            }
          },
          {
            "start": {
              "line": 128,
              "column": 30
            },
            "end": {
              "line": 128,
              "column": 48
            }
          },
          {
            "start": {
              "line": 129,
              "column": 8
            },
            "end": {
              "line": 137,
              "column": 10
            }
          }
        ],
        "line": 128
      },
      "9": {
        "loc": {
          "start": {
            "line": 139,
            "column": 22
          },
          "end": {
            "line": 139,
            "column": 51
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 139,
              "column": 22
            },
            "end": {
              "line": 139,
              "column": 31
            }
          },
          {
            "start": {
              "line": 139,
              "column": 35
            },
            "end": {
              "line": 139,
              "column": 51
            }
          }
        ],
        "line": 139
      },
      "10": {
        "loc": {
          "start": {
            "line": 140,
            "column": 9
          },
          "end": {
            "line": 149,
            "column": 9
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 140,
              "column": 9
            },
            "end": {
              "line": 140,
              "column": 25
            }
          },
          {
            "start": {
              "line": 140,
              "column": 29
            },
            "end": {
              "line": 140,
              "column": 37
            }
          },
          {
            "start": {
              "line": 141,
              "column": 10
            },
            "end": {
              "line": 148,
              "column": 12
            }
          }
        ],
        "line": 140
      }
    },
    "fnMap": {
      "0": {
        "name": "checkSummaryOnlyChange",
        "decl": {
          "start": {
            "line": 10,
            "column": 9
          },
          "end": {
            "line": 10,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 50
          },
          "end": {
            "line": 21,
            "column": 1
          }
        },
        "line": 10
      },
      "1": {
        "name": "checkSummaryKeywords",
        "decl": {
          "start": {
            "line": 22,
            "column": 9
          },
          "end": {
            "line": 22,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 22,
            "column": 46
          },
          "end": {
            "line": 24,
            "column": 1
          }
        },
        "line": 22
      },
      "2": {
        "name": "checkSummaryRange",
        "decl": {
          "start": {
            "line": 25,
            "column": 9
          },
          "end": {
            "line": 25,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 25,
            "column": 40
          },
          "end": {
            "line": 28,
            "column": 1
          }
        },
        "line": 25
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 32,
            "column": 21
          },
          "end": {
            "line": 32,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 41,
            "column": 6
          },
          "end": {
            "line": 155,
            "column": 1
          }
        },
        "line": 41
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 46,
            "column": 24
          },
          "end": {
            "line": 46,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 46,
            "column": 30
          },
          "end": {
            "line": 51,
            "column": 3
          }
        },
        "line": 46
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 64,
            "column": 49
          },
          "end": {
            "line": 64,
            "column": 50
          }
        },
        "loc": {
          "start": {
            "line": 64,
            "column": 55
          },
          "end": {
            "line": 71,
            "column": 3
          }
        },
        "line": 64
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 66,
            "column": 6
          },
          "end": {
            "line": 66,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 67,
            "column": 8
          },
          "end": {
            "line": 69,
            "column": 38
          }
        },
        "line": 67
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 74,
            "column": 4
          },
          "end": {
            "line": 74,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 74,
            "column": 28
          },
          "end": {
            "line": 77,
            "column": 5
          }
        },
        "line": 74
      },
      "8": {
        "name": "onChangeOnlyChangeKeywords",
        "decl": {
          "start": {
            "line": 81,
            "column": 11
          },
          "end": {
            "line": 81,
            "column": 37
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 41
          },
          "end": {
            "line": 83,
            "column": 3
          }
        },
        "line": 81
      },
      "9": {
        "name": "onChangeOnlyChange",
        "decl": {
          "start": {
            "line": 85,
            "column": 11
          },
          "end": {
            "line": 85,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 85,
            "column": 33
          },
          "end": {
            "line": 88,
            "column": 3
          }
        },
        "line": 85
      },
      "10": {
        "name": "onChangeShowMode",
        "decl": {
          "start": {
            "line": 89,
            "column": 11
          },
          "end": {
            "line": 89,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 89,
            "column": 34
          },
          "end": {
            "line": 91,
            "column": 3
          }
        },
        "line": 89
      },
      "11": {
        "name": "onChangeRange",
        "decl": {
          "start": {
            "line": 92,
            "column": 11
          },
          "end": {
            "line": 92,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 92,
            "column": 29
          },
          "end": {
            "line": 94,
            "column": 3
          }
        },
        "line": 92
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 100,
            "column": 48
          },
          "end": {
            "line": 100,
            "column": 49
          }
        },
        "loc": {
          "start": {
            "line": 101,
            "column": 12
          },
          "end": {
            "line": 101,
            "column": 45
          }
        },
        "line": 101
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 134,
            "column": 60
          },
          "end": {
            "line": 134,
            "column": 61
          }
        },
        "loc": {
          "start": {
            "line": 135,
            "column": 12
          },
          "end": {
            "line": 135,
            "column": 45
          }
        },
        "line": 135
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 12,
          "column": 2
        },
        "end": {
          "line": 14,
          "column": 3
        }
      },
      "1": {
        "start": {
          "line": 13,
          "column": 4
        },
        "end": {
          "line": 13,
          "column": 16
        }
      },
      "2": {
        "start": {
          "line": 16,
          "column": 2
        },
        "end": {
          "line": 20,
          "column": 3
        }
      },
      "3": {
        "start": {
          "line": 17,
          "column": 4
        },
        "end": {
          "line": 17,
          "column": 16
        }
      },
      "4": {
        "start": {
          "line": 19,
          "column": 4
        },
        "end": {
          "line": 19,
          "column": 17
        }
      },
      "5": {
        "start": {
          "line": 23,
          "column": 2
        },
        "end": {
          "line": 23,
          "column": 66
        }
      },
      "6": {
        "start": {
          "line": 26,
          "column": 14
        },
        "end": {
          "line": 26,
          "column": 33
        }
      },
      "7": {
        "start": {
          "line": 27,
          "column": 2
        },
        "end": {
          "line": 27,
          "column": 44
        }
      },
      "8": {
        "start": {
          "line": 32,
          "column": 21
        },
        "end": {
          "line": 155,
          "column": 1
        }
      },
      "9": {
        "start": {
          "line": 44,
          "column": 34
        },
        "end": {
          "line": 44,
          "column": 50
        }
      },
      "10": {
        "start": {
          "line": 46,
          "column": 16
        },
        "end": {
          "line": 51,
          "column": 21
        }
      },
      "11": {
        "start": {
          "line": 48,
          "column": 4
        },
        "end": {
          "line": 50,
          "column": 17
        }
      },
      "12": {
        "start": {
          "line": 56,
          "column": 34
        },
        "end": {
          "line": 56,
          "column": 46
        }
      },
      "13": {
        "start": {
          "line": 57,
          "column": 38
        },
        "end": {
          "line": 57,
          "column": 53
        }
      },
      "14": {
        "start": {
          "line": 58,
          "column": 28
        },
        "end": {
          "line": 58,
          "column": 46
        }
      },
      "15": {
        "start": {
          "line": 64,
          "column": 41
        },
        "end": {
          "line": 71,
          "column": 59
        }
      },
      "16": {
        "start": {
          "line": 65,
          "column": 4
        },
        "end": {
          "line": 70,
          "column": 6
        }
      },
      "17": {
        "start": {
          "line": 67,
          "column": 8
        },
        "end": {
          "line": 69,
          "column": 38
        }
      },
      "18": {
        "start": {
          "line": 73,
          "column": 18
        },
        "end": {
          "line": 79,
          "column": 3
        }
      },
      "19": {
        "start": {
          "line": 75,
          "column": 6
        },
        "end": {
          "line": 75,
          "column": 26
        }
      },
      "20": {
        "start": {
          "line": 76,
          "column": 6
        },
        "end": {
          "line": 76,
          "column": 17
        }
      },
      "21": {
        "start": {
          "line": 80,
          "column": 26
        },
        "end": {
          "line": 80,
          "column": 68
        }
      },
      "22": {
        "start": {
          "line": 82,
          "column": 4
        },
        "end": {
          "line": 82,
          "column": 32
        }
      },
      "23": {
        "start": {
          "line": 87,
          "column": 4
        },
        "end": {
          "line": 87,
          "column": 21
        }
      },
      "24": {
        "start": {
          "line": 90,
          "column": 4
        },
        "end": {
          "line": 90,
          "column": 22
        }
      },
      "25": {
        "start": {
          "line": 93,
          "column": 4
        },
        "end": {
          "line": 93,
          "column": 17
        }
      },
      "26": {
        "start": {
          "line": 95,
          "column": 2
        },
        "end": {
          "line": 154,
          "column": 4
        }
      },
      "27": {
        "start": {
          "line": 101,
          "column": 12
        },
        "end": {
          "line": 101,
          "column": 45
        }
      },
      "28": {
        "start": {
          "line": 135,
          "column": 12
        },
        "end": {
          "line": 135,
          "column": 45
        }
      }
    }
  }
}