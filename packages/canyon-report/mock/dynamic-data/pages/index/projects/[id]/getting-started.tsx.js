window["pages/index/projects/[id]/getting-started.tsx"] = {
  "content": "import { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport { useNavigate } from \"react-router-dom\";\n\nimport CopyCode from \"../../../../components/app/CopyCode.tsx\";\nimport { gettingStartedContent } from \"../../../../components/app/getting-started-content.ts\";\nconst { Title, Text } = Typography;\n// import CopyCode from '../components/CopyCode.tsx';\n// import { gettingStartedContent } from '../components/getting- started-content.ts';\nconst ProjectGettingStarted = () => {\n  const nav = useNavigate();\n  const { data } = useRequest(() =>\n    axios.get(\"/api/base\").then(({ data }) => data),\n  );\n  return (\n    <div className={\"\"}>\n      <Title level={2}>Configure Babel</Title>\n      <Divider />\n      <Title level={4}>Install</Title>\n      <Text>\n        Add the canyon and istanbul babel plugin as a dependency using npm:\n      </Text>\n      <CopyCode code={gettingStartedContent.babel} />\n      <Title level={4}>Configure Babel</Title>\n      <Text>Add the following configuration to babel:</Text>\n      <CopyCode code={gettingStartedContent.webpack} />\n      <Title level={4}>Next Steps</Title>\n      <Space>\n        <Button\n          type={\"primary\"}\n          onClick={() => {\n            window.open(data?.SYSTEM_QUESTION_LINK);\n          }}\n        >\n          Take me to Report the first coverage\n        </Button>\n        <Button\n          onClick={() => {\n            nav(`/projects`);\n          }}\n        >\n          Take me to Projects\n        </Button>\n      </Space>\n    </div>\n  );\n};\n\nexport default ProjectGettingStarted;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/getting-started.tsx",
    "b": {},
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 10,
            "column": 30
          },
          "end": {
            "line": 10,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 36
          },
          "end": {
            "line": 47,
            "column": 1
          }
        },
        "line": 10
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 12,
            "column": 30
          },
          "end": {
            "line": 12,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 4
          },
          "end": {
            "line": 13,
            "column": 51
          }
        },
        "line": 13
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 13,
            "column": 32
          },
          "end": {
            "line": 13,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 46
          },
          "end": {
            "line": 13,
            "column": 50
          }
        },
        "line": 13
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 31,
            "column": 19
          },
          "end": {
            "line": 31,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 31,
            "column": 25
          },
          "end": {
            "line": 33,
            "column": 11
          }
        },
        "line": 31
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 38,
            "column": 19
          },
          "end": {
            "line": 38,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 38,
            "column": 25
          },
          "end": {
            "line": 40,
            "column": 11
          }
        },
        "line": 38
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 24
        },
        "end": {
          "line": 7,
          "column": 34
        }
      },
      "1": {
        "start": {
          "line": 10,
          "column": 30
        },
        "end": {
          "line": 47,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 11,
          "column": 14
        },
        "end": {
          "line": 11,
          "column": 27
        }
      },
      "3": {
        "start": {
          "line": 12,
          "column": 19
        },
        "end": {
          "line": 14,
          "column": 3
        }
      },
      "4": {
        "start": {
          "line": 13,
          "column": 4
        },
        "end": {
          "line": 13,
          "column": 51
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 46
        },
        "end": {
          "line": 13,
          "column": 50
        }
      },
      "6": {
        "start": {
          "line": 15,
          "column": 2
        },
        "end": {
          "line": 46,
          "column": 4
        }
      },
      "7": {
        "start": {
          "line": 32,
          "column": 12
        },
        "end": {
          "line": 32,
          "column": 52
        }
      },
      "8": {
        "start": {
          "line": 39,
          "column": 12
        },
        "end": {
          "line": 39,
          "column": 29
        }
      }
    }
  }
}