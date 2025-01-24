window["pages/index/settings/index.tsx"] = {
  "content": "import { SettingOutlined } from \"@ant-design/icons\";\nimport { TextTypography } from \"../../../components/ui\";\nimport { CanyonCardPrimary } from \"../../../components/old-ui\";\nimport copy from \"copy-to-clipboard\";\nimport { useTranslation } from \"react-i18next\";\n\nimport languages from \"../../../../languages.json\";\nimport Faa from \"./components/BindGitProvider.tsx\";\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nconst TextArea = Input.TextArea;\nconst gridStyle: any = {\n  width: \"100%\",\n};\nconst Settings = () => {\n  const { t } = useTranslation();\n  const { data } = useRequest(() =>\n    axios.get(\"/api/base\").then(({ data }) => data),\n  );\n  return (\n    <>\n      <TextTypography title={t(\"menus.settings\")} icon={<SettingOutlined />} />\n      <CanyonCardPrimary>\n        <Card title={t(\"settings.preference\")} bordered={false}>\n          <Card.Grid hoverable={false} style={gridStyle}>\n            <div className={\"flex\"}>\n              <div className={\"w-1/2\"}>{t(\"common.language\")}</div>\n\n              <div className={\"w-1/2\"}>\n                <Select\n                  value={localStorage.getItem(\"language\") || \"cn\"}\n                  onChange={(value) => {\n                    localStorage.setItem(\"language\", value);\n                    window.location.reload();\n                  }}\n                  options={languages.map((item) => {\n                    return {\n                      label: item.name,\n                      value: item.code,\n                    };\n                  })}\n                  className={\"w-[100%]\"}\n                />\n              </div>\n            </div>\n          </Card.Grid>\n\n          <Card.Grid hoverable={false} style={gridStyle}>\n            <div className={\"flex\"}>\n              <div className={\"w-1/2\"}>{t(\"common.theme\")}</div>\n\n              <div className={\"w-1/2\"}>\n                <Select\n                  value={localStorage.getItem(\"theme\") || \"light\"}\n                  onChange={(value) => {\n                    localStorage.setItem(\"theme\", value);\n                    window.location.reload();\n                  }}\n                  options={[\n                    {\n                      label: t(\"common.light\"),\n                      value: \"light\",\n                    },\n                    {\n                      label: t(\"common.dark\"),\n                      value: \"dark\",\n                    },\n                  ]}\n                  className={\"w-[100%]\"}\n                />\n              </div>\n            </div>\n          </Card.Grid>\n        </Card>\n      </CanyonCardPrimary>\n      <div className={\"h-5\"}></div>\n      <CanyonCardPrimary>\n        <Card title={t(\"settings.user_auth_tokens\")} bordered={false}>\n          <TextArea\n            onClick={() => {\n              copy(localStorage.getItem(\"token\") || \"\");\n              message.success(\"Copied to clipboard!\");\n            }}\n            value={localStorage.getItem(\"token\") || \"\"}\n            readOnly\n          />\n        </Card>\n      </CanyonCardPrimary>\n      <div className={\"h-5\"}></div>\n      <CanyonCardPrimary>\n        <Card title={\"Canyon服务接口地址\"} bordered={false}>\n          <Input\n            onClick={() => {\n              copy(data?.CANYON_SERVER || \"\");\n              message.success(\"Copied to clipboard!\");\n            }}\n            value={data?.CANYON_SERVER || \"\"}\n            readOnly\n          />\n        </Card>\n      </CanyonCardPrimary>\n      <div className={\"h-5\"}></div>\n      {localStorage.getItem(\"debug\") === \"true\" && <Faa />}\n    </>\n  );\n};\n\nexport default Settings;\n",
  "coverage": {
    "path": "pages/index/settings/index.tsx",
    "b": {
      "0": [
        10,
        10
      ],
      "1": [
        10,
        10
      ],
      "2": [
        0,
        0
      ],
      "3": [
        10,
        0
      ],
      "4": [
        0,
        0
      ],
      "5": [
        10,
        7
      ],
      "6": [
        10,
        0
      ]
    },
    "f": {
      "0": 10,
      "1": 4,
      "2": 3,
      "3": 0,
      "4": 30,
      "5": 0,
      "6": 0,
      "7": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 10,
      "4": 10,
      "5": 4,
      "6": 3,
      "7": 10,
      "8": 0,
      "9": 0,
      "10": 30,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 31,
            "column": 25
          },
          "end": {
            "line": 31,
            "column": 65
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 31,
              "column": 25
            },
            "end": {
              "line": 31,
              "column": 57
            }
          },
          {
            "start": {
              "line": 31,
              "column": 61
            },
            "end": {
              "line": 31,
              "column": 65
            }
          }
        ],
        "line": 31
      },
      "1": {
        "loc": {
          "start": {
            "line": 54,
            "column": 25
          },
          "end": {
            "line": 54,
            "column": 65
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 54,
              "column": 25
            },
            "end": {
              "line": 54,
              "column": 54
            }
          },
          {
            "start": {
              "line": 54,
              "column": 58
            },
            "end": {
              "line": 54,
              "column": 65
            }
          }
        ],
        "line": 54
      },
      "2": {
        "loc": {
          "start": {
            "line": 81,
            "column": 19
          },
          "end": {
            "line": 81,
            "column": 54
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 81,
              "column": 19
            },
            "end": {
              "line": 81,
              "column": 48
            }
          },
          {
            "start": {
              "line": 81,
              "column": 52
            },
            "end": {
              "line": 81,
              "column": 54
            }
          }
        ],
        "line": 81
      },
      "3": {
        "loc": {
          "start": {
            "line": 84,
            "column": 19
          },
          "end": {
            "line": 84,
            "column": 54
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 84,
              "column": 19
            },
            "end": {
              "line": 84,
              "column": 48
            }
          },
          {
            "start": {
              "line": 84,
              "column": 52
            },
            "end": {
              "line": 84,
              "column": 54
            }
          }
        ],
        "line": 84
      },
      "4": {
        "loc": {
          "start": {
            "line": 94,
            "column": 19
          },
          "end": {
            "line": 94,
            "column": 44
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 94,
              "column": 19
            },
            "end": {
              "line": 94,
              "column": 38
            }
          },
          {
            "start": {
              "line": 94,
              "column": 42
            },
            "end": {
              "line": 94,
              "column": 44
            }
          }
        ],
        "line": 94
      },
      "5": {
        "loc": {
          "start": {
            "line": 97,
            "column": 19
          },
          "end": {
            "line": 97,
            "column": 44
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 97,
              "column": 19
            },
            "end": {
              "line": 97,
              "column": 38
            }
          },
          {
            "start": {
              "line": 97,
              "column": 42
            },
            "end": {
              "line": 97,
              "column": 44
            }
          }
        ],
        "line": 97
      },
      "6": {
        "loc": {
          "start": {
            "line": 103,
            "column": 7
          },
          "end": {
            "line": 103,
            "column": 58
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 103,
              "column": 7
            },
            "end": {
              "line": 103,
              "column": 47
            }
          },
          {
            "start": {
              "line": 103,
              "column": 51
            },
            "end": {
              "line": 103,
              "column": 58
            }
          }
        ],
        "line": 103
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 15,
            "column": 17
          },
          "end": {
            "line": 15,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 23
          },
          "end": {
            "line": 106,
            "column": 1
          }
        },
        "line": 15
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 17,
            "column": 30
          },
          "end": {
            "line": 17,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 4
          },
          "end": {
            "line": 18,
            "column": 51
          }
        },
        "line": 18
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 18,
            "column": 32
          },
          "end": {
            "line": 18,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 46
          },
          "end": {
            "line": 18,
            "column": 50
          }
        },
        "line": 18
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 32,
            "column": 28
          },
          "end": {
            "line": 32,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 32,
            "column": 39
          },
          "end": {
            "line": 35,
            "column": 19
          }
        },
        "line": 32
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 36,
            "column": 41
          },
          "end": {
            "line": 36,
            "column": 42
          }
        },
        "loc": {
          "start": {
            "line": 36,
            "column": 51
          },
          "end": {
            "line": 41,
            "column": 19
          }
        },
        "line": 36
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 55,
            "column": 28
          },
          "end": {
            "line": 55,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 55,
            "column": 39
          },
          "end": {
            "line": 58,
            "column": 19
          }
        },
        "line": 55
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 80,
            "column": 21
          },
          "end": {
            "line": 80,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 80,
            "column": 27
          },
          "end": {
            "line": 83,
            "column": 13
          }
        },
        "line": 80
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 93,
            "column": 21
          },
          "end": {
            "line": 93,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 93,
            "column": 27
          },
          "end": {
            "line": 96,
            "column": 13
          }
        },
        "line": 93
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 11,
          "column": 17
        },
        "end": {
          "line": 11,
          "column": 31
        }
      },
      "1": {
        "start": {
          "line": 12,
          "column": 23
        },
        "end": {
          "line": 14,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 15,
          "column": 17
        },
        "end": {
          "line": 106,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 16,
          "column": 16
        },
        "end": {
          "line": 16,
          "column": 32
        }
      },
      "4": {
        "start": {
          "line": 17,
          "column": 19
        },
        "end": {
          "line": 19,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 18,
          "column": 4
        },
        "end": {
          "line": 18,
          "column": 51
        }
      },
      "6": {
        "start": {
          "line": 18,
          "column": 46
        },
        "end": {
          "line": 18,
          "column": 50
        }
      },
      "7": {
        "start": {
          "line": 20,
          "column": 2
        },
        "end": {
          "line": 105,
          "column": 4
        }
      },
      "8": {
        "start": {
          "line": 33,
          "column": 20
        },
        "end": {
          "line": 33,
          "column": 60
        }
      },
      "9": {
        "start": {
          "line": 34,
          "column": 20
        },
        "end": {
          "line": 34,
          "column": 45
        }
      },
      "10": {
        "start": {
          "line": 37,
          "column": 20
        },
        "end": {
          "line": 40,
          "column": 22
        }
      },
      "11": {
        "start": {
          "line": 56,
          "column": 20
        },
        "end": {
          "line": 56,
          "column": 57
        }
      },
      "12": {
        "start": {
          "line": 57,
          "column": 20
        },
        "end": {
          "line": 57,
          "column": 45
        }
      },
      "13": {
        "start": {
          "line": 81,
          "column": 14
        },
        "end": {
          "line": 81,
          "column": 56
        }
      },
      "14": {
        "start": {
          "line": 82,
          "column": 14
        },
        "end": {
          "line": 82,
          "column": 54
        }
      },
      "15": {
        "start": {
          "line": 94,
          "column": 14
        },
        "end": {
          "line": 94,
          "column": 46
        }
      },
      "16": {
        "start": {
          "line": 95,
          "column": 14
        },
        "end": {
          "line": 95,
          "column": 54
        }
      }
    }
  }
}