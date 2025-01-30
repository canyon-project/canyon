window["main.tsx"] = {
  "content": "import \"dayjs/locale/zh-cn.js\";\nimport \"./useWorker.ts\";\nimport \"./i18n.ts\";\nimport \"antd/dist/reset.css\";\nimport \"./index.css\";\n\nimport {\n  ApolloClient,\n  ApolloProvider,\n  createHttpLink,\n  InMemoryCache,\n} from \"@apollo/client\";\nimport { onError } from \"@apollo/client/link/error\";\nimport ReactDOM from \"react-dom/client\";\nimport { BrowserRouter } from \"react-router-dom\";\n\nimport App from \"./App.tsx\";\n\n// 创建一个error link来处理错误\nconst errorLink = onError(({ graphQLErrors, networkError }) => {\n  if (graphQLErrors) {\n    graphQLErrors.forEach(({ message: msg, locations, path }) => {\n      console.error(\n        `[GraphQL error]: msg: ${msg}, Location: ${locations}, Path: ${path}`,\n      );\n      message.error(`[GraphQL error]: msg: ${msg}, Path: ${path}`);\n      if (\n        msg === \"Unauthorized\" &&\n        window.location.pathname !== \"/oauth\" &&\n        window.location.pathname !== \"/login\"\n      ) {\n        localStorage.clear();\n        window.location.href = \"/login\";\n      }\n      // 在这里你可以执行自定义的操作，比如显示错误提示\n    });\n  }\n  if (networkError) {\n    console.error(`[Network error]: ${networkError}`);\n    // 在这里你可以执行自定义的操作，比如显示网络错误提示\n  }\n});\n\n// 创建一个http link来发送GraphQL请求\nconst httpLink = createHttpLink({\n  uri: \"/graphql\", // 你的GraphQL API的URL\n\n  headers: {\n    Authorization: `Bearer ` + (localStorage.getItem(\"token\") || \"\"),\n  },\n});\n\n// 创建Apollo Client实例\nconst client = new ApolloClient({\n  link: errorLink.concat(httpLink), // 将error link和http link组合起来\n  cache: new InMemoryCache(),\n});\n\nif (localStorage.getItem(\"theme\") === \"dark\") {\n  document.documentElement.classList.add(\"dark\");\n} else {\n  document.documentElement.classList.remove(\"dark\");\n}\n\nReactDOM.createRoot(document.getElementById(\"root\")!).render(\n  <BrowserRouter>\n    <ApolloProvider client={client}>\n      <App />\n    </ApolloProvider>\n  </BrowserRouter>,\n);\n",
  "coverage": {
    "path": "main.tsx",
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
        0,
        0
      ],
      "3": [
        0,
        0
      ],
      "4": [
        8,
        0
      ],
      "5": [
        0,
        8
      ]
    },
    "f": {
      "0": 0,
      "1": 0
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
      "10": 8,
      "11": 8,
      "12": 8,
      "13": 0,
      "14": 8,
      "15": 8
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 21,
            "column": 2
          },
          "end": {
            "line": 37,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 21,
              "column": 2
            },
            "end": {
              "line": 37,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 21
      },
      "1": {
        "loc": {
          "start": {
            "line": 27,
            "column": 6
          },
          "end": {
            "line": 34,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 27,
              "column": 6
            },
            "end": {
              "line": 34,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 27
      },
      "2": {
        "loc": {
          "start": {
            "line": 28,
            "column": 8
          },
          "end": {
            "line": 30,
            "column": 45
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 28,
              "column": 8
            },
            "end": {
              "line": 28,
              "column": 30
            }
          },
          {
            "start": {
              "line": 29,
              "column": 8
            },
            "end": {
              "line": 29,
              "column": 45
            }
          },
          {
            "start": {
              "line": 30,
              "column": 8
            },
            "end": {
              "line": 30,
              "column": 45
            }
          }
        ],
        "line": 28
      },
      "3": {
        "loc": {
          "start": {
            "line": 38,
            "column": 2
          },
          "end": {
            "line": 41,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 38,
              "column": 2
            },
            "end": {
              "line": 41,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 38
      },
      "4": {
        "loc": {
          "start": {
            "line": 49,
            "column": 32
          },
          "end": {
            "line": 49,
            "column": 67
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 49,
              "column": 32
            },
            "end": {
              "line": 49,
              "column": 61
            }
          },
          {
            "start": {
              "line": 49,
              "column": 65
            },
            "end": {
              "line": 49,
              "column": 67
            }
          }
        ],
        "line": 49
      },
      "5": {
        "loc": {
          "start": {
            "line": 59,
            "column": 0
          },
          "end": {
            "line": 63,
            "column": 1
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 59,
              "column": 0
            },
            "end": {
              "line": 63,
              "column": 1
            }
          },
          {
            "start": {
              "line": 61,
              "column": 7
            },
            "end": {
              "line": 63,
              "column": 1
            }
          }
        ],
        "line": 59
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 20,
            "column": 26
          },
          "end": {
            "line": 20,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 20,
            "column": 63
          },
          "end": {
            "line": 42,
            "column": 1
          }
        },
        "line": 20
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 22,
            "column": 26
          },
          "end": {
            "line": 22,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 22,
            "column": 65
          },
          "end": {
            "line": 36,
            "column": 5
          }
        },
        "line": 22
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 20,
          "column": 18
        },
        "end": {
          "line": 42,
          "column": 2
        }
      },
      "1": {
        "start": {
          "line": 21,
          "column": 2
        },
        "end": {
          "line": 37,
          "column": 3
        }
      },
      "2": {
        "start": {
          "line": 22,
          "column": 4
        },
        "end": {
          "line": 36,
          "column": 7
        }
      },
      "3": {
        "start": {
          "line": 23,
          "column": 6
        },
        "end": {
          "line": 25,
          "column": 8
        }
      },
      "4": {
        "start": {
          "line": 26,
          "column": 6
        },
        "end": {
          "line": 26,
          "column": 67
        }
      },
      "5": {
        "start": {
          "line": 27,
          "column": 6
        },
        "end": {
          "line": 34,
          "column": 7
        }
      },
      "6": {
        "start": {
          "line": 32,
          "column": 8
        },
        "end": {
          "line": 32,
          "column": 29
        }
      },
      "7": {
        "start": {
          "line": 33,
          "column": 8
        },
        "end": {
          "line": 33,
          "column": 40
        }
      },
      "8": {
        "start": {
          "line": 38,
          "column": 2
        },
        "end": {
          "line": 41,
          "column": 3
        }
      },
      "9": {
        "start": {
          "line": 39,
          "column": 4
        },
        "end": {
          "line": 39,
          "column": 54
        }
      },
      "10": {
        "start": {
          "line": 45,
          "column": 17
        },
        "end": {
          "line": 51,
          "column": 2
        }
      },
      "11": {
        "start": {
          "line": 54,
          "column": 15
        },
        "end": {
          "line": 57,
          "column": 2
        }
      },
      "12": {
        "start": {
          "line": 59,
          "column": 0
        },
        "end": {
          "line": 63,
          "column": 1
        }
      },
      "13": {
        "start": {
          "line": 60,
          "column": 2
        },
        "end": {
          "line": 60,
          "column": 49
        }
      },
      "14": {
        "start": {
          "line": 62,
          "column": 2
        },
        "end": {
          "line": 62,
          "column": 52
        }
      },
      "15": {
        "start": {
          "line": 65,
          "column": 0
        },
        "end": {
          "line": 71,
          "column": 2
        }
      }
    }
  }
}