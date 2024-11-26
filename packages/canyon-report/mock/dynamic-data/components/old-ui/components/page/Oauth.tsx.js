window["components/old-ui/components/page/Oauth.tsx"] = {
  "content": "import { useEffect } from \"react\";\n\nconst CanyonPageOauth = ({ URLSearchParams, onOauthFail }) => {\n  const fetcher = (url: string) =>\n    fetch(url, {\n      method: \"POST\",\n      headers: {\n        \"Content-Type\": \"application/json\",\n      },\n      body: JSON.stringify({\n        code: URLSearchParams.get(\"code\"),\n        redirectUri: location.origin + \"/oauth\",\n      }),\n    })\n      .then((res) => res.json())\n      .then((res) => {\n        if (res.statusCode >= 400) {\n          message.error(res.message);\n          localStorage.clear();\n          onOauthFail();\n        } else {\n          localStorage.setItem(\"token\", res.token);\n          window.location.href = localStorage.getItem(\"callback\") || \"/\";\n        }\n      });\n  useEffect(() => {\n    fetcher(\"/api/oauth/token\");\n  }, []);\n\n  return <Spin spinning={true}>logging in...</Spin>;\n};\n\nexport default CanyonPageOauth;\n",
  "coverage": {
    "path": "components/old-ui/components/page/Oauth.tsx",
    "b": {
      "0": [
        0,
        0
      ],
      "1": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
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
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 17,
            "column": 8
          },
          "end": {
            "line": 24,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 17,
              "column": 8
            },
            "end": {
              "line": 24,
              "column": 9
            }
          },
          {
            "start": {
              "line": 21,
              "column": 15
            },
            "end": {
              "line": 24,
              "column": 9
            }
          }
        ],
        "line": 17
      },
      "1": {
        "loc": {
          "start": {
            "line": 23,
            "column": 33
          },
          "end": {
            "line": 23,
            "column": 72
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 23,
              "column": 33
            },
            "end": {
              "line": 23,
              "column": 65
            }
          },
          {
            "start": {
              "line": 23,
              "column": 69
            },
            "end": {
              "line": 23,
              "column": 72
            }
          }
        ],
        "line": 23
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 3,
            "column": 24
          },
          "end": {
            "line": 3,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 3,
            "column": 62
          },
          "end": {
            "line": 31,
            "column": 1
          }
        },
        "line": 3
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 4,
            "column": 18
          },
          "end": {
            "line": 4,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 5,
            "column": 4
          },
          "end": {
            "line": 25,
            "column": 8
          }
        },
        "line": 5
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 15,
            "column": 12
          },
          "end": {
            "line": 15,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 21
          },
          "end": {
            "line": 15,
            "column": 31
          }
        },
        "line": 15
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 16,
            "column": 12
          },
          "end": {
            "line": 16,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 16,
            "column": 21
          },
          "end": {
            "line": 25,
            "column": 7
          }
        },
        "line": 16
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 26,
            "column": 12
          },
          "end": {
            "line": 26,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 26,
            "column": 18
          },
          "end": {
            "line": 28,
            "column": 3
          }
        },
        "line": 26
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 24
        },
        "end": {
          "line": 31,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 4,
          "column": 18
        },
        "end": {
          "line": 25,
          "column": 8
        }
      },
      "2": {
        "start": {
          "line": 5,
          "column": 4
        },
        "end": {
          "line": 25,
          "column": 8
        }
      },
      "3": {
        "start": {
          "line": 15,
          "column": 21
        },
        "end": {
          "line": 15,
          "column": 31
        }
      },
      "4": {
        "start": {
          "line": 17,
          "column": 8
        },
        "end": {
          "line": 24,
          "column": 9
        }
      },
      "5": {
        "start": {
          "line": 18,
          "column": 10
        },
        "end": {
          "line": 18,
          "column": 37
        }
      },
      "6": {
        "start": {
          "line": 19,
          "column": 10
        },
        "end": {
          "line": 19,
          "column": 31
        }
      },
      "7": {
        "start": {
          "line": 20,
          "column": 10
        },
        "end": {
          "line": 20,
          "column": 24
        }
      },
      "8": {
        "start": {
          "line": 22,
          "column": 10
        },
        "end": {
          "line": 22,
          "column": 51
        }
      },
      "9": {
        "start": {
          "line": 23,
          "column": 10
        },
        "end": {
          "line": 23,
          "column": 73
        }
      },
      "10": {
        "start": {
          "line": 26,
          "column": 2
        },
        "end": {
          "line": 28,
          "column": 9
        }
      },
      "11": {
        "start": {
          "line": 27,
          "column": 4
        },
        "end": {
          "line": 27,
          "column": 32
        }
      },
      "12": {
        "start": {
          "line": 30,
          "column": 2
        },
        "end": {
          "line": 30,
          "column": 52
        }
      }
    }
  }
}