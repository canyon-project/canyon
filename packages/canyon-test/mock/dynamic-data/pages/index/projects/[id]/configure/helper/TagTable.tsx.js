window["pages/index/projects/[id]/configure/helper/TagTable.tsx"] = {
  "content": "import { PlusOutlined, TagOutlined } from \"@ant-design/icons\";\nimport { useMutation } from \"@apollo/client\";\nimport { useParams } from \"react-router-dom\";\n\nimport { UpdateProjectDocument } from \"../../../../../../helpers/backend/gen/graphql.ts\";\ntype FieldType = {\n  id?: string;\n  name?: string;\n  link?: string;\n  color?: string;\n};\n\nconst gridStyle: any = {\n  width: \"100%\",\n};\nfunction setDByeky(key, item, list) {\n  const newList = JSON.parse(JSON.stringify(list));\n\n  const f = newList.findIndex((i) => i.id === key);\n  if (f > -1) {\n    newList[f] = {\n      ...item,\n    };\n  } else {\n    console.log(\"什么也不做\");\n  }\n  return newList;\n}\n\nconst CanyonColorPicker = ({ value, onChange }) => {\n  return (\n    <div>\n      <ColorPicker\n        showText\n        disabledAlpha\n        value={value}\n        onChange={(color, hex) => {\n          onChange(hex);\n        }}\n      />\n    </div>\n  );\n};\n\nconst TagTable = ({ tags }) => {\n  const [activeID, setActiveID] = useState(\"\");\n  const [dataSource, setDataSource] = useState([]);\n  const [open, setOpen] = useState(false);\n  const { t } = useTranslation();\n  useEffect(() => {\n    if (tags !== undefined) {\n      setDataSource(\n        tags.map(({ id, name, link, color }) => ({\n          id,\n          name,\n          link,\n          color,\n        })),\n      );\n    }\n  }, [tags]);\n  const columns = [\n    {\n      title: \"ID\",\n      dataIndex: \"id\",\n      key: \"id\",\n      render(text) {\n        return <span className={\"block w-[100px]\"}>{text}</span>;\n      },\n    },\n    {\n      title: t(\"projects.config.name\"),\n      dataIndex: \"name\",\n      key: \"name\",\n    },\n    {\n      title: t(\"projects.config.link\"),\n      dataIndex: \"link\",\n      key: \"link\",\n      width: \"300px\",\n      render(text) {\n        return (\n          <a\n            href={text}\n            target=\"_blank\"\n            className={\"w-[200px] block\"}\n            style={{ textWrap: \"wrap\" }}\n            rel=\"noreferrer\"\n          >\n            {text}\n          </a>\n        );\n      },\n    },\n    {\n      title: t(\"projects.config.color\"),\n      dataIndex: \"color\",\n      key: \"color\",\n      render(text, record) {\n        return <Tag color={text}>{record.name}</Tag>;\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      render(text, record) {\n        return (\n          <>\n            <a\n              onClick={() => {\n                setActiveID(record.id);\n                setOpen(true);\n              }}\n            >\n              {t(\"common.edit\")}\n            </a>\n\n            <Divider type={\"vertical\"} />\n            <a\n              className={\"text-red-500 hover:text-red-500\"}\n              onClick={() => {\n                setDataSource(dataSource.filter((i) => i.id !== record.id));\n              }}\n            >\n              {t(\"common.delete\")}\n            </a>\n          </>\n        );\n      },\n    },\n  ];\n\n  function onFinish(values) {\n    console.log(values);\n    setDataSource(setDByeky(activeID, values, dataSource));\n  }\n\n  const [form] = Form.useForm();\n  const [updateProject] = useMutation(UpdateProjectDocument);\n  const prm = useParams();\n\n  useEffect(() => {\n    form.setFieldsValue(dataSource.find((i) => i.id === activeID));\n  }, [activeID]);\n\n  return (\n    <div>\n      <Card\n        title={\n          <div className={\"flex items-center\"}>\n            <TagOutlined className={\"text-[#687076] mr-2 text-[16px]\"} />\n            <span>{t(\"projects.config.tag\")}</span>\n          </div>\n        }\n      >\n        <Card.Grid hoverable={false} style={gridStyle}>\n          <Table\n            dataSource={dataSource}\n            columns={columns}\n            bordered={true}\n            pagination={false}\n            size={\"small\"}\n          />\n          <div className={\"h-5\"}></div>\n          <Space>\n            <Button\n              type={\"primary\"}\n              onClick={() => {\n                updateProject({\n                  variables: {\n                    projectID: prm.id as string,\n                    coverage: \"__null__\",\n                    description: \"__null__\",\n                    defaultBranch: \"__null__\",\n                    tags: dataSource,\n                  },\n                }).then(() => {\n                  message.success(\"保存成功\");\n                });\n              }}\n            >\n              {t(\"projects.config.save.changes\")}\n            </Button>\n            <Button\n              icon={<PlusOutlined />}\n              onClick={() => {\n                setDataSource(\n                  dataSource.concat({\n                    id: String(Math.random()),\n                    name: \"tagname\",\n                    link: \"\",\n                    color: \"#0071c2\",\n                  }),\n                );\n              }}\n            >\n              {t(\"common.add\")}\n            </Button>\n          </Space>\n        </Card.Grid>\n      </Card>\n\n      <Drawer\n        title={t(\"projects.config.edit.tag\")}\n        destroyOnClose={true}\n        width={\"35%\"}\n        open={open}\n        onClose={() => {\n          setOpen(false);\n          form.submit();\n        }}\n      >\n        <Form form={form} name=\"basic\" layout={\"vertical\"} onFinish={onFinish}>\n          <Form.Item<FieldType> label=\"ID\" name=\"id\">\n            <Input disabled />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.name\")} name=\"name\">\n            <Input />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.link\")} name=\"link\">\n            <Input placeholder={t(\"projects.config.link.placeholder\")} />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.color\")} name=\"color\">\n            <CanyonColorPicker />\n          </Form.Item>\n        </Form>\n      </Drawer>\n    </div>\n  );\n};\n\nexport default TagTable;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/configure/helper/TagTable.tsx",
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
      "20": 0
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
      "8": 8,
      "9": 0,
      "10": 0,
      "11": 8,
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
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 20,
            "column": 2
          },
          "end": {
            "line": 26,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 20,
              "column": 2
            },
            "end": {
              "line": 26,
              "column": 3
            }
          },
          {
            "start": {
              "line": 24,
              "column": 9
            },
            "end": {
              "line": 26,
              "column": 3
            }
          }
        ],
        "line": 20
      },
      "1": {
        "loc": {
          "start": {
            "line": 51,
            "column": 4
          },
          "end": {
            "line": 60,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 51,
              "column": 4
            },
            "end": {
              "line": 60,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 51
      }
    },
    "fnMap": {
      "0": {
        "name": "setDByeky",
        "decl": {
          "start": {
            "line": 16,
            "column": 9
          },
          "end": {
            "line": 16,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 16,
            "column": 36
          },
          "end": {
            "line": 28,
            "column": 1
          }
        },
        "line": 16
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 19,
            "column": 30
          },
          "end": {
            "line": 19,
            "column": 31
          }
        },
        "loc": {
          "start": {
            "line": 19,
            "column": 37
          },
          "end": {
            "line": 19,
            "column": 49
          }
        },
        "line": 19
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 30,
            "column": 26
          },
          "end": {
            "line": 30,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 30,
            "column": 51
          },
          "end": {
            "line": 43,
            "column": 1
          }
        },
        "line": 30
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 37,
            "column": 18
          },
          "end": {
            "line": 37,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 37,
            "column": 34
          },
          "end": {
            "line": 39,
            "column": 9
          }
        },
        "line": 37
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 45,
            "column": 17
          },
          "end": {
            "line": 45,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 45,
            "column": 31
          },
          "end": {
            "line": 232,
            "column": 1
          }
        },
        "line": 45
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 50,
            "column": 12
          },
          "end": {
            "line": 50,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 50,
            "column": 18
          },
          "end": {
            "line": 61,
            "column": 3
          }
        },
        "line": 50
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 53,
            "column": 17
          },
          "end": {
            "line": 53,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 53,
            "column": 49
          },
          "end": {
            "line": 58,
            "column": 9
          }
        },
        "line": 53
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 67,
            "column": 6
          },
          "end": {
            "line": 67,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 67,
            "column": 19
          },
          "end": {
            "line": 69,
            "column": 7
          }
        },
        "line": 67
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 81,
            "column": 6
          },
          "end": {
            "line": 81,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 19
          },
          "end": {
            "line": 93,
            "column": 7
          }
        },
        "line": 81
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 99,
            "column": 6
          },
          "end": {
            "line": 99,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 99,
            "column": 27
          },
          "end": {
            "line": 101,
            "column": 7
          }
        },
        "line": 99
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 105,
            "column": 6
          },
          "end": {
            "line": 105,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 105,
            "column": 27
          },
          "end": {
            "line": 128,
            "column": 7
          }
        },
        "line": 105
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 109,
            "column": 23
          },
          "end": {
            "line": 109,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 109,
            "column": 29
          },
          "end": {
            "line": 112,
            "column": 15
          }
        },
        "line": 109
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 120,
            "column": 23
          },
          "end": {
            "line": 120,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 120,
            "column": 29
          },
          "end": {
            "line": 122,
            "column": 15
          }
        },
        "line": 120
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 121,
            "column": 48
          },
          "end": {
            "line": 121,
            "column": 49
          }
        },
        "loc": {
          "start": {
            "line": 121,
            "column": 55
          },
          "end": {
            "line": 121,
            "column": 73
          }
        },
        "line": 121
      },
      "14": {
        "name": "onFinish",
        "decl": {
          "start": {
            "line": 132,
            "column": 11
          },
          "end": {
            "line": 132,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 132,
            "column": 28
          },
          "end": {
            "line": 135,
            "column": 3
          }
        },
        "line": 132
      },
      "15": {
        "name": "(anonymous_15)",
        "decl": {
          "start": {
            "line": 141,
            "column": 12
          },
          "end": {
            "line": 141,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 141,
            "column": 18
          },
          "end": {
            "line": 143,
            "column": 3
          }
        },
        "line": 141
      },
      "16": {
        "name": "(anonymous_16)",
        "decl": {
          "start": {
            "line": 142,
            "column": 40
          },
          "end": {
            "line": 142,
            "column": 41
          }
        },
        "loc": {
          "start": {
            "line": 142,
            "column": 47
          },
          "end": {
            "line": 142,
            "column": 64
          }
        },
        "line": 142
      },
      "17": {
        "name": "(anonymous_17)",
        "decl": {
          "start": {
            "line": 167,
            "column": 23
          },
          "end": {
            "line": 167,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 167,
            "column": 29
          },
          "end": {
            "line": 179,
            "column": 15
          }
        },
        "line": 167
      },
      "18": {
        "name": "(anonymous_18)",
        "decl": {
          "start": {
            "line": 176,
            "column": 24
          },
          "end": {
            "line": 176,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 176,
            "column": 30
          },
          "end": {
            "line": 178,
            "column": 17
          }
        },
        "line": 176
      },
      "19": {
        "name": "(anonymous_19)",
        "decl": {
          "start": {
            "line": 185,
            "column": 23
          },
          "end": {
            "line": 185,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 185,
            "column": 29
          },
          "end": {
            "line": 194,
            "column": 15
          }
        },
        "line": 185
      },
      "20": {
        "name": "(anonymous_20)",
        "decl": {
          "start": {
            "line": 207,
            "column": 17
          },
          "end": {
            "line": 207,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 207,
            "column": 23
          },
          "end": {
            "line": 210,
            "column": 9
          }
        },
        "line": 207
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 13,
          "column": 23
        },
        "end": {
          "line": 15,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 17,
          "column": 18
        },
        "end": {
          "line": 17,
          "column": 50
        }
      },
      "2": {
        "start": {
          "line": 19,
          "column": 12
        },
        "end": {
          "line": 19,
          "column": 50
        }
      },
      "3": {
        "start": {
          "line": 19,
          "column": 37
        },
        "end": {
          "line": 19,
          "column": 49
        }
      },
      "4": {
        "start": {
          "line": 20,
          "column": 2
        },
        "end": {
          "line": 26,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 21,
          "column": 4
        },
        "end": {
          "line": 23,
          "column": 6
        }
      },
      "6": {
        "start": {
          "line": 25,
          "column": 4
        },
        "end": {
          "line": 25,
          "column": 25
        }
      },
      "7": {
        "start": {
          "line": 27,
          "column": 2
        },
        "end": {
          "line": 27,
          "column": 17
        }
      },
      "8": {
        "start": {
          "line": 30,
          "column": 26
        },
        "end": {
          "line": 43,
          "column": 1
        }
      },
      "9": {
        "start": {
          "line": 31,
          "column": 2
        },
        "end": {
          "line": 42,
          "column": 4
        }
      },
      "10": {
        "start": {
          "line": 38,
          "column": 10
        },
        "end": {
          "line": 38,
          "column": 24
        }
      },
      "11": {
        "start": {
          "line": 45,
          "column": 17
        },
        "end": {
          "line": 232,
          "column": 1
        }
      },
      "12": {
        "start": {
          "line": 46,
          "column": 34
        },
        "end": {
          "line": 46,
          "column": 46
        }
      },
      "13": {
        "start": {
          "line": 47,
          "column": 38
        },
        "end": {
          "line": 47,
          "column": 50
        }
      },
      "14": {
        "start": {
          "line": 48,
          "column": 26
        },
        "end": {
          "line": 48,
          "column": 41
        }
      },
      "15": {
        "start": {
          "line": 49,
          "column": 16
        },
        "end": {
          "line": 49,
          "column": 32
        }
      },
      "16": {
        "start": {
          "line": 50,
          "column": 2
        },
        "end": {
          "line": 61,
          "column": 13
        }
      },
      "17": {
        "start": {
          "line": 51,
          "column": 4
        },
        "end": {
          "line": 60,
          "column": 5
        }
      },
      "18": {
        "start": {
          "line": 52,
          "column": 6
        },
        "end": {
          "line": 59,
          "column": 8
        }
      },
      "19": {
        "start": {
          "line": 53,
          "column": 49
        },
        "end": {
          "line": 58,
          "column": 9
        }
      },
      "20": {
        "start": {
          "line": 62,
          "column": 18
        },
        "end": {
          "line": 130,
          "column": 3
        }
      },
      "21": {
        "start": {
          "line": 68,
          "column": 8
        },
        "end": {
          "line": 68,
          "column": 65
        }
      },
      "22": {
        "start": {
          "line": 82,
          "column": 8
        },
        "end": {
          "line": 92,
          "column": 10
        }
      },
      "23": {
        "start": {
          "line": 100,
          "column": 8
        },
        "end": {
          "line": 100,
          "column": 53
        }
      },
      "24": {
        "start": {
          "line": 106,
          "column": 8
        },
        "end": {
          "line": 127,
          "column": 10
        }
      },
      "25": {
        "start": {
          "line": 110,
          "column": 16
        },
        "end": {
          "line": 110,
          "column": 39
        }
      },
      "26": {
        "start": {
          "line": 111,
          "column": 16
        },
        "end": {
          "line": 111,
          "column": 30
        }
      },
      "27": {
        "start": {
          "line": 121,
          "column": 16
        },
        "end": {
          "line": 121,
          "column": 76
        }
      },
      "28": {
        "start": {
          "line": 121,
          "column": 55
        },
        "end": {
          "line": 121,
          "column": 73
        }
      },
      "29": {
        "start": {
          "line": 133,
          "column": 4
        },
        "end": {
          "line": 133,
          "column": 24
        }
      },
      "30": {
        "start": {
          "line": 134,
          "column": 4
        },
        "end": {
          "line": 134,
          "column": 59
        }
      },
      "31": {
        "start": {
          "line": 137,
          "column": 17
        },
        "end": {
          "line": 137,
          "column": 31
        }
      },
      "32": {
        "start": {
          "line": 138,
          "column": 26
        },
        "end": {
          "line": 138,
          "column": 60
        }
      },
      "33": {
        "start": {
          "line": 139,
          "column": 14
        },
        "end": {
          "line": 139,
          "column": 25
        }
      },
      "34": {
        "start": {
          "line": 141,
          "column": 2
        },
        "end": {
          "line": 143,
          "column": 17
        }
      },
      "35": {
        "start": {
          "line": 142,
          "column": 4
        },
        "end": {
          "line": 142,
          "column": 67
        }
      },
      "36": {
        "start": {
          "line": 142,
          "column": 47
        },
        "end": {
          "line": 142,
          "column": 64
        }
      },
      "37": {
        "start": {
          "line": 145,
          "column": 2
        },
        "end": {
          "line": 231,
          "column": 4
        }
      },
      "38": {
        "start": {
          "line": 168,
          "column": 16
        },
        "end": {
          "line": 178,
          "column": 19
        }
      },
      "39": {
        "start": {
          "line": 177,
          "column": 18
        },
        "end": {
          "line": 177,
          "column": 42
        }
      },
      "40": {
        "start": {
          "line": 186,
          "column": 16
        },
        "end": {
          "line": 193,
          "column": 18
        }
      },
      "41": {
        "start": {
          "line": 208,
          "column": 10
        },
        "end": {
          "line": 208,
          "column": 25
        }
      },
      "42": {
        "start": {
          "line": 209,
          "column": 10
        },
        "end": {
          "line": 209,
          "column": 24
        }
      }
    }
  }
}