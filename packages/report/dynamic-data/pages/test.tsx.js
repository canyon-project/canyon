window["pages/test.tsx"] = {
  "content": "import EChartsReact from \"echarts-for-react\";\nconst data = {\n  Month: [\"1月\", \"2月\", \"3月\", \"4月\", \"5月\", \"6月\"],\n  // \"Branch Coverage (%)\": [66.08, 67.18, 64.81, 68.7, 71.82, 76.37],\n  // \"Line Coverage (%)\": [56.08, 59.19, 63.23, 66.47, 71.61, 77.23],\n  \"Branch Coverage (%)\": [50.59, 51.45, 50.05, 55.15, 57.84, 62.84],\n  \"Line Coverage (%)\": [56.08, 59.19, 63.23, 66.47, 71.61, 77.23],\n  \"Changed Line Coverage (%)\": [null, 93.76, 93.95, 95.49, 95.1, 96.13],\n};\nconst d1 = [58.93, 59.07, 58.86, 58.93, 58.73, 59.04];\nconst d2 = [40.94, 42.18, 41.71, 42.13, 42.69, 44.37];\nconst data1 = {\n  Month: [\"1月\", \"2月\", \"3月\", \"4月\", \"5月\", \"6月\"],\n  \"Branch Coverage (%)\": d1,\n  \"Line Coverage (%)\": d2,\n  \"Changed Line Coverage (%)\": [null, 93.76, 93.95, 95.49, 95.1, 96.13],\n};\n\nconst option = {\n  title: {\n    text: \"UI自动化覆盖率\",\n  },\n  tooltip: {\n    trigger: \"axis\",\n  },\n  legend: {\n    data: [\n      \"Branch Coverage (%)\",\n      \"Line Coverage (%)\",\n      \"Changed Line Coverage (%)\",\n    ],\n    right: 10,\n  },\n  grid: {\n    left: \"3%\",\n    right: \"4%\",\n    bottom: \"3%\",\n    containLabel: true,\n  },\n  toolbox: {\n    feature: {\n      saveAsImage: {},\n    },\n  },\n  xAxis: {\n    type: \"category\",\n    boundaryGap: true,\n    data: data.Month,\n  },\n  yAxis: {\n    type: \"value\",\n    max: 100,\n  },\n  series: [\n    {\n      name: \"Branch Coverage (%)\",\n      type: \"line\",\n      data: data[\"Branch Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"bottom\",\n      },\n    },\n    {\n      name: \"Line Coverage (%)\",\n      type: \"line\",\n      data: data[\"Line Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"top\",\n      },\n    },\n    {\n      name: \"Changed Line Coverage (%)\",\n      type: \"line\",\n      data: data[\"Changed Line Coverage (%)\"],\n      //   线上加文字\n      label: {\n        show: true,\n        position: \"top\",\n      },\n    },\n  ],\n};\n\nconst option1 = {\n  title: {\n    text: \"UT覆盖率\",\n  },\n  tooltip: {\n    trigger: \"axis\",\n  },\n  legend: {\n    data: [\n      \"Branch Coverage (%)\",\n      \"Line Coverage (%)\",\n      \"Changed Line Coverage (%)\",\n    ],\n    right: 10,\n  },\n  grid: {\n    left: \"3%\",\n    right: \"4%\",\n    bottom: \"3%\",\n    containLabel: true,\n  },\n  toolbox: {\n    feature: {\n      saveAsImage: {},\n    },\n  },\n  xAxis: {\n    type: \"category\",\n    boundaryGap: true,\n    data: data.Month,\n  },\n  yAxis: {\n    type: \"value\",\n    max: 100,\n  },\n  series: [\n    {\n      name: \"Branch Coverage (%)\",\n      type: \"line\",\n      data: data1[\"Branch Coverage (%)\"],\n    },\n    {\n      name: \"Line Coverage (%)\",\n      type: \"line\",\n      data: data1[\"Line Coverage (%)\"],\n    },\n  ],\n};\nconst Test = () => {\n  return (\n    <div>\n      <EChartsReact\n        className={\"w-[700px]\"}\n        style={{ height: \"300px\" }}\n        option={option}\n      />\n      <EChartsReact\n        className={\"w-[700px]\"}\n        style={{ height: \"300px\" }}\n        option={option1}\n      />\n    </div>\n  );\n};\n\nexport default Test;\n",
  "coverage": {
    "path": "pages/test.tsx",
    "b": {},
    "f": {
      "0": 0
    },
    "s": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 136,
            "column": 13
          },
          "end": {
            "line": 136,
            "column": 14
          }
        },
        "loc": {
          "start": {
            "line": 136,
            "column": 19
          },
          "end": {
            "line": 151,
            "column": 1
          }
        },
        "line": 136
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 2,
          "column": 13
        },
        "end": {
          "line": 9,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 10,
          "column": 11
        },
        "end": {
          "line": 10,
          "column": 53
        }
      },
      "2": {
        "start": {
          "line": 11,
          "column": 11
        },
        "end": {
          "line": 11,
          "column": 53
        }
      },
      "3": {
        "start": {
          "line": 12,
          "column": 14
        },
        "end": {
          "line": 17,
          "column": 1
        }
      },
      "4": {
        "start": {
          "line": 19,
          "column": 15
        },
        "end": {
          "line": 86,
          "column": 1
        }
      },
      "5": {
        "start": {
          "line": 88,
          "column": 16
        },
        "end": {
          "line": 135,
          "column": 1
        }
      },
      "6": {
        "start": {
          "line": 136,
          "column": 13
        },
        "end": {
          "line": 151,
          "column": 1
        }
      },
      "7": {
        "start": {
          "line": 137,
          "column": 2
        },
        "end": {
          "line": 150,
          "column": 4
        }
      }
    }
  }
}