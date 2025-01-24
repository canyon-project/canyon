window["components/CanyonReport/PrepareProdFn.tsx"] = {
  "content": "import React, { useState } from \"react\";\nimport { Alert, Button, Drawer } from \"antd\";\nimport { Editor } from \"@monaco-editor/react\";\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\n\nconst PrepareProdFn: React.FC = () => {\n  const [open, setOpen] = useState(false);\n  const prm = useParams();\n  const [spams] = useSearchParams();\n  const { data, loading, run } = useRequest(\n    () =>\n      axios\n        .post(\n          atob(`aHR0cHM6Ly90cmlwY2FueW9uLmZ3cy5xYS5udC5jdHJpcGNvcnAuY29t`) +\n            \"/api/coverage/prepareProdFn\",\n          {\n            projectID: prm.id,\n            sha: prm.sha,\n            username: localStorage.getItem(\"username\"),\n            path: spams.get(\"path\"),\n          },\n        )\n        .then(({ data }) => data),\n    {\n      manual: true,\n    },\n  );\n\n  const {\n    data: da1,\n    run: run1,\n    loading: loading1,\n  } = useRequest(\n    () =>\n      axios\n        .post(\n          atob(`aHR0cHM6Ly90cmlwY2FueW9uLmZ3cy5xYS5udC5jdHJpcGNvcnAuY29t`) +\n            \"/flytest-api-ctrip-coffeebean-transfer/api/task/triggerPullTrafficByFn\",\n          data,\n        )\n        .then(({ data }) => data),\n    {\n      manual: true,\n      onSuccess() {\n        message.success(\"开始转换，请留意后续Flybirds消息推送\");\n      },\n    },\n  );\n\n  const showDrawer = () => {\n    setOpen(true);\n  };\n\n  const onClose = () => {\n    setOpen(false);\n  };\n\n  useEffect(() => {\n    if (open) {\n      run();\n    }\n  }, [open]);\n\n  return (\n    <>\n      {[\n        \"tripgl-37885-auto\",\n        \"tripgl-62594-auto\",\n        \"tripgl-108960-auto\",\n      ].includes(prm.id || \"\") && (\n        <Button type=\"primary\" onClick={showDrawer} size={\"small\"}>\n          转换生产流量为测试用例\n        </Button>\n      )}\n\n      <Drawer\n        title=\"转换生产流量为测试用例\"\n        onClose={onClose}\n        open={open}\n        destroyOnClose\n        width={\"75%\"}\n      >\n        <Spin spinning={loading}>\n          <Button type={\"primary\"} onClick={run1} loading={loading1}>\n            确认转换\n          </Button>\n          <div className={\"h-2\"} />\n          <Alert\n            message={\n              \"以下是拉取的Canyon测试未覆盖函数，MPASS生产已覆盖的流量数据\"\n            }\n          />\n          <div className={\"h-2\"} />\n          <Editor\n            language={\"json\"}\n            value={JSON.stringify(data || {}, null, 2)}\n            height={\"70vh\"}\n          />\n        </Spin>\n      </Drawer>\n    </>\n  );\n};\n\nexport default PrepareProdFn;\n",
  "coverage": {
    "path": "components/CanyonReport/PrepareProdFn.tsx",
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
      ]
    },
    "f": {
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
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 60,
            "column": 4
          },
          "end": {
            "line": 62,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 60,
              "column": 4
            },
            "end": {
              "line": 62,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 60
      },
      "1": {
        "loc": {
          "start": {
            "line": 67,
            "column": 7
          },
          "end": {
            "line": 75,
            "column": 7
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 67,
              "column": 7
            },
            "end": {
              "line": 71,
              "column": 30
            }
          },
          {
            "start": {
              "line": 72,
              "column": 8
            },
            "end": {
              "line": 74,
              "column": 17
            }
          }
        ],
        "line": 67
      },
      "2": {
        "loc": {
          "start": {
            "line": 71,
            "column": 17
          },
          "end": {
            "line": 71,
            "column": 29
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 71,
              "column": 17
            },
            "end": {
              "line": 71,
              "column": 23
            }
          },
          {
            "start": {
              "line": 71,
              "column": 27
            },
            "end": {
              "line": 71,
              "column": 29
            }
          }
        ],
        "line": 71
      },
      "3": {
        "loc": {
          "start": {
            "line": 97,
            "column": 34
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
              "column": 34
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
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 7,
            "column": 32
          },
          "end": {
            "line": 7,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 7,
            "column": 38
          },
          "end": {
            "line": 104,
            "column": 1
          }
        },
        "line": 7
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 12,
            "column": 4
          },
          "end": {
            "line": 12,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 6
          },
          "end": {
            "line": 24,
            "column": 33
          }
        },
        "line": 13
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 24,
            "column": 14
          },
          "end": {
            "line": 24,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 24,
            "column": 28
          },
          "end": {
            "line": 24,
            "column": 32
          }
        },
        "line": 24
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 35,
            "column": 4
          },
          "end": {
            "line": 35,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 36,
            "column": 6
          },
          "end": {
            "line": 42,
            "column": 33
          }
        },
        "line": 36
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 42,
            "column": 14
          },
          "end": {
            "line": 42,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 42,
            "column": 28
          },
          "end": {
            "line": 42,
            "column": 32
          }
        },
        "line": 42
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 45,
            "column": 6
          },
          "end": {
            "line": 45,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 45,
            "column": 18
          },
          "end": {
            "line": 47,
            "column": 7
          }
        },
        "line": 45
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 51,
            "column": 21
          },
          "end": {
            "line": 51,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 51,
            "column": 27
          },
          "end": {
            "line": 53,
            "column": 3
          }
        },
        "line": 51
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 55,
            "column": 18
          },
          "end": {
            "line": 55,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 55,
            "column": 24
          },
          "end": {
            "line": 57,
            "column": 3
          }
        },
        "line": 55
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 59,
            "column": 12
          },
          "end": {
            "line": 59,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 59,
            "column": 18
          },
          "end": {
            "line": 63,
            "column": 3
          }
        },
        "line": 59
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 32
        },
        "end": {
          "line": 104,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 8,
          "column": 26
        },
        "end": {
          "line": 8,
          "column": 41
        }
      },
      "2": {
        "start": {
          "line": 9,
          "column": 14
        },
        "end": {
          "line": 9,
          "column": 25
        }
      },
      "3": {
        "start": {
          "line": 10,
          "column": 18
        },
        "end": {
          "line": 10,
          "column": 35
        }
      },
      "4": {
        "start": {
          "line": 11,
          "column": 33
        },
        "end": {
          "line": 28,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 6
        },
        "end": {
          "line": 24,
          "column": 33
        }
      },
      "6": {
        "start": {
          "line": 24,
          "column": 28
        },
        "end": {
          "line": 24,
          "column": 32
        }
      },
      "7": {
        "start": {
          "line": 34,
          "column": 6
        },
        "end": {
          "line": 49,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 36,
          "column": 6
        },
        "end": {
          "line": 42,
          "column": 33
        }
      },
      "9": {
        "start": {
          "line": 42,
          "column": 28
        },
        "end": {
          "line": 42,
          "column": 32
        }
      },
      "10": {
        "start": {
          "line": 46,
          "column": 8
        },
        "end": {
          "line": 46,
          "column": 50
        }
      },
      "11": {
        "start": {
          "line": 51,
          "column": 21
        },
        "end": {
          "line": 53,
          "column": 3
        }
      },
      "12": {
        "start": {
          "line": 52,
          "column": 4
        },
        "end": {
          "line": 52,
          "column": 18
        }
      },
      "13": {
        "start": {
          "line": 55,
          "column": 18
        },
        "end": {
          "line": 57,
          "column": 3
        }
      },
      "14": {
        "start": {
          "line": 56,
          "column": 4
        },
        "end": {
          "line": 56,
          "column": 19
        }
      },
      "15": {
        "start": {
          "line": 59,
          "column": 2
        },
        "end": {
          "line": 63,
          "column": 13
        }
      },
      "16": {
        "start": {
          "line": 60,
          "column": 4
        },
        "end": {
          "line": 62,
          "column": 5
        }
      },
      "17": {
        "start": {
          "line": 61,
          "column": 6
        },
        "end": {
          "line": 61,
          "column": 12
        }
      },
      "18": {
        "start": {
          "line": 65,
          "column": 2
        },
        "end": {
          "line": 103,
          "column": 4
        }
      }
    }
  }
}