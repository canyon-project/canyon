window["pages/index/projects/new.tsx"] = {
  "content": "import { useMutation } from \"@apollo/client\";\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport React from \"react\";\nimport { useTranslation } from \"react-i18next\";\nimport { useNavigate } from \"react-router-dom\";\n\nimport {\n  CheckProjectUrlDocument,\n  CreateProjectDocument,\n} from \"../../../helpers/backend/gen/graphql.ts\";\nconst { Text } = Typography;\n\nconst LabelTest = ({ type, name, url, disabled }) => {\n  return (\n    <Space>\n      <img className={\"w-[20px]\"} src={`/gitproviders/${type}.svg`} alt=\"\" />\n      {name}\n      <Text type={\"secondary\"}>{url}</Text>\n    </Space>\n  );\n};\n\nconst App: React.FC = () => {\n  const { data: gitProviderList } = useRequest(() =>\n    axios.get(`/api/gitprovider`).then(({ data }) => data),\n  );\n  const [form] = Form.useForm();\n  const [createTodo, { data, loading }] = useMutation(CheckProjectUrlDocument);\n  const [createProject] = useMutation(CreateProjectDocument);\n  const [projectID, setProjectID] = useState(\"\");\n\n  const onFinish = (values: any) => {\n    const url = gitProviderList.find((i) => {\n      return i.id === values.provider;\n    }).url;\n\n    createTodo({\n      variables: {\n        projectUrl: `${url}/${values.repository}`,\n      },\n    }).then((res) => {\n      setProjectID(\n        `${values.provider}-${res.data?.checkProjectUrl.id}-${values.slug}`,\n      );\n    });\n  };\n\n  const nav = useNavigate();\n  const { t } = useTranslation();\n  return (\n    <div>\n      <h2>{t(\"projects.create\")}</h2>\n\n      <h3>1. {t(\"new.step1\")}</h3>\n      <Form\n        layout={\"vertical\"}\n        form={form}\n        name=\"control-hooks\"\n        onFinish={onFinish}\n        style={{ maxWidth: 600 }}\n        initialValues={{\n          slug: \"auto\",\n        }}\n      >\n        <Form.Item\n          name=\"provider\"\n          label={t(\"new.provider\")}\n          rules={[{ required: true }]}\n        >\n          <Select\n            placeholder={t(\"new.provider.placeholder\")}\n            allowClear\n            options={(gitProviderList || []).map(\n              ({ name, url, type, id, disabled }) => ({\n                label: (\n                  <LabelTest\n                    name={name}\n                    type={type}\n                    url={url}\n                    disabled={disabled}\n                  />\n                ),\n                value: id,\n                disabled: disabled,\n              }),\n            )}\n          />\n        </Form.Item>\n        <Form.Item\n          name=\"repository\"\n          label={t(\"new.repository\")}\n          rules={[{ required: true }]}\n        >\n          <Input placeholder={\"namespace/repo-name\"} />\n        </Form.Item>\n\n        <Form.Item\n          name=\"slug\"\n          label={t(\"projects.slug\")}\n          rules={[{ required: true, pattern: /^[a-zA-Z0-9]+$/ }]}\n          tooltip={<>{t(\"new.slug.tooltip\")}</>}\n        >\n          <Input placeholder={t(\"new.slug.placeholder\")} />\n        </Form.Item>\n\n        <Form.Item\n          name=\"language\"\n          label={t(\"common.language\")}\n          rules={[{ required: true }]}\n        >\n          <Select\n            placeholder={t(\"new.language.placeholder\")}\n            options={[\n              {\n                label: \"JavaScript\",\n                value: \"JavaScript\",\n              },\n            ]}\n          />\n        </Form.Item>\n\n        <Form.Item>\n          <Button\n            type={\"primary\"}\n            onClick={() => {\n              form.submit();\n            }}\n          >\n            {t(\"new.check\")}\n          </Button>\n        </Form.Item>\n      </Form>\n\n      <h3>2. {t(\"new.step2\")}</h3>\n\n      <Spin spinning={loading}>\n        <div>\n          <Text>projectID:</Text>\n          <Text>{projectID}</Text>\n        </div>\n        <div>\n          <Text>pathWithNamespace:</Text>\n          <Text>{data?.checkProjectUrl.pathWithNamespace}</Text>\n        </div>\n        <div>\n          <Text>description:</Text>\n          <Text>{data?.checkProjectUrl.description}</Text>\n        </div>\n      </Spin>\n      <div className={\"h-2\"}></div>\n      <Button\n        type={\"primary\"}\n        disabled={!data?.checkProjectUrl.id}\n        onClick={() => {\n          createProject({\n            variables: {\n              projectID: projectID,\n              language: form.getFieldValue(\"language\"),\n            },\n          }).then((res) => {\n            message.success(JSON.stringify(res.data?.createProject));\n            nav(`/projects/${data?.checkProjectUrl.id}/getting-started`);\n          });\n        }}\n      >\n        {t(\"new.create\")}\n      </Button>\n    </div>\n  );\n};\n\nexport default App;\n",
  "coverage": {
    "path": "pages/index/projects/new.tsx",
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
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 0,
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
      "23": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 74,
            "column": 22
          },
          "end": {
            "line": 74,
            "column": 43
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 74,
              "column": 22
            },
            "end": {
              "line": 74,
              "column": 37
            }
          },
          {
            "start": {
              "line": 74,
              "column": 41
            },
            "end": {
              "line": 74,
              "column": 43
            }
          }
        ],
        "line": 74
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 14,
            "column": 18
          },
          "end": {
            "line": 14,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 14,
            "column": 53
          },
          "end": {
            "line": 22,
            "column": 1
          }
        },
        "line": 14
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 24,
            "column": 22
          },
          "end": {
            "line": 24,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 24,
            "column": 28
          },
          "end": {
            "line": 171,
            "column": 1
          }
        },
        "line": 24
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 25,
            "column": 47
          },
          "end": {
            "line": 25,
            "column": 48
          }
        },
        "loc": {
          "start": {
            "line": 26,
            "column": 4
          },
          "end": {
            "line": 26,
            "column": 58
          }
        },
        "line": 26
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 26,
            "column": 39
          },
          "end": {
            "line": 26,
            "column": 40
          }
        },
        "loc": {
          "start": {
            "line": 26,
            "column": 53
          },
          "end": {
            "line": 26,
            "column": 57
          }
        },
        "line": 26
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 33,
            "column": 19
          },
          "end": {
            "line": 33,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 33,
            "column": 36
          },
          "end": {
            "line": 47,
            "column": 3
          }
        },
        "line": 33
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 34,
            "column": 37
          },
          "end": {
            "line": 34,
            "column": 38
          }
        },
        "loc": {
          "start": {
            "line": 34,
            "column": 44
          },
          "end": {
            "line": 36,
            "column": 5
          }
        },
        "line": 34
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 42,
            "column": 12
          },
          "end": {
            "line": 42,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 42,
            "column": 21
          },
          "end": {
            "line": 46,
            "column": 5
          }
        },
        "line": 42
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 75,
            "column": 14
          },
          "end": {
            "line": 75,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 75,
            "column": 54
          },
          "end": {
            "line": 86,
            "column": 15
          }
        },
        "line": 75
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 126,
            "column": 21
          },
          "end": {
            "line": 126,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 126,
            "column": 27
          },
          "end": {
            "line": 128,
            "column": 13
          }
        },
        "line": 126
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 155,
            "column": 17
          },
          "end": {
            "line": 155,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 155,
            "column": 23
          },
          "end": {
            "line": 165,
            "column": 9
          }
        },
        "line": 155
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 161,
            "column": 18
          },
          "end": {
            "line": 161,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 161,
            "column": 27
          },
          "end": {
            "line": 164,
            "column": 11
          }
        },
        "line": 161
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 12,
          "column": 17
        },
        "end": {
          "line": 12,
          "column": 27
        }
      },
      "1": {
        "start": {
          "line": 14,
          "column": 18
        },
        "end": {
          "line": 22,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 15,
          "column": 2
        },
        "end": {
          "line": 21,
          "column": 4
        }
      },
      "3": {
        "start": {
          "line": 24,
          "column": 22
        },
        "end": {
          "line": 171,
          "column": 1
        }
      },
      "4": {
        "start": {
          "line": 25,
          "column": 36
        },
        "end": {
          "line": 27,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 26,
          "column": 4
        },
        "end": {
          "line": 26,
          "column": 58
        }
      },
      "6": {
        "start": {
          "line": 26,
          "column": 53
        },
        "end": {
          "line": 26,
          "column": 57
        }
      },
      "7": {
        "start": {
          "line": 28,
          "column": 17
        },
        "end": {
          "line": 28,
          "column": 31
        }
      },
      "8": {
        "start": {
          "line": 29,
          "column": 42
        },
        "end": {
          "line": 29,
          "column": 78
        }
      },
      "9": {
        "start": {
          "line": 30,
          "column": 26
        },
        "end": {
          "line": 30,
          "column": 60
        }
      },
      "10": {
        "start": {
          "line": 31,
          "column": 36
        },
        "end": {
          "line": 31,
          "column": 48
        }
      },
      "11": {
        "start": {
          "line": 33,
          "column": 19
        },
        "end": {
          "line": 47,
          "column": 3
        }
      },
      "12": {
        "start": {
          "line": 34,
          "column": 16
        },
        "end": {
          "line": 36,
          "column": 10
        }
      },
      "13": {
        "start": {
          "line": 35,
          "column": 6
        },
        "end": {
          "line": 35,
          "column": 38
        }
      },
      "14": {
        "start": {
          "line": 38,
          "column": 4
        },
        "end": {
          "line": 46,
          "column": 7
        }
      },
      "15": {
        "start": {
          "line": 43,
          "column": 6
        },
        "end": {
          "line": 45,
          "column": 8
        }
      },
      "16": {
        "start": {
          "line": 49,
          "column": 14
        },
        "end": {
          "line": 49,
          "column": 27
        }
      },
      "17": {
        "start": {
          "line": 50,
          "column": 16
        },
        "end": {
          "line": 50,
          "column": 32
        }
      },
      "18": {
        "start": {
          "line": 51,
          "column": 2
        },
        "end": {
          "line": 170,
          "column": 4
        }
      },
      "19": {
        "start": {
          "line": 75,
          "column": 54
        },
        "end": {
          "line": 86,
          "column": 15
        }
      },
      "20": {
        "start": {
          "line": 127,
          "column": 14
        },
        "end": {
          "line": 127,
          "column": 28
        }
      },
      "21": {
        "start": {
          "line": 156,
          "column": 10
        },
        "end": {
          "line": 164,
          "column": 13
        }
      },
      "22": {
        "start": {
          "line": 162,
          "column": 12
        },
        "end": {
          "line": 162,
          "column": 69
        }
      },
      "23": {
        "start": {
          "line": 163,
          "column": 12
        },
        "end": {
          "line": 163,
          "column": 73
        }
      }
    }
  }
}