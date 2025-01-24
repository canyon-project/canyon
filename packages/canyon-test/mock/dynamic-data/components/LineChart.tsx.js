window["components/LineChart.tsx"] = {
  "content": "import EChartsReact from \"echarts-for-react\";\nimport { CanyonCardPrimary } from \"@/components/old-ui\";\n\nconst coreData = [\n  {\n    month: 0,\n    year: 2024,\n    uiTestBranchCoverage: 50.59,\n    uiTestLineCoverage: 56.08,\n    uiTestChangedLineCoverage: 100,\n    utBranchCoverage: 64.96,\n    utLineCoverage: 62.56,\n  },\n  {\n    month: 1,\n    year: 2024,\n    uiTestBranchCoverage: 51.45,\n    uiTestLineCoverage: 59.19,\n    uiTestChangedLineCoverage: 93.76,\n    utBranchCoverage: 64.74,\n    utLineCoverage: 64,\n  },\n  {\n    month: 2,\n    year: 2024,\n    uiTestBranchCoverage: 50.05,\n    uiTestLineCoverage: 63.23,\n    uiTestChangedLineCoverage: 93.95,\n    utBranchCoverage: 64.68,\n    utLineCoverage: 64.38,\n  },\n  {\n    month: 3,\n    year: 2024,\n    uiTestBranchCoverage: 55.15,\n    uiTestLineCoverage: 66.47,\n    uiTestChangedLineCoverage: 95.49,\n    utBranchCoverage: 64.62,\n    utLineCoverage: 65.61,\n  },\n  {\n    month: 4,\n    year: 2024,\n    uiTestBranchCoverage: 57.84,\n    uiTestLineCoverage: 71.61,\n    uiTestChangedLineCoverage: 95.1,\n    utBranchCoverage: 64.69,\n    utLineCoverage: 66.15,\n  },\n  {\n    month: 5,\n    year: 2024,\n    uiTestBranchCoverage: 62.84,\n    uiTestLineCoverage: 77.23,\n    uiTestChangedLineCoverage: 96.13,\n    utBranchCoverage: 65.21,\n    utLineCoverage: 68.91,\n  },\n  {\n    month: 6,\n    year: 2024,\n    uiTestBranchCoverage: 63.22,\n    uiTestLineCoverage: 77.66,\n    uiTestChangedLineCoverage: 95.35,\n    utBranchCoverage: 66.81,\n    utLineCoverage: 69.34,\n  },\n  {\n    month: 7,\n    year: 2024,\n    uiTestBranchCoverage: 63.43,\n    uiTestLineCoverage: 77.92,\n    uiTestChangedLineCoverage: 95.61,\n    utBranchCoverage: 67.1,\n    utLineCoverage: 69.83,\n  },\n];\n\nconst data = {\n  Month: coreData.map((item) => `${item.month + 1}月`),\n  \"Branch Coverage (%)\": coreData.map((item) => item.uiTestBranchCoverage),\n  \"Line Coverage (%)\": coreData.map((item) => item.uiTestLineCoverage),\n  \"Changed Line Coverage (%)\": coreData.map(\n    (item) => item.uiTestChangedLineCoverage,\n  ),\n};\nconst d1 = coreData.map((item) => item.utBranchCoverage);\nconst d2 = coreData.map((item) => item.utLineCoverage);\nconst data1 = {\n  Month: coreData.map((item) => `${item.month + 1}月`),\n  \"Branch Coverage (%)\": d1,\n  \"Line Coverage (%)\": d2,\n};\n\nconst option = {\n  title: {\n    text: \"UI自动化覆盖率\",\n  },\n  tooltip: {\n    trigger: \"axis\",\n  },\n  legend: {\n    data: [\n      \"Branch Coverage (%)\",\n      \"Line Coverage (%)\",\n      \"Changed Line Coverage (%)\",\n    ],\n    right: 10,\n  },\n  grid: {\n    left: \"3%\",\n    right: \"4%\",\n    bottom: \"3%\",\n    containLabel: true,\n  },\n  // toolbox: {\n  //   feature: {\n  //     saveAsImage: {},\n  //   },\n  // },\n  xAxis: {\n    type: \"category\",\n    boundaryGap: true,\n    data: data.Month,\n  },\n  yAxis: {\n    type: \"value\",\n    max: 100,\n  },\n  series: [\n    {\n      name: \"Branch Coverage (%)\",\n      type: \"line\",\n      data: data[\"Branch Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"bottom\",\n      },\n    },\n    {\n      name: \"Line Coverage (%)\",\n      type: \"line\",\n      data: data[\"Line Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"top\",\n      },\n    },\n    {\n      name: \"Changed Line Coverage (%)\",\n      type: \"line\",\n      data: data[\"Changed Line Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"top\",\n      },\n    },\n  ],\n};\n\nconst option1 = {\n  title: {\n    text: \"UT覆盖率\",\n  },\n  tooltip: {\n    trigger: \"axis\",\n  },\n  legend: {\n    data: [\n      \"Branch Coverage (%)\",\n      \"Line Coverage (%)\",\n      \"Changed Line Coverage (%)\",\n    ],\n    right: 10,\n  },\n  grid: {\n    left: \"3%\",\n    right: \"4%\",\n    bottom: \"3%\",\n    containLabel: true,\n  },\n  // toolbox: {\n  //   feature: {\n  //     saveAsImage: {},\n  //   },\n  // },\n  xAxis: {\n    type: \"category\",\n    boundaryGap: true,\n    data: data.Month,\n  },\n  yAxis: {\n    type: \"value\",\n    max: 100,\n  },\n  series: [\n    {\n      name: \"Branch Coverage (%)\",\n      type: \"line\",\n      data: data1[\"Branch Coverage (%)\"],\n      label: {\n        show: true,\n        position: \"top\",\n        color: \"blue\",\n      },\n    },\n    {\n      name: \"Line Coverage (%)\",\n      type: \"line\",\n      data: data1[\"Line Coverage (%)\"],\n      label: {\n        show: true,\n        position: \"bottom\",\n        color: \"green\",\n      },\n    },\n  ],\n};\nconst LineChart = () => {\n  return (\n    <CanyonCardPrimary>\n      <div className={\"flex items-center bg-white dark:bg-[#0F0D28] p-5\"}>\n        <EChartsReact\n          className={\"w-[50%]\"}\n          style={{ height: \"400px\" }}\n          option={option}\n        />\n        <EChartsReact\n          className={\"w-[50%]\"}\n          style={{ height: \"400px\" }}\n          option={option1}\n        />\n      </div>\n    </CanyonCardPrimary>\n  );\n};\n\nexport default LineChart;\n",
  "coverage": {
    "path": "components/LineChart.tsx",
    "b": {},
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0
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
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 80,
            "column": 22
          },
          "end": {
            "line": 80,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 80,
            "column": 32
          },
          "end": {
            "line": 80,
            "column": 52
          }
        },
        "line": 80
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 81,
            "column": 38
          },
          "end": {
            "line": 81,
            "column": 39
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 48
          },
          "end": {
            "line": 81,
            "column": 73
          }
        },
        "line": 81
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 82,
            "column": 36
          },
          "end": {
            "line": 82,
            "column": 37
          }
        },
        "loc": {
          "start": {
            "line": 82,
            "column": 46
          },
          "end": {
            "line": 82,
            "column": 69
          }
        },
        "line": 82
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 84,
            "column": 4
          },
          "end": {
            "line": 84,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 84,
            "column": 14
          },
          "end": {
            "line": 84,
            "column": 44
          }
        },
        "line": 84
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 87,
            "column": 24
          },
          "end": {
            "line": 87,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 87,
            "column": 34
          },
          "end": {
            "line": 87,
            "column": 55
          }
        },
        "line": 87
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 88,
            "column": 24
          },
          "end": {
            "line": 88,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 88,
            "column": 34
          },
          "end": {
            "line": 88,
            "column": 53
          }
        },
        "line": 88
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 90,
            "column": 22
          },
          "end": {
            "line": 90,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 90,
            "column": 32
          },
          "end": {
            "line": 90,
            "column": 52
          }
        },
        "line": 90
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 222,
            "column": 18
          },
          "end": {
            "line": 222,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 222,
            "column": 24
          },
          "end": {
            "line": 239,
            "column": 1
          }
        },
        "line": 222
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 4,
          "column": 17
        },
        "end": {
          "line": 77,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 79,
          "column": 13
        },
        "end": {
          "line": 86,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 80,
          "column": 32
        },
        "end": {
          "line": 80,
          "column": 52
        }
      },
      "3": {
        "start": {
          "line": 81,
          "column": 48
        },
        "end": {
          "line": 81,
          "column": 73
        }
      },
      "4": {
        "start": {
          "line": 82,
          "column": 46
        },
        "end": {
          "line": 82,
          "column": 69
        }
      },
      "5": {
        "start": {
          "line": 84,
          "column": 14
        },
        "end": {
          "line": 84,
          "column": 44
        }
      },
      "6": {
        "start": {
          "line": 87,
          "column": 11
        },
        "end": {
          "line": 87,
          "column": 56
        }
      },
      "7": {
        "start": {
          "line": 87,
          "column": 34
        },
        "end": {
          "line": 87,
          "column": 55
        }
      },
      "8": {
        "start": {
          "line": 88,
          "column": 11
        },
        "end": {
          "line": 88,
          "column": 54
        }
      },
      "9": {
        "start": {
          "line": 88,
          "column": 34
        },
        "end": {
          "line": 88,
          "column": 53
        }
      },
      "10": {
        "start": {
          "line": 89,
          "column": 14
        },
        "end": {
          "line": 93,
          "column": 1
        }
      },
      "11": {
        "start": {
          "line": 90,
          "column": 32
        },
        "end": {
          "line": 90,
          "column": 52
        }
      },
      "12": {
        "start": {
          "line": 95,
          "column": 15
        },
        "end": {
          "line": 162,
          "column": 1
        }
      },
      "13": {
        "start": {
          "line": 164,
          "column": 16
        },
        "end": {
          "line": 221,
          "column": 1
        }
      },
      "14": {
        "start": {
          "line": 222,
          "column": 18
        },
        "end": {
          "line": 239,
          "column": 1
        }
      },
      "15": {
        "start": {
          "line": 223,
          "column": 2
        },
        "end": {
          "line": 238,
          "column": 4
        }
      }
    }
  }
}