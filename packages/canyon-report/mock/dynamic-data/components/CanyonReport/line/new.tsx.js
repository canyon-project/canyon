window["components/CanyonReport/line/new.tsx"] = {
  "content": "import { getViewLineHeight } from \"../../../helpers/utils/getViewLineHeight.tsx\";\n\nconst LineNew = ({ news, count }) => {\n  const viewLineHeight = getViewLineHeight();\n  return (\n    <div style={{ width: \"16px\", textAlign: \"center\" }}>\n      {[...Array(count)].map((line, index) => {\n        return (\n          <div\n            style={{\n              height: `${viewLineHeight}px`,\n              backgroundColor: news.includes(index + 1)\n                ? \"rgb(75,156,78)\"\n                : \"rgba(0,0,0,0)\",\n              width: \"3.6px\",\n            }}\n          >\n            {/*{news.includes(index + 1) ? '+' : ''}*/}\n          </div>\n        );\n      })}\n    </div>\n  );\n};\n\nexport default LineNew;\n",
  "coverage": {
    "path": "components/CanyonReport/line/new.tsx",
    "b": {
      "0": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0
    },
    "s": {
      "0": 8,
      "1": 0,
      "2": 0,
      "3": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 12,
            "column": 31
          },
          "end": {
            "line": 14,
            "column": 33
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 13,
              "column": 18
            },
            "end": {
              "line": 13,
              "column": 34
            }
          },
          {
            "start": {
              "line": 14,
              "column": 18
            },
            "end": {
              "line": 14,
              "column": 33
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
            "line": 3,
            "column": 16
          },
          "end": {
            "line": 3,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 3,
            "column": 37
          },
          "end": {
            "line": 24,
            "column": 1
          }
        },
        "line": 3
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 7,
            "column": 29
          },
          "end": {
            "line": 7,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 7,
            "column": 46
          },
          "end": {
            "line": 21,
            "column": 7
          }
        },
        "line": 7
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 16
        },
        "end": {
          "line": 24,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 4,
          "column": 25
        },
        "end": {
          "line": 4,
          "column": 44
        }
      },
      "2": {
        "start": {
          "line": 5,
          "column": 2
        },
        "end": {
          "line": 23,
          "column": 4
        }
      },
      "3": {
        "start": {
          "line": 8,
          "column": 8
        },
        "end": {
          "line": 20,
          "column": 10
        }
      }
    }
  }
}