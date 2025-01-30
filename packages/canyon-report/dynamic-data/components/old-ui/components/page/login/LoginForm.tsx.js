window["components/old-ui/components/page/login/LoginForm.tsx"] = {
  "content": "import { useRequest } from \"ahooks\";\nimport { FC } from \"react\";\nconst onFinishFailed = (errorInfo: any) => {\n  console.log(\"Failed:\", errorInfo);\n};\n\ntype FieldType = {\n  companyname?: string;\n  username?: string;\n  password?: string;\n};\n\nconst LoginForm: FC<{\n  onLoginSuccess: () => void;\n}> = ({ onLoginSuccess }) => {\n  const { run } = useRequest(\n    ({ username, password, companyname }) =>\n      fetch(`/api/login`, {\n        method: \"POST\",\n        headers: {\n          \"Content-Type\": \"application/json\",\n        },\n        body: JSON.stringify({\n          username: username,\n          password: password,\n          companyname: companyname,\n        }),\n      })\n        .then((res) => res.json())\n        .then((res) => {\n          if (res.statusCode >= 400) {\n            return Promise.reject(res);\n          } else {\n            return res;\n          }\n        }),\n    {\n      onSuccess: (data) => {\n        message.success(\"登录成功\");\n        onLoginSuccess();\n        localStorage.setItem(\"token\", data.token);\n      },\n      onError: (error) => {\n        console.log(error);\n        message.error(error.message);\n      },\n      manual: true,\n    },\n  );\n  const [form] = Form.useForm();\n  const onFinish = (values: any) => {\n    console.log(\"Success:\", values);\n    run({\n      companyname: String(values.companyname),\n      username: String(values.username),\n      password: String(values.password),\n    });\n  };\n  return (\n    <Form\n      form={form}\n      name=\"basic\"\n      layout={\"vertical\"}\n      className={\"flex-1 pr-5\"}\n      onFinish={onFinish}\n      onFinishFailed={onFinishFailed}\n    >\n      <Form.Item<FieldType>\n        label=\"Username\"\n        name=\"username\"\n        rules={[{ required: true, message: \"Please input your username!\" }]}\n      >\n        <Input placeholder={\"Username or Email\"} />\n      </Form.Item>\n\n      <Form.Item<FieldType>\n        label=\"Password\"\n        name=\"password\"\n        rules={[{ required: true, message: \"Please input your password!\" }]}\n      >\n        <Input.Password placeholder={\"Password\"} />\n      </Form.Item>\n\n      <Form.Item>\n        <Button type=\"primary\" htmlType=\"submit\">\n          Continue\n        </Button>\n      </Form.Item>\n    </Form>\n  );\n};\n\nexport default LoginForm;\n",
  "coverage": {
    "path": "components/old-ui/components/page/login/LoginForm.tsx",
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
      "7": 0
    },
    "s": {
      "0": 8,
      "1": 0,
      "2": 8,
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
            "line": 31,
            "column": 10
          },
          "end": {
            "line": 35,
            "column": 11
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 31,
              "column": 10
            },
            "end": {
              "line": 35,
              "column": 11
            }
          },
          {
            "start": {
              "line": 33,
              "column": 17
            },
            "end": {
              "line": 35,
              "column": 11
            }
          }
        ],
        "line": 31
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 3,
            "column": 23
          },
          "end": {
            "line": 3,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 3,
            "column": 43
          },
          "end": {
            "line": 5,
            "column": 1
          }
        },
        "line": 3
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 15,
            "column": 5
          },
          "end": {
            "line": 15,
            "column": 6
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 29
          },
          "end": {
            "line": 91,
            "column": 1
          }
        },
        "line": 15
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 17,
            "column": 4
          },
          "end": {
            "line": 17,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 6
          },
          "end": {
            "line": 36,
            "column": 10
          }
        },
        "line": 18
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 29,
            "column": 14
          },
          "end": {
            "line": 29,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 29,
            "column": 23
          },
          "end": {
            "line": 29,
            "column": 33
          }
        },
        "line": 29
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 30,
            "column": 14
          },
          "end": {
            "line": 30,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 30,
            "column": 23
          },
          "end": {
            "line": 36,
            "column": 9
          }
        },
        "line": 30
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 38,
            "column": 17
          },
          "end": {
            "line": 38,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 38,
            "column": 27
          },
          "end": {
            "line": 42,
            "column": 7
          }
        },
        "line": 38
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 43,
            "column": 15
          },
          "end": {
            "line": 43,
            "column": 16
          }
        },
        "loc": {
          "start": {
            "line": 43,
            "column": 26
          },
          "end": {
            "line": 46,
            "column": 7
          }
        },
        "line": 43
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 51,
            "column": 19
          },
          "end": {
            "line": 51,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 51,
            "column": 36
          },
          "end": {
            "line": 58,
            "column": 3
          }
        },
        "line": 51
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 23
        },
        "end": {
          "line": 5,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 4,
          "column": 2
        },
        "end": {
          "line": 4,
          "column": 36
        }
      },
      "2": {
        "start": {
          "line": 15,
          "column": 5
        },
        "end": {
          "line": 91,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 16,
          "column": 18
        },
        "end": {
          "line": 49,
          "column": 3
        }
      },
      "4": {
        "start": {
          "line": 18,
          "column": 6
        },
        "end": {
          "line": 36,
          "column": 10
        }
      },
      "5": {
        "start": {
          "line": 29,
          "column": 23
        },
        "end": {
          "line": 29,
          "column": 33
        }
      },
      "6": {
        "start": {
          "line": 31,
          "column": 10
        },
        "end": {
          "line": 35,
          "column": 11
        }
      },
      "7": {
        "start": {
          "line": 32,
          "column": 12
        },
        "end": {
          "line": 32,
          "column": 39
        }
      },
      "8": {
        "start": {
          "line": 34,
          "column": 12
        },
        "end": {
          "line": 34,
          "column": 23
        }
      },
      "9": {
        "start": {
          "line": 39,
          "column": 8
        },
        "end": {
          "line": 39,
          "column": 32
        }
      },
      "10": {
        "start": {
          "line": 40,
          "column": 8
        },
        "end": {
          "line": 40,
          "column": 25
        }
      },
      "11": {
        "start": {
          "line": 41,
          "column": 8
        },
        "end": {
          "line": 41,
          "column": 50
        }
      },
      "12": {
        "start": {
          "line": 44,
          "column": 8
        },
        "end": {
          "line": 44,
          "column": 27
        }
      },
      "13": {
        "start": {
          "line": 45,
          "column": 8
        },
        "end": {
          "line": 45,
          "column": 37
        }
      },
      "14": {
        "start": {
          "line": 50,
          "column": 17
        },
        "end": {
          "line": 50,
          "column": 31
        }
      },
      "15": {
        "start": {
          "line": 51,
          "column": 19
        },
        "end": {
          "line": 58,
          "column": 3
        }
      },
      "16": {
        "start": {
          "line": 52,
          "column": 4
        },
        "end": {
          "line": 52,
          "column": 36
        }
      },
      "17": {
        "start": {
          "line": 53,
          "column": 4
        },
        "end": {
          "line": 57,
          "column": 7
        }
      },
      "18": {
        "start": {
          "line": 59,
          "column": 2
        },
        "end": {
          "line": 90,
          "column": 4
        }
      }
    }
  }
}