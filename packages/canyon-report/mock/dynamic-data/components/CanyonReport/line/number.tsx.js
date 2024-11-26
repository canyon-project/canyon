window["components/CanyonReport/line/number.tsx"] = {
  "content": "import { getViewLineHeight } from \"../../../helpers/utils/getViewLineHeight.tsx\";\n\nconst LineNumber = ({ count, theme }) => {\n  const viewLineHeight = getViewLineHeight();\n  const style: any = {\n    color: theme === \"light\" ? \"#0074D9\" : \"#0074D9\",\n    textAlign: \"right\",\n    padding: \"0 5px 0 20px\",\n  };\n  setTimeout(() => {\n    try {\n      document\n        .getElementById(`${window.location.hash.replace(\"#\", \"\")}`)\n        .scrollIntoView();\n      window.scrollBy(0, -160); // 向上滚动160px\n    } catch (e) {\n      // console.error(e);\n    }\n  }, 0);\n\n  const activeLine = Number(window.location.hash.replace(\"#L\", \"\")) - 1;\n  return (\n    <div style={style}>\n      {[...Array(count)].map((i, index) => {\n        return (\n          <a\n            id={`L${index + 1}`}\n            href={`#L${index + 1}`}\n            className={\"cursor-pointer block\"}\n            style={{\n              height: `${viewLineHeight}px`,\n              lineHeight: `${viewLineHeight}px`,\n              color: index === activeLine ? \"red\" : \"unset\",\n              textDecoration: index === activeLine ? \"underline\" : \"unset\",\n            }}\n            key={index}\n          >\n            {index + 1}\n          </a>\n        );\n      })}\n    </div>\n  );\n};\n\nexport default LineNumber;\n",
  "coverage": {
    "path": "components/CanyonReport/line/number.tsx",
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
      "2": 0
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
      "9": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 6,
            "column": 11
          },
          "end": {
            "line": 6,
            "column": 52
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 6,
              "column": 31
            },
            "end": {
              "line": 6,
              "column": 40
            }
          },
          {
            "start": {
              "line": 6,
              "column": 43
            },
            "end": {
              "line": 6,
              "column": 52
            }
          }
        ],
        "line": 6
      },
      "1": {
        "loc": {
          "start": {
            "line": 33,
            "column": 21
          },
          "end": {
            "line": 33,
            "column": 59
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 33,
              "column": 44
            },
            "end": {
              "line": 33,
              "column": 49
            }
          },
          {
            "start": {
              "line": 33,
              "column": 52
            },
            "end": {
              "line": 33,
              "column": 59
            }
          }
        ],
        "line": 33
      },
      "2": {
        "loc": {
          "start": {
            "line": 34,
            "column": 30
          },
          "end": {
            "line": 34,
            "column": 74
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 34,
              "column": 53
            },
            "end": {
              "line": 34,
              "column": 64
            }
          },
          {
            "start": {
              "line": 34,
              "column": 67
            },
            "end": {
              "line": 34,
              "column": 74
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
            "line": 3,
            "column": 19
          },
          "end": {
            "line": 3,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 3,
            "column": 41
          },
          "end": {
            "line": 44,
            "column": 1
          }
        },
        "line": 3
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 10,
            "column": 13
          },
          "end": {
            "line": 10,
            "column": 14
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 19
          },
          "end": {
            "line": 19,
            "column": 3
          }
        },
        "line": 10
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 24,
            "column": 29
          },
          "end": {
            "line": 24,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 24,
            "column": 43
          },
          "end": {
            "line": 41,
            "column": 7
          }
        },
        "line": 24
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 19
        },
        "end": {
          "line": 44,
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
          "column": 21
        },
        "end": {
          "line": 9,
          "column": 3
        }
      },
      "3": {
        "start": {
          "line": 10,
          "column": 2
        },
        "end": {
          "line": 19,
          "column": 8
        }
      },
      "4": {
        "start": {
          "line": 11,
          "column": 4
        },
        "end": {
          "line": 18,
          "column": 5
        }
      },
      "5": {
        "start": {
          "line": 12,
          "column": 6
        },
        "end": {
          "line": 14,
          "column": 26
        }
      },
      "6": {
        "start": {
          "line": 15,
          "column": 6
        },
        "end": {
          "line": 15,
          "column": 31
        }
      },
      "7": {
        "start": {
          "line": 21,
          "column": 21
        },
        "end": {
          "line": 21,
          "column": 71
        }
      },
      "8": {
        "start": {
          "line": 22,
          "column": 2
        },
        "end": {
          "line": 43,
          "column": 4
        }
      },
      "9": {
        "start": {
          "line": 25,
          "column": 8
        },
        "end": {
          "line": 40,
          "column": 10
        }
      }
    }
  }
}