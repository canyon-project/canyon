window["pages/login/index.tsx"] = {
  "content": "import { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport { CanyonPageLogin } from \"../../components/old-ui\";\n\nimport logo from \"../../assets/light-logo.svg\";\n\nconst Login2 = () => {\n  const { data, loading: isLoading } = useRequest(() =>\n    axios.get(\"/api/base\").then(({ data }) => data),\n  );\n  if (isLoading) {\n    return <div>loading</div>;\n  }\n\n  return (\n    <div>\n      <Alert\n        showIcon={false}\n        message={\n          <div className={\"text-center\"}>\n            携程用户请直接点击右上角的“Sign in with Gitlab”登陆！！！\n          </div>\n        }\n        banner\n      />\n      <CanyonPageLogin\n        logo={<img src={logo} className={\"w-[36px]\"} alt=\"\" />}\n        oauthUrl={{\n          gitlab: `${data?.GITLAB_URL}/oauth/authorize?response_type=code&state=STATE&scope=api&client_id=${data?.GITLAB_CLIENT_ID}&redirect_uri=${window.location.origin}/oauth`,\n        }}\n        onLoginSuccess={() => {\n          setTimeout(() => {\n            window.location.href = \"/\";\n          }, 100);\n        }}\n      />\n    </div>\n  );\n};\n\nexport default Login2;\n",
  "coverage": {
    "path": "pages/login/index.tsx",
    "b": {
      "0": [
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
      "0": 0,
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
            "line": 11,
            "column": 2
          },
          "end": {
            "line": 13,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 11,
              "column": 2
            },
            "end": {
              "line": 13,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 11
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 7,
            "column": 15
          },
          "end": {
            "line": 7,
            "column": 16
          }
        },
        "loc": {
          "start": {
            "line": 7,
            "column": 21
          },
          "end": {
            "line": 39,
            "column": 1
          }
        },
        "line": 7
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 8,
            "column": 50
          },
          "end": {
            "line": 8,
            "column": 51
          }
        },
        "loc": {
          "start": {
            "line": 9,
            "column": 4
          },
          "end": {
            "line": 9,
            "column": 51
          }
        },
        "line": 9
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 9,
            "column": 32
          },
          "end": {
            "line": 9,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 9,
            "column": 46
          },
          "end": {
            "line": 9,
            "column": 50
          }
        },
        "line": 9
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 31,
            "column": 24
          },
          "end": {
            "line": 31,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 31,
            "column": 30
          },
          "end": {
            "line": 35,
            "column": 9
          }
        },
        "line": 31
      },
      "4": {
        "name": "(anonymous_4)",
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
            "line": 32,
            "column": 27
          },
          "end": {
            "line": 34,
            "column": 11
          }
        },
        "line": 32
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 15
        },
        "end": {
          "line": 39,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 8,
          "column": 39
        },
        "end": {
          "line": 10,
          "column": 3
        }
      },
      "2": {
        "start": {
          "line": 9,
          "column": 4
        },
        "end": {
          "line": 9,
          "column": 51
        }
      },
      "3": {
        "start": {
          "line": 9,
          "column": 46
        },
        "end": {
          "line": 9,
          "column": 50
        }
      },
      "4": {
        "start": {
          "line": 11,
          "column": 2
        },
        "end": {
          "line": 13,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 12,
          "column": 4
        },
        "end": {
          "line": 12,
          "column": 30
        }
      },
      "6": {
        "start": {
          "line": 15,
          "column": 2
        },
        "end": {
          "line": 38,
          "column": 4
        }
      },
      "7": {
        "start": {
          "line": 32,
          "column": 10
        },
        "end": {
          "line": 34,
          "column": 18
        }
      },
      "8": {
        "start": {
          "line": 33,
          "column": 12
        },
        "end": {
          "line": 33,
          "column": 39
        }
      }
    }
  }
}