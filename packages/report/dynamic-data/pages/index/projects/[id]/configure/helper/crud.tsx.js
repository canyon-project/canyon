window["pages/index/projects/[id]/configure/helper/crud.tsx"] = {
  "content": "import { PlusOutlined } from \"@ant-design/icons\";\nimport { FC, useState } from \"react\";\n\n/**\n * noop is a helper function that does nothing\n * @returns undefined\n */\nfunction noop() {\n  /** no-op */\n}\n\n// 注意多默认值\n// noob函数\n\ninterface CrudTableProps {\n  dataSource: any[];\n  loading: boolean;\n  columns: any[];\n  formItems: any;\n  onCreate?: (values: any) => void;\n  onDelete?: (values: any) => void;\n  onUpdate?: (values: any) => void;\n  onSave?: () => void;\n}\n\nconst CrudTable: FC<CrudTableProps> = ({\n  dataSource,\n  loading,\n  columns,\n  formItems,\n  /* === */\n  onCreate = noop,\n  onDelete = noop,\n  onUpdate = noop,\n  onSave = noop,\n}) => {\n  const [visible, setVisible] = useState(false);\n  const [form] = Form.useForm();\n  function onFinish(values) {\n    if (values.mode === \"create\") {\n      if (values.userID && values.role) {\n        onCreate(values);\n      }\n    } else {\n      onUpdate(values);\n    }\n    setVisible(false);\n  }\n  function closeDrawer() {\n    setVisible(false);\n    // onFinish({ mode: 'create' });\n    form.submit();\n    setTimeout(() => {\n      form.resetFields();\n    }, 100);\n  }\n\n  function add() {\n    setVisible(true);\n    form.setFieldsValue({\n      mode: \"create\",\n      emails: [],\n    });\n  }\n\n  function edit(record) {\n    setVisible(true);\n    form.setFieldsValue({\n      ...record,\n      mode: \"update\",\n    });\n  }\n\n  return (\n    <div className={\"\"}>\n      <Table\n        bordered={true}\n        pagination={false}\n        size={\"small\"}\n        rowKey={\"id\"}\n        dataSource={dataSource}\n        columns={columns.concat({\n          title: \"操作\",\n          render: (text, record) => {\n            return (\n              <div>\n                <a\n                  onClick={() => {\n                    edit(record);\n                  }}\n                >\n                  编辑\n                </a>\n\n                <Divider type={\"vertical\"} />\n\n                <a className={\"text-red-500\"} onClick={() => onDelete(record)}>\n                  {\"删除\"}\n                </a>\n              </div>\n            );\n          },\n        })}\n        loading={loading}\n      />\n      <div className={\"h-2\"}></div>\n\n      <Space>\n        <Button type={\"primary\"} onClick={onSave}>\n          保存更改\n        </Button>\n        <Button onClick={add}>\n          <PlusOutlined />\n          添加\n        </Button>\n      </Space>\n      <Drawer\n        title={form.getFieldValue(\"mode\")}\n        open={visible}\n        width={\"45%\"}\n        onClose={closeDrawer}\n      >\n        <Form form={form} onFinish={onFinish} layout={\"vertical\"}>\n          <Form.Item label=\"mode\" name={\"mode\"} style={{ display: \"none\" }}>\n            <Input />\n          </Form.Item>\n          {formItems(form.getFieldValue(\"mode\"))}\n        </Form>\n      </Drawer>\n    </div>\n  );\n};\n\nexport default CrudTable;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/configure/helper/crud.tsx",
    "b": {
      "0": [
        0
      ],
      "1": [
        0
      ],
      "2": [
        0
      ],
      "3": [
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
      "9": 0
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
      "18": 0,
      "19": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 32,
            "column": 2
          },
          "end": {
            "line": 32,
            "column": 17
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 32,
              "column": 13
            },
            "end": {
              "line": 32,
              "column": 17
            }
          }
        ],
        "line": 32
      },
      "1": {
        "loc": {
          "start": {
            "line": 33,
            "column": 2
          },
          "end": {
            "line": 33,
            "column": 17
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 33,
              "column": 13
            },
            "end": {
              "line": 33,
              "column": 17
            }
          }
        ],
        "line": 33
      },
      "2": {
        "loc": {
          "start": {
            "line": 34,
            "column": 2
          },
          "end": {
            "line": 34,
            "column": 17
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 34,
              "column": 13
            },
            "end": {
              "line": 34,
              "column": 17
            }
          }
        ],
        "line": 34
      },
      "3": {
        "loc": {
          "start": {
            "line": 35,
            "column": 2
          },
          "end": {
            "line": 35,
            "column": 15
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 35,
              "column": 11
            },
            "end": {
              "line": 35,
              "column": 15
            }
          }
        ],
        "line": 35
      },
      "4": {
        "loc": {
          "start": {
            "line": 40,
            "column": 4
          },
          "end": {
            "line": 46,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 40,
              "column": 4
            },
            "end": {
              "line": 46,
              "column": 5
            }
          },
          {
            "start": {
              "line": 44,
              "column": 11
            },
            "end": {
              "line": 46,
              "column": 5
            }
          }
        ],
        "line": 40
      },
      "5": {
        "loc": {
          "start": {
            "line": 41,
            "column": 6
          },
          "end": {
            "line": 43,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 41,
              "column": 6
            },
            "end": {
              "line": 43,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 41
      },
      "6": {
        "loc": {
          "start": {
            "line": 41,
            "column": 10
          },
          "end": {
            "line": 41,
            "column": 38
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 41,
              "column": 10
            },
            "end": {
              "line": 41,
              "column": 23
            }
          },
          {
            "start": {
              "line": 41,
              "column": 27
            },
            "end": {
              "line": 41,
              "column": 38
            }
          }
        ],
        "line": 41
      }
    },
    "fnMap": {
      "0": {
        "name": "noop",
        "decl": {
          "start": {
            "line": 8,
            "column": 9
          },
          "end": {
            "line": 8,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 8,
            "column": 16
          },
          "end": {
            "line": 10,
            "column": 1
          }
        },
        "line": 8
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 26,
            "column": 38
          },
          "end": {
            "line": 26,
            "column": 39
          }
        },
        "loc": {
          "start": {
            "line": 36,
            "column": 6
          },
          "end": {
            "line": 132,
            "column": 1
          }
        },
        "line": 36
      },
      "2": {
        "name": "onFinish",
        "decl": {
          "start": {
            "line": 39,
            "column": 11
          },
          "end": {
            "line": 39,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 39,
            "column": 28
          },
          "end": {
            "line": 48,
            "column": 3
          }
        },
        "line": 39
      },
      "3": {
        "name": "closeDrawer",
        "decl": {
          "start": {
            "line": 49,
            "column": 11
          },
          "end": {
            "line": 49,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 49,
            "column": 25
          },
          "end": {
            "line": 56,
            "column": 3
          }
        },
        "line": 49
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 53,
            "column": 15
          },
          "end": {
            "line": 53,
            "column": 16
          }
        },
        "loc": {
          "start": {
            "line": 53,
            "column": 21
          },
          "end": {
            "line": 55,
            "column": 5
          }
        },
        "line": 53
      },
      "5": {
        "name": "add",
        "decl": {
          "start": {
            "line": 58,
            "column": 11
          },
          "end": {
            "line": 58,
            "column": 14
          }
        },
        "loc": {
          "start": {
            "line": 58,
            "column": 17
          },
          "end": {
            "line": 64,
            "column": 3
          }
        },
        "line": 58
      },
      "6": {
        "name": "edit",
        "decl": {
          "start": {
            "line": 66,
            "column": 11
          },
          "end": {
            "line": 66,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 66,
            "column": 24
          },
          "end": {
            "line": 72,
            "column": 3
          }
        },
        "line": 66
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 84,
            "column": 18
          },
          "end": {
            "line": 84,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 84,
            "column": 36
          },
          "end": {
            "line": 102,
            "column": 11
          }
        },
        "line": 84
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 88,
            "column": 27
          },
          "end": {
            "line": 88,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 88,
            "column": 33
          },
          "end": {
            "line": 90,
            "column": 19
          }
        },
        "line": 88
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 97,
            "column": 55
          },
          "end": {
            "line": 97,
            "column": 56
          }
        },
        "loc": {
          "start": {
            "line": 97,
            "column": 61
          },
          "end": {
            "line": 97,
            "column": 77
          }
        },
        "line": 97
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 26,
          "column": 38
        },
        "end": {
          "line": 132,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 37,
          "column": 32
        },
        "end": {
          "line": 37,
          "column": 47
        }
      },
      "2": {
        "start": {
          "line": 38,
          "column": 17
        },
        "end": {
          "line": 38,
          "column": 31
        }
      },
      "3": {
        "start": {
          "line": 40,
          "column": 4
        },
        "end": {
          "line": 46,
          "column": 5
        }
      },
      "4": {
        "start": {
          "line": 41,
          "column": 6
        },
        "end": {
          "line": 43,
          "column": 7
        }
      },
      "5": {
        "start": {
          "line": 42,
          "column": 8
        },
        "end": {
          "line": 42,
          "column": 25
        }
      },
      "6": {
        "start": {
          "line": 45,
          "column": 6
        },
        "end": {
          "line": 45,
          "column": 23
        }
      },
      "7": {
        "start": {
          "line": 47,
          "column": 4
        },
        "end": {
          "line": 47,
          "column": 22
        }
      },
      "8": {
        "start": {
          "line": 50,
          "column": 4
        },
        "end": {
          "line": 50,
          "column": 22
        }
      },
      "9": {
        "start": {
          "line": 52,
          "column": 4
        },
        "end": {
          "line": 52,
          "column": 18
        }
      },
      "10": {
        "start": {
          "line": 53,
          "column": 4
        },
        "end": {
          "line": 55,
          "column": 12
        }
      },
      "11": {
        "start": {
          "line": 54,
          "column": 6
        },
        "end": {
          "line": 54,
          "column": 25
        }
      },
      "12": {
        "start": {
          "line": 59,
          "column": 4
        },
        "end": {
          "line": 59,
          "column": 21
        }
      },
      "13": {
        "start": {
          "line": 60,
          "column": 4
        },
        "end": {
          "line": 63,
          "column": 7
        }
      },
      "14": {
        "start": {
          "line": 67,
          "column": 4
        },
        "end": {
          "line": 67,
          "column": 21
        }
      },
      "15": {
        "start": {
          "line": 68,
          "column": 4
        },
        "end": {
          "line": 71,
          "column": 7
        }
      },
      "16": {
        "start": {
          "line": 74,
          "column": 2
        },
        "end": {
          "line": 131,
          "column": 4
        }
      },
      "17": {
        "start": {
          "line": 85,
          "column": 12
        },
        "end": {
          "line": 101,
          "column": 14
        }
      },
      "18": {
        "start": {
          "line": 89,
          "column": 20
        },
        "end": {
          "line": 89,
          "column": 33
        }
      },
      "19": {
        "start": {
          "line": 97,
          "column": 61
        },
        "end": {
          "line": 97,
          "column": 77
        }
      }
    }
  }
}