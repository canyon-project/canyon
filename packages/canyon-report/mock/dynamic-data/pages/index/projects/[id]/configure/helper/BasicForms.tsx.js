window["pages/index/projects/[id]/configure/helper/BasicForms.tsx"] = {
  "content": "import { useMutation } from \"@apollo/client\";\nimport { useForm } from \"antd/es/form/Form\";\nimport { FC } from \"react\";\n\nimport { UpdateProjectDocument } from \"../../../../../../helpers/backend/gen/graphql.ts\";\n\nconst { TextArea } = Input;\n\nconst BasicForms: FC<{ data: any }> = ({ data }, ref) => {\n  const [updateProject] = useMutation(UpdateProjectDocument);\n  const prm: any = useParams();\n  const { t } = useTranslation();\n  const onFinish = (values: any) => {\n    updateProject({\n      variables: {\n        projectID: prm.id,\n        coverage: \"__null__\",\n        description: values.description,\n        defaultBranch: \"__null__\",\n        instrumentCwd: values.instrumentCwd,\n      },\n    }).then(() => {\n      message.success(\"成功\");\n    });\n  };\n  const [form] = useForm();\n  const onSubmit = () => {\n    form.submit();\n  };\n  useImperativeHandle(ref, () => ({\n    submit: onSubmit,\n  }));\n  // use\n  if (data) {\n    return (\n      <Form\n        form={form}\n        className={\"w-[850px]\"}\n        name=\"basic\"\n        layout={\"vertical\"}\n        initialValues={{\n          pathWithNamespace: data.pathWithNamespace,\n          description: data.description,\n          projectID: data.id,\n          tag: data.tag,\n          language: data.language,\n          instrumentCwd: data.instrumentCwd,\n        }}\n        onFinish={onFinish}\n      >\n        <div className={\"flex\"}>\n          <Form.Item<any>\n            label={t(\"new.repository\")}\n            name=\"pathWithNamespace\"\n            className={\"flex-1 mr-10\"}\n          >\n            <Input disabled />\n          </Form.Item>\n\n          <Form.Item<any>\n            className={\"flex-3\"}\n            label={t(\"projects.config.project.id\")}\n            name=\"projectID\"\n          >\n            <Input disabled />\n          </Form.Item>\n        </div>\n\n        <Form.Item<any> label={t(\"common.language\")} name=\"language\">\n          <Input disabled />\n        </Form.Item>\n\n        <Form.Item<any>\n          label={t(\"projects.config.project.desc\")}\n          name=\"description\"\n        >\n          <TextArea autoSize={{ minRows: 3, maxRows: 3 }} />\n        </Form.Item>\n      </Form>\n    );\n  } else {\n    return <div>loading</div>;\n  }\n};\n\nexport default forwardRef(BasicForms);\n",
  "coverage": {
    "path": "pages/index/projects/[id]/configure/helper/BasicForms.tsx",
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
      "0": 8,
      "1": 8,
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
      "15": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 34,
            "column": 2
          },
          "end": {
            "line": 83,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 34,
              "column": 2
            },
            "end": {
              "line": 83,
              "column": 3
            }
          },
          {
            "start": {
              "line": 81,
              "column": 9
            },
            "end": {
              "line": 83,
              "column": 3
            }
          }
        ],
        "line": 34
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 9,
            "column": 38
          },
          "end": {
            "line": 9,
            "column": 39
          }
        },
        "loc": {
          "start": {
            "line": 9,
            "column": 57
          },
          "end": {
            "line": 84,
            "column": 1
          }
        },
        "line": 9
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 13,
            "column": 19
          },
          "end": {
            "line": 13,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 36
          },
          "end": {
            "line": 25,
            "column": 3
          }
        },
        "line": 13
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 22,
            "column": 12
          },
          "end": {
            "line": 22,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 22,
            "column": 18
          },
          "end": {
            "line": 24,
            "column": 5
          }
        },
        "line": 22
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 27,
            "column": 19
          },
          "end": {
            "line": 27,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 27,
            "column": 25
          },
          "end": {
            "line": 29,
            "column": 3
          }
        },
        "line": 27
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 30,
            "column": 27
          },
          "end": {
            "line": 30,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 30,
            "column": 34
          },
          "end": {
            "line": 32,
            "column": 3
          }
        },
        "line": 30
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 21
        },
        "end": {
          "line": 7,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 9,
          "column": 38
        },
        "end": {
          "line": 84,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 10,
          "column": 26
        },
        "end": {
          "line": 10,
          "column": 60
        }
      },
      "3": {
        "start": {
          "line": 11,
          "column": 19
        },
        "end": {
          "line": 11,
          "column": 30
        }
      },
      "4": {
        "start": {
          "line": 12,
          "column": 16
        },
        "end": {
          "line": 12,
          "column": 32
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 19
        },
        "end": {
          "line": 25,
          "column": 3
        }
      },
      "6": {
        "start": {
          "line": 14,
          "column": 4
        },
        "end": {
          "line": 24,
          "column": 7
        }
      },
      "7": {
        "start": {
          "line": 23,
          "column": 6
        },
        "end": {
          "line": 23,
          "column": 28
        }
      },
      "8": {
        "start": {
          "line": 26,
          "column": 17
        },
        "end": {
          "line": 26,
          "column": 26
        }
      },
      "9": {
        "start": {
          "line": 27,
          "column": 19
        },
        "end": {
          "line": 29,
          "column": 3
        }
      },
      "10": {
        "start": {
          "line": 28,
          "column": 4
        },
        "end": {
          "line": 28,
          "column": 18
        }
      },
      "11": {
        "start": {
          "line": 30,
          "column": 2
        },
        "end": {
          "line": 32,
          "column": 6
        }
      },
      "12": {
        "start": {
          "line": 30,
          "column": 34
        },
        "end": {
          "line": 32,
          "column": 3
        }
      },
      "13": {
        "start": {
          "line": 34,
          "column": 2
        },
        "end": {
          "line": 83,
          "column": 3
        }
      },
      "14": {
        "start": {
          "line": 35,
          "column": 4
        },
        "end": {
          "line": 80,
          "column": 6
        }
      },
      "15": {
        "start": {
          "line": 82,
          "column": 4
        },
        "end": {
          "line": 82,
          "column": 30
        }
      }
    }
  }
}