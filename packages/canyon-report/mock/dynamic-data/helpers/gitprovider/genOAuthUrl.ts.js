window["helpers/gitprovider/genOAuthUrl.ts"] = {
  "content": "function redirect_uri(type) {\n  return `${window.location.origin}/${type}/oauth`;\n}\nexport const genOAuthUrl = ({ url, type, clientID }) => {\n  // TODO 暂时还不知道state干嘛的\n  if (type === \"github\") {\n    return `${url}/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code&scope=user&state=STATE`;\n  } else if (type === \"gitlab\") {\n    return `https://gitlab.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code&state=STATE`;\n  } else if (type === \"gitee\") {\n    return `https://gitee.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirect_uri(type)}&response_type=code`;\n  } else {\n    return \"\";\n  }\n};\n",
  "coverage": {
    "path": "helpers/gitprovider/genOAuthUrl.ts",
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
      "0": 0,
      "1": 8,
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
            "line": 6,
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
              "line": 6,
              "column": 2
            },
            "end": {
              "line": 14,
              "column": 3
            }
          },
          {
            "start": {
              "line": 8,
              "column": 9
            },
            "end": {
              "line": 14,
              "column": 3
            }
          }
        ],
        "line": 6
      },
      "1": {
        "loc": {
          "start": {
            "line": 8,
            "column": 9
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
              "line": 8,
              "column": 9
            },
            "end": {
              "line": 14,
              "column": 3
            }
          },
          {
            "start": {
              "line": 10,
              "column": 9
            },
            "end": {
              "line": 14,
              "column": 3
            }
          }
        ],
        "line": 8
      },
      "2": {
        "loc": {
          "start": {
            "line": 10,
            "column": 9
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
              "line": 10,
              "column": 9
            },
            "end": {
              "line": 14,
              "column": 3
            }
          },
          {
            "start": {
              "line": 12,
              "column": 9
            },
            "end": {
              "line": 14,
              "column": 3
            }
          }
        ],
        "line": 10
      }
    },
    "fnMap": {
      "0": {
        "name": "redirect_uri",
        "decl": {
          "start": {
            "line": 1,
            "column": 9
          },
          "end": {
            "line": 1,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 1,
            "column": 28
          },
          "end": {
            "line": 3,
            "column": 1
          }
        },
        "line": 1
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 4,
            "column": 27
          },
          "end": {
            "line": 4,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 4,
            "column": 56
          },
          "end": {
            "line": 15,
            "column": 1
          }
        },
        "line": 4
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 2,
          "column": 2
        },
        "end": {
          "line": 2,
          "column": 51
        }
      },
      "1": {
        "start": {
          "line": 4,
          "column": 27
        },
        "end": {
          "line": 15,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 6,
          "column": 2
        },
        "end": {
          "line": 14,
          "column": 3
        }
      },
      "3": {
        "start": {
          "line": 7,
          "column": 4
        },
        "end": {
          "line": 7,
          "column": 141
        }
      },
      "4": {
        "start": {
          "line": 8,
          "column": 9
        },
        "end": {
          "line": 14,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 9,
          "column": 4
        },
        "end": {
          "line": 9,
          "column": 136
        }
      },
      "6": {
        "start": {
          "line": 10,
          "column": 9
        },
        "end": {
          "line": 14,
          "column": 3
        }
      },
      "7": {
        "start": {
          "line": 11,
          "column": 4
        },
        "end": {
          "line": 11,
          "column": 123
        }
      },
      "8": {
        "start": {
          "line": 13,
          "column": 4
        },
        "end": {
          "line": 13,
          "column": 14
        }
      }
    }
  }
}