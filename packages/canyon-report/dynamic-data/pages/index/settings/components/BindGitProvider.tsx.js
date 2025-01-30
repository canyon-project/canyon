window["pages/index/settings/components/BindGitProvider.tsx"] = {
  "content": "import { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport { CanyonCardPrimary } from \"../../../../components/old-ui\";\nimport { genOAuthUrl } from \"../../../../helpers/gitprovider/genOAuthUrl.ts\";\n// const gitProviderList = [\n//   {\n//     name: 'name',\n//     url: 'dddddd',\n//     client: 's',\n//   },\n// ];\nconst ProviderOAuth = ({ name, type, url, clientID }) => {\n  return (\n    <a\n      className={\"flex flex-col items-center\"}\n      style={{ minWidth: \"80px\" }}\n      href={genOAuthUrl({ url, type, clientID })}\n    >\n      <img className={\"w-[32px]\"} src={`/gitproviders/${type}.svg`} alt=\"\" />\n      <span className={\"text-center\"}>{name}</span>\n    </a>\n  );\n};\nconst Faa = () => {\n  const { data: gitProviderList } = useRequest(() =>\n    axios.get(`/api/gitprovider`).then(({ data }) => data),\n  );\n  return (\n    <div>\n      <CanyonCardPrimary>\n        {/*<span>{JSON.stringify(data || {})}</span>*/}\n        <Card title={\"绑定提供商\"} bordered={false}>\n          <ConfigProvider\n            theme={{\n              token: {\n                borderRadius: 0,\n              },\n            }}\n          >\n            <Table\n              pagination={false}\n              bordered={true}\n              dataSource={[\n                {\n                  provider: \"gitlab\",\n                  providerName: \"GitLab\",\n                  providerUsername: \"zhangtao25\",\n                  providerAvatar: \"sss\",\n                  loggedIn: \"2002\",\n                },\n              ]}\n              columns={[\n                {\n                  title: \"提供商ID\",\n                  dataIndex: \"provider\",\n                  // dataIndex:'ss'\n                },\n                {\n                  title: \"提供商\",\n                  dataIndex: \"providerName\",\n                  // dataIndex:'ss'\n                },\n                {\n                  title: \"详情\",\n                  dataIndex: \"providerUsername\",\n                  // dataIndex:'ss'\n                },\n                {\n                  title: \"绑定时间\",\n                  dataIndex: \"loggedIn\",\n                  // dataIndex:'ss'\n                },\n                {\n                  title: \"操作\",\n                  dataIndex: \"dd\",\n                  // dataIndex:'ss'\n                },\n              ]}\n            />\n          </ConfigProvider>\n          <div className={\"h-[10px]\"}></div>\n          <p>你还可以绑定以下第三方帐号</p>\n          <div className={\"flex\"}>\n            {/*https://gitlab.com/oauth/authorize?client_id=0cf45ded30469aba3f014b06fb61526ca70098f2a0b22d51c5c3ee60fc18c4d8&redirect_uri=https%3A%2F%2Fgitee.com%2Fauth%2Fgitlab%2Fcallback&response_type=code&state=f25d4b0c10b6a742bde3eae8be273c7df1f54190014aed0c*/}\n            {/*https://github.com/login/oauth/authorize?client_id=5a179b878a9f6ac42acd&redirect_uri=https%3A%2F%2Fgitee.com%2Fauth%2Fgithub%2Fcallback&response_type=code&scope=user&state=460a986d8070f3d30fb2a6eb0485de2bdd5c31382f915a40*/}\n            {(gitProviderList || []).map(({ name, type, url, clientID }) => (\n              <ProviderOAuth\n                name={name}\n                type={type}\n                url={url}\n                clientID={clientID}\n              />\n            ))}\n          </div>\n        </Card>\n      </CanyonCardPrimary>\n    </div>\n  );\n};\n\nexport default Faa;\n",
  "coverage": {
    "path": "pages/index/settings/components/BindGitProvider.tsx",
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
      "1": 0,
      "2": 8,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 86,
            "column": 14
          },
          "end": {
            "line": 86,
            "column": 35
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 86,
              "column": 14
            },
            "end": {
              "line": 86,
              "column": 29
            }
          },
          {
            "start": {
              "line": 86,
              "column": 33
            },
            "end": {
              "line": 86,
              "column": 35
            }
          }
        ],
        "line": 86
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 12,
            "column": 22
          },
          "end": {
            "line": 12,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 12,
            "column": 57
          },
          "end": {
            "line": 23,
            "column": 1
          }
        },
        "line": 12
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 24,
            "column": 12
          },
          "end": {
            "line": 24,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 24,
            "column": 18
          },
          "end": {
            "line": 99,
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
            "line": 86,
            "column": 41
          },
          "end": {
            "line": 86,
            "column": 42
          }
        },
        "loc": {
          "start": {
            "line": 87,
            "column": 14
          },
          "end": {
            "line": 92,
            "column": 16
          }
        },
        "line": 87
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 12,
          "column": 22
        },
        "end": {
          "line": 23,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 13,
          "column": 2
        },
        "end": {
          "line": 22,
          "column": 4
        }
      },
      "2": {
        "start": {
          "line": 24,
          "column": 12
        },
        "end": {
          "line": 99,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 25,
          "column": 36
        },
        "end": {
          "line": 27,
          "column": 3
        }
      },
      "4": {
        "start": {
          "line": 26,
          "column": 4
        },
        "end": {
          "line": 26,
          "column": 58
        }
      },
      "5": {
        "start": {
          "line": 26,
          "column": 53
        },
        "end": {
          "line": 26,
          "column": 57
        }
      },
      "6": {
        "start": {
          "line": 28,
          "column": 2
        },
        "end": {
          "line": 98,
          "column": 4
        }
      },
      "7": {
        "start": {
          "line": 87,
          "column": 14
        },
        "end": {
          "line": 92,
          "column": 16
        }
      }
    }
  }
}