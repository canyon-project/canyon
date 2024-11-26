window["pages/index/projects/[id]/configure/helper/MemberTable.tsx"] = {
  "content": "import { UsergroupAddOutlined } from \"@ant-design/icons\";\nimport { useMutation, useQuery } from \"@apollo/client\";\n\nimport {\n  ListUserDocument,\n  UpdateProjectDocument,\n} from \"../../../../../../helpers/backend/gen/graphql.ts\";\nimport CrudTable from \"./crud.tsx\";\nconst { Text } = Typography;\nconst options = [\n  {\n    label: (\n      <div className={\"flex gap-1 flex-col\"}>\n        <Text>所有者</Text>\n        <Text type={\"secondary\"} style={{ fontSize: \"12px\" }}>\n          所有者可以编辑和删除项目、上报记录及团队成员。\n        </Text>\n      </div>\n    ),\n    value: \"owner\",\n  },\n  {\n    label: (\n      <div className={\"flex gap-1 flex-col\"}>\n        <Text>编辑者</Text>\n        <Text type={\"secondary\"} style={{ fontSize: \"12px\" }}>\n          编辑者可以编辑和删除项目、上报记录。\n        </Text>\n      </div>\n    ),\n    value: \"editor\",\n  },\n  {\n    label: (\n      <div className={\"flex gap-1 flex-col\"}>\n        <Text>查看者</Text>\n        <Text type={\"secondary\"} style={{ fontSize: \"12px\" }}>\n          查看者只可查看项目、上报记录。\n        </Text>\n      </div>\n    ),\n    value: \"viewer\",\n  },\n];\n\nconst roleMap = {\n  owner: \"所有者\",\n  editor: \"编辑者\",\n  viewer: \"查看者\",\n};\n\n// Filter `option.label` match the user type `input`\nconst filterOption = (\n  input: string,\n  option?: { label: string; value: string },\n) => (option?.label ?? \"\").toLowerCase().includes(input.toLowerCase());\n\nconst MemberTable = ({ members }) => {\n  const columns = [\n    {\n      title: \"成员\",\n      dataIndex: \"userID\",\n      key: \"userID\",\n      render: (text) => {\n        const find = (userOptions?.listUser || []).find((i) => i.id === text);\n        if (find) {\n          return `${find.nickname} <${find.email}>`;\n        } else {\n          return text;\n        }\n      },\n    },\n    {\n      title: \"角色\",\n      dataIndex: \"role\",\n      key: \"role\",\n      render: (text) => {\n        return roleMap[text];\n      },\n    },\n  ];\n\n  // const dataSource = [];\n  const [dataSource, setDataSource] = useState();\n\n  useEffect(() => {\n    setDataSource(members);\n  }, [members]);\n\n  const { data: userOptions } = useQuery(ListUserDocument);\n\n  const [updateProject] = useMutation(UpdateProjectDocument);\n  const prm = useParams();\n  const onCreate = (v) => {\n    setDataSource([\n      ...dataSource,\n      {\n        ...v,\n      },\n    ]);\n  };\n\n  const onUpdate = (v) => {\n    setDataSource(\n      dataSource.map((i) => {\n        if (i.userID === v.userID) {\n          return v;\n        }\n        return i;\n      }),\n    );\n  };\n\n  const onDelete = ({ userID }) => {\n    setDataSource(dataSource.filter((i) => i.userID !== userID));\n  };\n\n  const onSave = () => {\n    updateProject({\n      variables: {\n        projectID: prm.id as string,\n        members: dataSource.map(({ userID, role }) => ({\n          userID,\n          role,\n        })),\n      },\n    }).then((res) => {\n      message.success(\"保存成功\");\n    });\n  };\n\n  return (\n    <div>\n      <Card\n        title={\n          <div className={\"flex items-center\"}>\n            <UsergroupAddOutlined\n              className={\"text-[#687076] mr-2 text-[16px]\"}\n            />\n            <span>成员</span>\n          </div>\n        }\n      >\n        {/*{JSON.stringify(dataSource)}*/}\n        <CrudTable\n          columns={columns}\n          dataSource={dataSource}\n          loading={false}\n          onCreate={onCreate}\n          onDelete={onDelete}\n          onUpdate={onUpdate}\n          onSave={onSave}\n          formItems={(mode) => (\n            <>\n              <Form.Item label=\"成员\" name=\"userID\">\n                <Select\n                  disabled={mode === \"update\" ? true : false}\n                  placeholder={\"请选择成员\"}\n                  showSearch={true}\n                  filterOption={filterOption}\n                  options={(userOptions?.listUser || []).map(\n                    ({ email, id, nickname }) => ({\n                      label: `${nickname} <${email}>`,\n                      value: id,\n                    }),\n                  )}\n                />\n              </Form.Item>\n\n              <Form.Item label=\"角色\" name=\"role\">\n                <Select\n                  options={options}\n                  placeholder={\"请选择角色\"}\n                  labelRender={({ value }) => {\n                    return <Text>{roleMap[value]}</Text>;\n                  }}\n                />\n              </Form.Item>\n            </>\n          )}\n        />\n      </Card>\n    </div>\n  );\n};\n\nexport default MemberTable;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/configure/helper/MemberTable.tsx",
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
      "16": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 8,
      "4": 0,
      "5": 8,
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
      "36": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 56,
            "column": 6
          },
          "end": {
            "line": 56,
            "column": 25
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 56,
              "column": 6
            },
            "end": {
              "line": 56,
              "column": 19
            }
          },
          {
            "start": {
              "line": 56,
              "column": 23
            },
            "end": {
              "line": 56,
              "column": 25
            }
          }
        ],
        "line": 56
      },
      "1": {
        "loc": {
          "start": {
            "line": 65,
            "column": 22
          },
          "end": {
            "line": 65,
            "column": 49
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 65,
              "column": 22
            },
            "end": {
              "line": 65,
              "column": 43
            }
          },
          {
            "start": {
              "line": 65,
              "column": 47
            },
            "end": {
              "line": 65,
              "column": 49
            }
          }
        ],
        "line": 65
      },
      "2": {
        "loc": {
          "start": {
            "line": 66,
            "column": 8
          },
          "end": {
            "line": 70,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 66,
              "column": 8
            },
            "end": {
              "line": 70,
              "column": 9
            }
          },
          {
            "start": {
              "line": 68,
              "column": 15
            },
            "end": {
              "line": 70,
              "column": 9
            }
          }
        ],
        "line": 66
      },
      "3": {
        "loc": {
          "start": {
            "line": 106,
            "column": 8
          },
          "end": {
            "line": 108,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 106,
              "column": 8
            },
            "end": {
              "line": 108,
              "column": 9
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 106
      },
      "4": {
        "loc": {
          "start": {
            "line": 157,
            "column": 28
          },
          "end": {
            "line": 157,
            "column": 60
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 157,
              "column": 48
            },
            "end": {
              "line": 157,
              "column": 52
            }
          },
          {
            "start": {
              "line": 157,
              "column": 55
            },
            "end": {
              "line": 157,
              "column": 60
            }
          }
        ],
        "line": 157
      },
      "5": {
        "loc": {
          "start": {
            "line": 161,
            "column": 28
          },
          "end": {
            "line": 161,
            "column": 55
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 161,
              "column": 28
            },
            "end": {
              "line": 161,
              "column": 49
            }
          },
          {
            "start": {
              "line": 161,
              "column": 53
            },
            "end": {
              "line": 161,
              "column": 55
            }
          }
        ],
        "line": 161
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 53,
            "column": 21
          },
          "end": {
            "line": 53,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 56,
            "column": 5
          },
          "end": {
            "line": 56,
            "column": 70
          }
        },
        "line": 56
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 58,
            "column": 20
          },
          "end": {
            "line": 58,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 58,
            "column": 37
          },
          "end": {
            "line": 185,
            "column": 1
          }
        },
        "line": 58
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 64,
            "column": 14
          },
          "end": {
            "line": 64,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 64,
            "column": 24
          },
          "end": {
            "line": 71,
            "column": 7
          }
        },
        "line": 64
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 65,
            "column": 56
          },
          "end": {
            "line": 65,
            "column": 57
          }
        },
        "loc": {
          "start": {
            "line": 65,
            "column": 63
          },
          "end": {
            "line": 65,
            "column": 76
          }
        },
        "line": 65
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 77,
            "column": 14
          },
          "end": {
            "line": 77,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 77,
            "column": 24
          },
          "end": {
            "line": 79,
            "column": 7
          }
        },
        "line": 77
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 86,
            "column": 12
          },
          "end": {
            "line": 86,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 86,
            "column": 18
          },
          "end": {
            "line": 88,
            "column": 3
          }
        },
        "line": 86
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 94,
            "column": 19
          },
          "end": {
            "line": 94,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 94,
            "column": 26
          },
          "end": {
            "line": 101,
            "column": 3
          }
        },
        "line": 94
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 103,
            "column": 19
          },
          "end": {
            "line": 103,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 103,
            "column": 26
          },
          "end": {
            "line": 112,
            "column": 3
          }
        },
        "line": 103
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 105,
            "column": 21
          },
          "end": {
            "line": 105,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 105,
            "column": 28
          },
          "end": {
            "line": 110,
            "column": 7
          }
        },
        "line": 105
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 114,
            "column": 19
          },
          "end": {
            "line": 114,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 114,
            "column": 35
          },
          "end": {
            "line": 116,
            "column": 3
          }
        },
        "line": 114
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 115,
            "column": 36
          },
          "end": {
            "line": 115,
            "column": 37
          }
        },
        "loc": {
          "start": {
            "line": 115,
            "column": 43
          },
          "end": {
            "line": 115,
            "column": 62
          }
        },
        "line": 115
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 118,
            "column": 17
          },
          "end": {
            "line": 118,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 118,
            "column": 23
          },
          "end": {
            "line": 130,
            "column": 3
          }
        },
        "line": 118
      },
      "12": {
        "name": "(anonymous_12)",
        "decl": {
          "start": {
            "line": 122,
            "column": 32
          },
          "end": {
            "line": 122,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 122,
            "column": 55
          },
          "end": {
            "line": 125,
            "column": 9
          }
        },
        "line": 122
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 127,
            "column": 12
          },
          "end": {
            "line": 127,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 127,
            "column": 21
          },
          "end": {
            "line": 129,
            "column": 5
          }
        },
        "line": 127
      },
      "14": {
        "name": "(anonymous_14)",
        "decl": {
          "start": {
            "line": 153,
            "column": 21
          },
          "end": {
            "line": 153,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 154,
            "column": 12
          },
          "end": {
            "line": 179,
            "column": 15
          }
        },
        "line": 154
      },
      "15": {
        "name": "(anonymous_15)",
        "decl": {
          "start": {
            "line": 162,
            "column": 20
          },
          "end": {
            "line": 162,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 162,
            "column": 50
          },
          "end": {
            "line": 165,
            "column": 21
          }
        },
        "line": 162
      },
      "16": {
        "name": "(anonymous_16)",
        "decl": {
          "start": {
            "line": 174,
            "column": 31
          },
          "end": {
            "line": 174,
            "column": 32
          }
        },
        "loc": {
          "start": {
            "line": 174,
            "column": 46
          },
          "end": {
            "line": 176,
            "column": 19
          }
        },
        "line": 174
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 9,
          "column": 17
        },
        "end": {
          "line": 9,
          "column": 27
        }
      },
      "1": {
        "start": {
          "line": 10,
          "column": 16
        },
        "end": {
          "line": 44,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 46,
          "column": 16
        },
        "end": {
          "line": 50,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 53,
          "column": 21
        },
        "end": {
          "line": 56,
          "column": 70
        }
      },
      "4": {
        "start": {
          "line": 56,
          "column": 5
        },
        "end": {
          "line": 56,
          "column": 70
        }
      },
      "5": {
        "start": {
          "line": 58,
          "column": 20
        },
        "end": {
          "line": 185,
          "column": 1
        }
      },
      "6": {
        "start": {
          "line": 59,
          "column": 18
        },
        "end": {
          "line": 81,
          "column": 3
        }
      },
      "7": {
        "start": {
          "line": 65,
          "column": 21
        },
        "end": {
          "line": 65,
          "column": 77
        }
      },
      "8": {
        "start": {
          "line": 65,
          "column": 63
        },
        "end": {
          "line": 65,
          "column": 76
        }
      },
      "9": {
        "start": {
          "line": 66,
          "column": 8
        },
        "end": {
          "line": 70,
          "column": 9
        }
      },
      "10": {
        "start": {
          "line": 67,
          "column": 10
        },
        "end": {
          "line": 67,
          "column": 52
        }
      },
      "11": {
        "start": {
          "line": 69,
          "column": 10
        },
        "end": {
          "line": 69,
          "column": 22
        }
      },
      "12": {
        "start": {
          "line": 78,
          "column": 8
        },
        "end": {
          "line": 78,
          "column": 29
        }
      },
      "13": {
        "start": {
          "line": 84,
          "column": 38
        },
        "end": {
          "line": 84,
          "column": 48
        }
      },
      "14": {
        "start": {
          "line": 86,
          "column": 2
        },
        "end": {
          "line": 88,
          "column": 16
        }
      },
      "15": {
        "start": {
          "line": 87,
          "column": 4
        },
        "end": {
          "line": 87,
          "column": 27
        }
      },
      "16": {
        "start": {
          "line": 90,
          "column": 32
        },
        "end": {
          "line": 90,
          "column": 58
        }
      },
      "17": {
        "start": {
          "line": 92,
          "column": 26
        },
        "end": {
          "line": 92,
          "column": 60
        }
      },
      "18": {
        "start": {
          "line": 93,
          "column": 14
        },
        "end": {
          "line": 93,
          "column": 25
        }
      },
      "19": {
        "start": {
          "line": 94,
          "column": 19
        },
        "end": {
          "line": 101,
          "column": 3
        }
      },
      "20": {
        "start": {
          "line": 95,
          "column": 4
        },
        "end": {
          "line": 100,
          "column": 7
        }
      },
      "21": {
        "start": {
          "line": 103,
          "column": 19
        },
        "end": {
          "line": 112,
          "column": 3
        }
      },
      "22": {
        "start": {
          "line": 104,
          "column": 4
        },
        "end": {
          "line": 111,
          "column": 6
        }
      },
      "23": {
        "start": {
          "line": 106,
          "column": 8
        },
        "end": {
          "line": 108,
          "column": 9
        }
      },
      "24": {
        "start": {
          "line": 107,
          "column": 10
        },
        "end": {
          "line": 107,
          "column": 19
        }
      },
      "25": {
        "start": {
          "line": 109,
          "column": 8
        },
        "end": {
          "line": 109,
          "column": 17
        }
      },
      "26": {
        "start": {
          "line": 114,
          "column": 19
        },
        "end": {
          "line": 116,
          "column": 3
        }
      },
      "27": {
        "start": {
          "line": 115,
          "column": 4
        },
        "end": {
          "line": 115,
          "column": 65
        }
      },
      "28": {
        "start": {
          "line": 115,
          "column": 43
        },
        "end": {
          "line": 115,
          "column": 62
        }
      },
      "29": {
        "start": {
          "line": 118,
          "column": 17
        },
        "end": {
          "line": 130,
          "column": 3
        }
      },
      "30": {
        "start": {
          "line": 119,
          "column": 4
        },
        "end": {
          "line": 129,
          "column": 7
        }
      },
      "31": {
        "start": {
          "line": 122,
          "column": 55
        },
        "end": {
          "line": 125,
          "column": 9
        }
      },
      "32": {
        "start": {
          "line": 128,
          "column": 6
        },
        "end": {
          "line": 128,
          "column": 30
        }
      },
      "33": {
        "start": {
          "line": 132,
          "column": 2
        },
        "end": {
          "line": 184,
          "column": 4
        }
      },
      "34": {
        "start": {
          "line": 154,
          "column": 12
        },
        "end": {
          "line": 179,
          "column": 15
        }
      },
      "35": {
        "start": {
          "line": 162,
          "column": 50
        },
        "end": {
          "line": 165,
          "column": 21
        }
      },
      "36": {
        "start": {
          "line": 175,
          "column": 20
        },
        "end": {
          "line": 175,
          "column": 57
        }
      }
    }
  }
}