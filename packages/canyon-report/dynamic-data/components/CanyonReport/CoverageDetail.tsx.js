window["components/CanyonReport/CoverageDetail.tsx"] = {
  "content": "import { coreFn } from \"./helper.tsx\";\nimport LineCoverage from \"./line/coverage.tsx\";\nimport LineNew from \"./line/new.tsx\";\nimport LineNumber from \"./line/number.tsx\";\nimport ShikiDetail from \"./ShikiDetail.tsx\";\n\nconst CanyonReportCoverageDetail = ({ data, theme }: any) => {\n  const code = data.sourcecode;\n  const { lines } = coreFn(data.coverage, code);\n  return (\n    <>\n      <div\n        className={\"canyon-report\"}\n        style={{\n          display: \"flex\",\n          fontSize: \"12px\",\n          lineHeight: \"14px\",\n          // backgroundColor: theme === 'dark' ? '#1a1b26' : 'white',\n        }}\n      >\n        <LineNumber theme={theme} count={code.split(\"\\n\").length} />\n        <LineNew\n          count={code.split(\"\\n\").length}\n          news={data?.newlines || []}\n        ></LineNew>\n        <LineCoverage\n          theme={theme}\n          covers={lines.map((i) => {\n            if (i.executionNumber > 0) {\n              return {\n                covered: \"yes\",\n                hits: i.executionNumber,\n              };\n            } else if (i.executionNumber === 0) {\n              return {\n                covered: \"no\",\n                hits: i.executionNumber,\n              };\n            } else {\n              return {\n                covered: \"neutral\",\n                hits: 0,\n              };\n            }\n          })}\n        />\n        <ShikiDetail\n          defaultValue={data?.sourcecode}\n          filecoverage={data.coverage}\n          theme={theme}\n        />\n      </div>\n    </>\n  );\n};\n\nexport default CanyonReportCoverageDetail;\n",
  "coverage": {
    "path": "components/CanyonReport/CoverageDetail.tsx",
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
      "1": 0
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
      "8": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 24,
            "column": 16
          },
          "end": {
            "line": 24,
            "column": 36
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 24,
              "column": 16
            },
            "end": {
              "line": 24,
              "column": 30
            }
          },
          {
            "start": {
              "line": 24,
              "column": 34
            },
            "end": {
              "line": 24,
              "column": 36
            }
          }
        ],
        "line": 24
      },
      "1": {
        "loc": {
          "start": {
            "line": 29,
            "column": 12
          },
          "end": {
            "line": 44,
            "column": 13
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 29,
              "column": 12
            },
            "end": {
              "line": 44,
              "column": 13
            }
          },
          {
            "start": {
              "line": 34,
              "column": 19
            },
            "end": {
              "line": 44,
              "column": 13
            }
          }
        ],
        "line": 29
      },
      "2": {
        "loc": {
          "start": {
            "line": 34,
            "column": 19
          },
          "end": {
            "line": 44,
            "column": 13
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 34,
              "column": 19
            },
            "end": {
              "line": 44,
              "column": 13
            }
          },
          {
            "start": {
              "line": 39,
              "column": 19
            },
            "end": {
              "line": 44,
              "column": 13
            }
          }
        ],
        "line": 34
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 7,
            "column": 35
          },
          "end": {
            "line": 7,
            "column": 36
          }
        },
        "loc": {
          "start": {
            "line": 7,
            "column": 61
          },
          "end": {
            "line": 55,
            "column": 1
          }
        },
        "line": 7
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 28,
            "column": 28
          },
          "end": {
            "line": 28,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 28,
            "column": 35
          },
          "end": {
            "line": 45,
            "column": 11
          }
        },
        "line": 28
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 35
        },
        "end": {
          "line": 55,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 8,
          "column": 15
        },
        "end": {
          "line": 8,
          "column": 30
        }
      },
      "2": {
        "start": {
          "line": 9,
          "column": 20
        },
        "end": {
          "line": 9,
          "column": 47
        }
      },
      "3": {
        "start": {
          "line": 10,
          "column": 2
        },
        "end": {
          "line": 54,
          "column": 4
        }
      },
      "4": {
        "start": {
          "line": 29,
          "column": 12
        },
        "end": {
          "line": 44,
          "column": 13
        }
      },
      "5": {
        "start": {
          "line": 30,
          "column": 14
        },
        "end": {
          "line": 33,
          "column": 16
        }
      },
      "6": {
        "start": {
          "line": 34,
          "column": 19
        },
        "end": {
          "line": 44,
          "column": 13
        }
      },
      "7": {
        "start": {
          "line": 35,
          "column": 14
        },
        "end": {
          "line": 38,
          "column": 16
        }
      },
      "8": {
        "start": {
          "line": 40,
          "column": 14
        },
        "end": {
          "line": 43,
          "column": 16
        }
      }
    }
  }
}