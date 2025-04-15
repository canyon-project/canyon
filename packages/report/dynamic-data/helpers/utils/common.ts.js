window["helpers/utils/common.ts"] = {
  "content": "// 用于文件base64解码后的格式化\nexport function getDecode(str: string) {\n  return decodeURIComponent(\n    atob(str)\n      .split(\"\")\n      .map(function (c) {\n        return \"%\" + (\"00\" + c.charCodeAt(0).toString(16)).slice(-2);\n      })\n      .join(\"\"),\n  );\n}\n\nexport function getCOlor(num) {\n  if (num >= 80) {\n    return \"rgb(33,181,119)\";\n  } else if (num >= 50) {\n    return \"rgb(244,176,27)\";\n  } else {\n    return \"rgb(245,32,32)\";\n  }\n}\n\nexport function percent(covered, total) {\n  let tmp;\n  if (total > 0) {\n    tmp = (1000 * 100 * covered) / total;\n    return Math.floor(tmp / 10) / 100;\n  } else {\n    return 100.0;\n  }\n}\n",
  "coverage": {
    "path": "helpers/utils/common.ts",
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
      "3": 0
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
      "10": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 14,
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
              "line": 14,
              "column": 2
            },
            "end": {
              "line": 20,
              "column": 3
            }
          },
          {
            "start": {
              "line": 16,
              "column": 9
            },
            "end": {
              "line": 20,
              "column": 3
            }
          }
        ],
        "line": 14
      },
      "1": {
        "loc": {
          "start": {
            "line": 16,
            "column": 9
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
              "column": 9
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
            "line": 25,
            "column": 2
          },
          "end": {
            "line": 30,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 25,
              "column": 2
            },
            "end": {
              "line": 30,
              "column": 3
            }
          },
          {
            "start": {
              "line": 28,
              "column": 9
            },
            "end": {
              "line": 30,
              "column": 3
            }
          }
        ],
        "line": 25
      }
    },
    "fnMap": {
      "0": {
        "name": "getDecode",
        "decl": {
          "start": {
            "line": 2,
            "column": 16
          },
          "end": {
            "line": 2,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 2,
            "column": 39
          },
          "end": {
            "line": 11,
            "column": 1
          }
        },
        "line": 2
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 6,
            "column": 11
          },
          "end": {
            "line": 6,
            "column": 12
          }
        },
        "loc": {
          "start": {
            "line": 6,
            "column": 24
          },
          "end": {
            "line": 8,
            "column": 7
          }
        },
        "line": 6
      },
      "2": {
        "name": "getCOlor",
        "decl": {
          "start": {
            "line": 13,
            "column": 16
          },
          "end": {
            "line": 13,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 30
          },
          "end": {
            "line": 21,
            "column": 1
          }
        },
        "line": 13
      },
      "3": {
        "name": "percent",
        "decl": {
          "start": {
            "line": 23,
            "column": 16
          },
          "end": {
            "line": 23,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 23,
            "column": 40
          },
          "end": {
            "line": 31,
            "column": 1
          }
        },
        "line": 23
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 2
        },
        "end": {
          "line": 10,
          "column": 4
        }
      },
      "1": {
        "start": {
          "line": 7,
          "column": 8
        },
        "end": {
          "line": 7,
          "column": 69
        }
      },
      "2": {
        "start": {
          "line": 14,
          "column": 2
        },
        "end": {
          "line": 20,
          "column": 3
        }
      },
      "3": {
        "start": {
          "line": 15,
          "column": 4
        },
        "end": {
          "line": 15,
          "column": 29
        }
      },
      "4": {
        "start": {
          "line": 16,
          "column": 9
        },
        "end": {
          "line": 20,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 17,
          "column": 4
        },
        "end": {
          "line": 17,
          "column": 29
        }
      },
      "6": {
        "start": {
          "line": 19,
          "column": 4
        },
        "end": {
          "line": 19,
          "column": 28
        }
      },
      "7": {
        "start": {
          "line": 25,
          "column": 2
        },
        "end": {
          "line": 30,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 26,
          "column": 4
        },
        "end": {
          "line": 26,
          "column": 41
        }
      },
      "9": {
        "start": {
          "line": 27,
          "column": 4
        },
        "end": {
          "line": 27,
          "column": 38
        }
      },
      "10": {
        "start": {
          "line": 29,
          "column": 4
        },
        "end": {
          "line": 29,
          "column": 17
        }
      }
    }
  }
}