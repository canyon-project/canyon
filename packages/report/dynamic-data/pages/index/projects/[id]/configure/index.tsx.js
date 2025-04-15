window["pages/index/projects/[id]/configure/index.tsx"] = {
  "content": "import Icon, { AppstoreOutlined, ExperimentOutlined } from \"@ant-design/icons\";\nimport { useMutation, useQuery } from \"@apollo/client\";\nimport { Editor } from \"@monaco-editor/react\";\nimport { FormRegion, TextTypography } from \"../../../../../components/ui\";\n\nimport {\n  GetProjectByIdDocument,\n  UpdateProjectDocument,\n} from \"../../../../../helpers/backend/gen/graphql.ts\";\nimport BasicForms from \"./helper/BasicForms.tsx\";\nimport { SolarUserIdLinear } from \"./helper/icons/SolarUserIdLinear.tsx\";\nimport MemberTable from \"./helper/MemberTable.tsx\";\nimport TagTable from \"./helper/TagTable.tsx\";\nconst gridStyle: any = {\n  width: \"100%\",\n};\nconst { Text } = Typography;\nconst { useToken } = theme;\nconst ProjectConfigure = () => {\n  const prm: any = useParams();\n  const { token } = useToken();\n  const { t } = useTranslation();\n  const { data: GetProjectByIdDocumentData } = useQuery(\n    GetProjectByIdDocument,\n    {\n      variables: {\n        projectID: prm.id,\n      },\n      fetchPolicy: \"no-cache\",\n    },\n  );\n  const [updateProject] = useMutation(UpdateProjectDocument);\n  const showMessage = () => {\n    message.success(\"保存成功\");\n  };\n  const [coverage, setCoverage] = useState<string>(\"\");\n\n  const [defaultBranch, setDefaultBranch] = useState<string>(\"\");\n\n  const basicFormsRef = useRef<any>(null);\n  return (\n    <div>\n      <TextTypography\n        title={t(\"projects.config.title\")}\n        icon={<AppstoreOutlined />}\n      />\n      <FormRegion\n        title={t(\"projects.config.basic.information\")}\n        icon={<Icon component={SolarUserIdLinear} />}\n        onSave={() => {\n          basicFormsRef.current?.submit();\n        }}\n      >\n        <BasicForms\n          ref={basicFormsRef}\n          data={GetProjectByIdDocumentData?.getProjectByID}\n        />\n      </FormRegion>\n      <div className={\"h-5\"}></div>\n      <Card\n        title={\n          <div className={\"flex items-center\"}>\n            <ExperimentOutlined className={\"text-[#687076] mr-2 text-[16px]\"} />\n            <span>{t(\"projects.config.coverage\")}</span>\n          </div>\n        }\n      >\n        <Card.Grid hoverable={false} style={gridStyle}>\n          <div className={\"mb-5\"}>\n            <div className={\"mb-2\"}>\n              <div>{t(\"projects.default.branch\")}</div>\n              <Text className={\"text-xs\"} type={\"secondary\"}>\n                {t(\"projects.config.default.branch.desc\")}\n              </Text>\n            </div>\n            {GetProjectByIdDocumentData && (\n              <Select\n                defaultValue={\n                  GetProjectByIdDocumentData?.getProjectByID.defaultBranch\n                }\n                placeholder={\"请选择默认分支\"}\n                className={\"w-[240px]\"}\n                showSearch={true}\n                options={(\n                  GetProjectByIdDocumentData?.getProjectByID.branchOptions || []\n                ).map((item) => ({\n                  label: item,\n                  value: item,\n                }))}\n                onSelect={(value) => {\n                  setDefaultBranch(value as string);\n                }}\n              />\n            )}\n          </div>\n\n          <div className={\"mb-5\"}>\n            <div className={\"mb-2\"}>\n              <div>{t(\"projects.config.detection.range\")}</div>\n              <Text className={\"text-xs\"} type={\"secondary\"}>\n                {t(\"projects.config.tooltips\")}\n                <a\n                  href=\"https://github.com/isaacs/minimatch\"\n                  target={\"_blank\"}\n                  rel=\"noreferrer\"\n                >\n                  {t(\"projects.config.minimatch\")}\n                </a>\n                <a\n                  href=\"https://github.com/canyon-project/canyon/tree/main/examples/config/coverage.json\"\n                  target={\"_blank\"}\n                  rel=\"noreferrer\"\n                >\n                  {t(\"projects.config.view.example\")}\n                </a>\n                <span className={\"ml-2\"}>{t(\"projects.config.example2\")}</span>\n              </Text>\n            </div>\n            <div style={{ border: \"1px solid \" + token.colorBorder }}>\n              {GetProjectByIdDocumentData?.getProjectByID && (\n                <Editor\n                  theme={\n                    {\n                      light: \"light\",\n                      dark: \"vs-dark\",\n                    }[localStorage.getItem(\"theme\") || \"light\"]\n                  }\n                  defaultValue={\n                    GetProjectByIdDocumentData?.getProjectByID.coverage\n                  }\n                  onChange={(value) => {\n                    setCoverage(value || \"\");\n                  }}\n                  height={\"240px\"}\n                  language={\"json\"}\n                  options={{\n                    minimap: {\n                      enabled: false,\n                    },\n                    fontSize: 12,\n                    wordWrap: \"wordWrapColumn\",\n                    automaticLayout: true,\n                    scrollBeyondLastLine: false,\n                  }}\n                />\n              )}\n            </div>\n          </div>\n          <Button\n            type={\"primary\"}\n            onClick={() => {\n              try {\n                // coverage用户输入了才检测\n                if (coverage !== \"\") {\n                  JSON.parse(coverage);\n                }\n\n                updateProject({\n                  variables: {\n                    projectID: prm.id,\n                    coverage:\n                      coverage ||\n                      GetProjectByIdDocumentData?.getProjectByID.coverage ||\n                      \"\",\n                    description: \"__null__\",\n                    defaultBranch:\n                      defaultBranch ||\n                      GetProjectByIdDocumentData?.getProjectByID\n                        .defaultBranch ||\n                      \"-\",\n                  },\n                }).then(() => {\n                  showMessage();\n                });\n              } catch (e) {\n                message.error(\"Invalid JSON\");\n              }\n            }}\n          >\n            {t(\"projects.config.save.changes\")}\n          </Button>\n        </Card.Grid>\n      </Card>\n      <div className={\"h-5\"}></div>\n      <MemberTable\n        members={GetProjectByIdDocumentData?.getProjectByID.members}\n      />\n      <div className={\"h-5\"}></div>\n      <TagTable tags={GetProjectByIdDocumentData?.getProjectByID.tags} />\n      <div className={\"h-5\"}></div>\n    </div>\n  );\n};\n\nexport default ProjectConfigure;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/configure/index.tsx",
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
        0,
        0
      ],
      "7": [
        0,
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
      "7": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 8,
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
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 76,
            "column": 13
          },
          "end": {
            "line": 94,
            "column": 13
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 76,
              "column": 13
            },
            "end": {
              "line": 76,
              "column": 39
            }
          },
          {
            "start": {
              "line": 77,
              "column": 14
            },
            "end": {
              "line": 93,
              "column": 16
            }
          }
        ],
        "line": 76
      },
      "1": {
        "loc": {
          "start": {
            "line": 85,
            "column": 18
          },
          "end": {
            "line": 85,
            "column": 80
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 85,
              "column": 18
            },
            "end": {
              "line": 85,
              "column": 74
            }
          },
          {
            "start": {
              "line": 85,
              "column": 78
            },
            "end": {
              "line": 85,
              "column": 80
            }
          }
        ],
        "line": 85
      },
      "2": {
        "loc": {
          "start": {
            "line": 120,
            "column": 15
          },
          "end": {
            "line": 146,
            "column": 15
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 120,
              "column": 15
            },
            "end": {
              "line": 120,
              "column": 57
            }
          },
          {
            "start": {
              "line": 121,
              "column": 16
            },
            "end": {
              "line": 145,
              "column": 18
            }
          }
        ],
        "line": 120
      },
      "3": {
        "loc": {
          "start": {
            "line": 126,
            "column": 22
          },
          "end": {
            "line": 126,
            "column": 62
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 126,
              "column": 22
            },
            "end": {
              "line": 126,
              "column": 51
            }
          },
          {
            "start": {
              "line": 126,
              "column": 55
            },
            "end": {
              "line": 126,
              "column": 62
            }
          }
        ],
        "line": 126
      },
      "4": {
        "loc": {
          "start": {
            "line": 132,
            "column": 32
          },
          "end": {
            "line": 132,
            "column": 43
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 132,
              "column": 32
            },
            "end": {
              "line": 132,
              "column": 37
            }
          },
          {
            "start": {
              "line": 132,
              "column": 41
            },
            "end": {
              "line": 132,
              "column": 43
            }
          }
        ],
        "line": 132
      },
      "5": {
        "loc": {
          "start": {
            "line": 154,
            "column": 16
          },
          "end": {
            "line": 156,
            "column": 17
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 154,
              "column": 16
            },
            "end": {
              "line": 156,
              "column": 17
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 154
      },
      "6": {
        "loc": {
          "start": {
            "line": 162,
            "column": 22
          },
          "end": {
            "line": 164,
            "column": 24
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 162,
              "column": 22
            },
            "end": {
              "line": 162,
              "column": 30
            }
          },
          {
            "start": {
              "line": 163,
              "column": 22
            },
            "end": {
              "line": 163,
              "column": 73
            }
          },
          {
            "start": {
              "line": 164,
              "column": 22
            },
            "end": {
              "line": 164,
              "column": 24
            }
          }
        ],
        "line": 162
      },
      "7": {
        "loc": {
          "start": {
            "line": 167,
            "column": 22
          },
          "end": {
            "line": 170,
            "column": 25
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 167,
              "column": 22
            },
            "end": {
              "line": 167,
              "column": 35
            }
          },
          {
            "start": {
              "line": 168,
              "column": 22
            },
            "end": {
              "line": 169,
              "column": 38
            }
          },
          {
            "start": {
              "line": 170,
              "column": 22
            },
            "end": {
              "line": 170,
              "column": 25
            }
          }
        ],
        "line": 167
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 19,
            "column": 25
          },
          "end": {
            "line": 19,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 19,
            "column": 31
          },
          "end": {
            "line": 193,
            "column": 1
          }
        },
        "line": 19
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 33,
            "column": 22
          },
          "end": {
            "line": 33,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 33,
            "column": 28
          },
          "end": {
            "line": 35,
            "column": 3
          }
        },
        "line": 33
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 50,
            "column": 16
          },
          "end": {
            "line": 50,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 50,
            "column": 22
          },
          "end": {
            "line": 52,
            "column": 9
          }
        },
        "line": 50
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 86,
            "column": 22
          },
          "end": {
            "line": 86,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 86,
            "column": 33
          },
          "end": {
            "line": 89,
            "column": 17
          }
        },
        "line": 86
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 90,
            "column": 26
          },
          "end": {
            "line": 90,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 90,
            "column": 37
          },
          "end": {
            "line": 92,
            "column": 17
          }
        },
        "line": 90
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 131,
            "column": 28
          },
          "end": {
            "line": 131,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 131,
            "column": 39
          },
          "end": {
            "line": 133,
            "column": 19
          }
        },
        "line": 131
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 151,
            "column": 21
          },
          "end": {
            "line": 151,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 151,
            "column": 27
          },
          "end": {
            "line": 178,
            "column": 13
          }
        },
        "line": 151
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 172,
            "column": 24
          },
          "end": {
            "line": 172,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 172,
            "column": 30
          },
          "end": {
            "line": 174,
            "column": 17
          }
        },
        "line": 172
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 14,
          "column": 23
        },
        "end": {
          "line": 16,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 17,
          "column": 17
        },
        "end": {
          "line": 17,
          "column": 27
        }
      },
      "2": {
        "start": {
          "line": 18,
          "column": 21
        },
        "end": {
          "line": 18,
          "column": 26
        }
      },
      "3": {
        "start": {
          "line": 19,
          "column": 25
        },
        "end": {
          "line": 193,
          "column": 1
        }
      },
      "4": {
        "start": {
          "line": 20,
          "column": 19
        },
        "end": {
          "line": 20,
          "column": 30
        }
      },
      "5": {
        "start": {
          "line": 21,
          "column": 20
        },
        "end": {
          "line": 21,
          "column": 30
        }
      },
      "6": {
        "start": {
          "line": 22,
          "column": 16
        },
        "end": {
          "line": 22,
          "column": 32
        }
      },
      "7": {
        "start": {
          "line": 23,
          "column": 47
        },
        "end": {
          "line": 31,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 32,
          "column": 26
        },
        "end": {
          "line": 32,
          "column": 60
        }
      },
      "9": {
        "start": {
          "line": 33,
          "column": 22
        },
        "end": {
          "line": 35,
          "column": 3
        }
      },
      "10": {
        "start": {
          "line": 34,
          "column": 4
        },
        "end": {
          "line": 34,
          "column": 28
        }
      },
      "11": {
        "start": {
          "line": 36,
          "column": 34
        },
        "end": {
          "line": 36,
          "column": 54
        }
      },
      "12": {
        "start": {
          "line": 38,
          "column": 44
        },
        "end": {
          "line": 38,
          "column": 64
        }
      },
      "13": {
        "start": {
          "line": 40,
          "column": 24
        },
        "end": {
          "line": 40,
          "column": 41
        }
      },
      "14": {
        "start": {
          "line": 41,
          "column": 2
        },
        "end": {
          "line": 192,
          "column": 4
        }
      },
      "15": {
        "start": {
          "line": 51,
          "column": 10
        },
        "end": {
          "line": 51,
          "column": 42
        }
      },
      "16": {
        "start": {
          "line": 86,
          "column": 33
        },
        "end": {
          "line": 89,
          "column": 17
        }
      },
      "17": {
        "start": {
          "line": 91,
          "column": 18
        },
        "end": {
          "line": 91,
          "column": 52
        }
      },
      "18": {
        "start": {
          "line": 132,
          "column": 20
        },
        "end": {
          "line": 132,
          "column": 45
        }
      },
      "19": {
        "start": {
          "line": 152,
          "column": 14
        },
        "end": {
          "line": 177,
          "column": 15
        }
      },
      "20": {
        "start": {
          "line": 154,
          "column": 16
        },
        "end": {
          "line": 156,
          "column": 17
        }
      },
      "21": {
        "start": {
          "line": 155,
          "column": 18
        },
        "end": {
          "line": 155,
          "column": 39
        }
      },
      "22": {
        "start": {
          "line": 158,
          "column": 16
        },
        "end": {
          "line": 174,
          "column": 19
        }
      },
      "23": {
        "start": {
          "line": 173,
          "column": 18
        },
        "end": {
          "line": 173,
          "column": 32
        }
      },
      "24": {
        "start": {
          "line": 176,
          "column": 16
        },
        "end": {
          "line": 176,
          "column": 46
        }
      }
    }
  }
}