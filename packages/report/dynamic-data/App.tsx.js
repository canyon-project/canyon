window["App.tsx"] = {
  "content": "import enUS from \"antd/es/locale/en_US\";\nimport jaJP from \"antd/es/locale/ja_JP\";\nimport zhCN from \"antd/es/locale/zh_CN\";\nimport { useRoutes } from \"react-router-dom\";\n\nimport routes from \"~react-pages\";\n\nconst languages = {\n  cn: zhCN,\n  en: enUS,\n  ja: jaJP,\n};\n\nconst lng = (localStorage.getItem(\"language\") ||\n  \"cn\") as keyof typeof languages;\n\nconst { darkAlgorithm } = theme;\nconst App = () => {\n  const isDark = localStorage.getItem(\"theme\")\n    ? localStorage.getItem(\"theme\") === \"dark\"\n    : false;\n  return (\n    <div className={\"dark:text-white dark:text-opacity-85\"}>\n      <ConfigProvider\n        locale={languages[lng]}\n        theme={{\n          token: {\n            colorPrimary: \"#0071c2\",\n          },\n          algorithm: isDark ? [darkAlgorithm] : [],\n        }}\n      >\n        {useRoutes(routes)}\n      </ConfigProvider>\n    </div>\n  );\n};\n\nexport default App;\n",
  "coverage": {
    "path": "App.tsx",
    "b": {
      "0": [
        8,
        8
      ],
      "1": [
        0,
        32
      ],
      "2": [
        0,
        32
      ]
    },
    "f": {
      "0": 32
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 8,
      "4": 32,
      "5": 32
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 14,
            "column": 13
          },
          "end": {
            "line": 15,
            "column": 6
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 14,
              "column": 13
            },
            "end": {
              "line": 14,
              "column": 45
            }
          },
          {
            "start": {
              "line": 15,
              "column": 2
            },
            "end": {
              "line": 15,
              "column": 6
            }
          }
        ],
        "line": 14
      },
      "1": {
        "loc": {
          "start": {
            "line": 19,
            "column": 17
          },
          "end": {
            "line": 21,
            "column": 11
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 20,
              "column": 6
            },
            "end": {
              "line": 20,
              "column": 46
            }
          },
          {
            "start": {
              "line": 21,
              "column": 6
            },
            "end": {
              "line": 21,
              "column": 11
            }
          }
        ],
        "line": 19
      },
      "2": {
        "loc": {
          "start": {
            "line": 30,
            "column": 21
          },
          "end": {
            "line": 30,
            "column": 50
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 30,
              "column": 30
            },
            "end": {
              "line": 30,
              "column": 45
            }
          },
          {
            "start": {
              "line": 30,
              "column": 48
            },
            "end": {
              "line": 30,
              "column": 50
            }
          }
        ],
        "line": 30
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 18,
            "column": 12
          },
          "end": {
            "line": 18,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 18
          },
          "end": {
            "line": 37,
            "column": 1
          }
        },
        "line": 18
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 8,
          "column": 18
        },
        "end": {
          "line": 12,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 14,
          "column": 12
        },
        "end": {
          "line": 15,
          "column": 33
        }
      },
      "2": {
        "start": {
          "line": 17,
          "column": 26
        },
        "end": {
          "line": 17,
          "column": 31
        }
      },
      "3": {
        "start": {
          "line": 18,
          "column": 12
        },
        "end": {
          "line": 37,
          "column": 1
        }
      },
      "4": {
        "start": {
          "line": 19,
          "column": 17
        },
        "end": {
          "line": 21,
          "column": 11
        }
      },
      "5": {
        "start": {
          "line": 22,
          "column": 2
        },
        "end": {
          "line": 36,
          "column": 4
        }
      }
    }
  }
}