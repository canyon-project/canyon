window["components/CanyonReport/line/coverage.tsx"] = {
  "content": "// import { CSSProperties } from 'react';\n\nimport { getViewLineHeight } from \"../../../helpers/utils/getViewLineHeight.tsx\";\n\nconst LineCoverage = ({ covers, theme }) => {\n  const viewLineHeight = getViewLineHeight();\n  return (\n    <div style={{ textAlign: \"right\" }}>\n      {covers.map(({ covered, hits }, index) => {\n        if (covered === \"yes\") {\n          return (\n            <div\n              key={index}\n              style={{\n                backgroundColor:\n                  theme === \"light\" ? \"rgb(230,245,208)\" : \"#0A6640\",\n                color: theme === \"light\" ? \"rgba(0,0,0,0.5)\" : \"#eaeaea\",\n                padding: \"0 5px\",\n                height: `${viewLineHeight}px`,\n                lineHeight: `${viewLineHeight}px`,\n              }}\n            >\n              {hits}x\n            </div>\n          );\n        } else if (covered === \"no\") {\n          return (\n            <div\n              key={index}\n              style={{\n                backgroundColor: theme === \"light\" ? \"#FCE1E5\" : \"#7A5474\",\n                color: theme === \"light\" ? \"rgba(0,0,0,0.5)\" : \"#eaeaea\",\n                padding: \"0 5px\",\n                height: `${viewLineHeight}px`,\n              }}\n            ></div>\n          );\n        } else {\n          return (\n            <div\n              key={index}\n              style={{\n                backgroundColor:\n                  theme === \"light\" ? \"rgb(234,234,234)\" : \"rgb(45, 52, 54)\",\n                color: theme === \"light\" ? \"rgba(0,0,0,0.5)\" : \"#eaeaea\",\n                padding: \"0 5px\",\n                height: `${viewLineHeight}px`,\n              }}\n            ></div>\n          );\n        }\n      })}\n    </div>\n  );\n};\n\nexport default LineCoverage;\n",
  "coverage": {
    "path": "components/CanyonReport/line/coverage.tsx",
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
        0
      ],
      "7": [
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
      "7": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 10,
            "column": 8
          },
          "end": {
            "line": 51,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 10,
              "column": 8
            },
            "end": {
              "line": 51,
              "column": 9
            }
          },
          {
            "start": {
              "line": 26,
              "column": 15
            },
            "end": {
              "line": 51,
              "column": 9
            }
          }
        ],
        "line": 10
      },
      "1": {
        "loc": {
          "start": {
            "line": 16,
            "column": 18
          },
          "end": {
            "line": 16,
            "column": 68
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 16,
              "column": 38
            },
            "end": {
              "line": 16,
              "column": 56
            }
          },
          {
            "start": {
              "line": 16,
              "column": 59
            },
            "end": {
              "line": 16,
              "column": 68
            }
          }
        ],
        "line": 16
      },
      "2": {
        "loc": {
          "start": {
            "line": 17,
            "column": 23
          },
          "end": {
            "line": 17,
            "column": 72
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 17,
              "column": 43
            },
            "end": {
              "line": 17,
              "column": 60
            }
          },
          {
            "start": {
              "line": 17,
              "column": 63
            },
            "end": {
              "line": 17,
              "column": 72
            }
          }
        ],
        "line": 17
      },
      "3": {
        "loc": {
          "start": {
            "line": 26,
            "column": 15
          },
          "end": {
            "line": 51,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 26,
              "column": 15
            },
            "end": {
              "line": 51,
              "column": 9
            }
          },
          {
            "start": {
              "line": 38,
              "column": 15
            },
            "end": {
              "line": 51,
              "column": 9
            }
          }
        ],
        "line": 26
      },
      "4": {
        "loc": {
          "start": {
            "line": 31,
            "column": 33
          },
          "end": {
            "line": 31,
            "column": 74
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 31,
              "column": 53
            },
            "end": {
              "line": 31,
              "column": 62
            }
          },
          {
            "start": {
              "line": 31,
              "column": 65
            },
            "end": {
              "line": 31,
              "column": 74
            }
          }
        ],
        "line": 31
      },
      "5": {
        "loc": {
          "start": {
            "line": 32,
            "column": 23
          },
          "end": {
            "line": 32,
            "column": 72
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 32,
              "column": 43
            },
            "end": {
              "line": 32,
              "column": 60
            }
          },
          {
            "start": {
              "line": 32,
              "column": 63
            },
            "end": {
              "line": 32,
              "column": 72
            }
          }
        ],
        "line": 32
      },
      "6": {
        "loc": {
          "start": {
            "line": 44,
            "column": 18
          },
          "end": {
            "line": 44,
            "column": 76
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 44,
              "column": 38
            },
            "end": {
              "line": 44,
              "column": 56
            }
          },
          {
            "start": {
              "line": 44,
              "column": 59
            },
            "end": {
              "line": 44,
              "column": 76
            }
          }
        ],
        "line": 44
      },
      "7": {
        "loc": {
          "start": {
            "line": 45,
            "column": 23
          },
          "end": {
            "line": 45,
            "column": 72
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 45,
              "column": 43
            },
            "end": {
              "line": 45,
              "column": 60
            }
          },
          {
            "start": {
              "line": 45,
              "column": 63
            },
            "end": {
              "line": 45,
              "column": 72
            }
          }
        ],
        "line": 45
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 5,
            "column": 21
          },
          "end": {
            "line": 5,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 5,
            "column": 44
          },
          "end": {
            "line": 55,
            "column": 1
          }
        },
        "line": 5
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 9,
            "column": 18
          },
          "end": {
            "line": 9,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 9,
            "column": 48
          },
          "end": {
            "line": 52,
            "column": 7
          }
        },
        "line": 9
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 5,
          "column": 21
        },
        "end": {
          "line": 55,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 6,
          "column": 25
        },
        "end": {
          "line": 6,
          "column": 44
        }
      },
      "2": {
        "start": {
          "line": 7,
          "column": 2
        },
        "end": {
          "line": 54,
          "column": 4
        }
      },
      "3": {
        "start": {
          "line": 10,
          "column": 8
        },
        "end": {
          "line": 51,
          "column": 9
        }
      },
      "4": {
        "start": {
          "line": 11,
          "column": 10
        },
        "end": {
          "line": 25,
          "column": 12
        }
      },
      "5": {
        "start": {
          "line": 26,
          "column": 15
        },
        "end": {
          "line": 51,
          "column": 9
        }
      },
      "6": {
        "start": {
          "line": 27,
          "column": 10
        },
        "end": {
          "line": 37,
          "column": 12
        }
      },
      "7": {
        "start": {
          "line": 39,
          "column": 10
        },
        "end": {
          "line": 50,
          "column": 12
        }
      }
    }
  }
}