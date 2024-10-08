window["components/old-ui/components/layout/Base.tsx"] = {
  "content": "import { MoreOutlined, SearchOutlined } from \"@ant-design/icons\";\nimport { FC, ReactNode } from \"react\";\nimport { ErrorBoundary } from \"react-error-boundary\";\nimport { CanyonCardPrimary } from \"../card\";\nimport Footer from \"./footer.tsx\";\nimport ScrollBasedLayout from \"./ScrollBasedLayout.tsx\";\n\nconst { useToken } = theme;\nconst { Text, Title } = Typography;\ninterface CanyonLayoutBaseProps {\n  title?: string;\n  logo?: ReactNode;\n  mainTitleRightNode?: ReactNode;\n  menuSelectedKey?: string;\n  onSelectMenu?: (selectInfo: { key: string }) => void;\n  menuItems: MenuProps[\"items\"];\n  renderMainContent?: ReactNode;\n  onClickGlobalSearch?: () => void;\n  MeData: any;\n  itemsDropdown: any;\n  search: any;\n  account: any;\n  breadcrumb: any;\n  footerName?: string;\n}\nconst CanyonLayoutBase: FC<CanyonLayoutBaseProps> = ({\n  title = \"Canyon\",\n  logo,\n  mainTitleRightNode,\n  menuSelectedKey = \"\",\n  onSelectMenu,\n  menuItems,\n  renderMainContent,\n  onClickGlobalSearch,\n  MeData,\n  itemsDropdown,\n  search,\n  account,\n  breadcrumb,\n  footerName = \"CANYON\",\n}) => {\n  const { token } = useToken();\n\n  return (\n    <div>\n      <>\n        <ScrollBasedLayout\n          sideBar={\n            <div\n              className={\"w-[260px] h-[100vh] overflow-hidden flex flex-col\"}\n              style={{ borderRight: `1px solid ${token.colorBorder}` }}\n            >\n              <div className={\"px-3 py-[16px]\"}>\n                <div className={\"flex items-center justify-between\"}>\n                  <div\n                    className={\"cursor-pointer flex items-center\"}\n                    style={{ marginBottom: 0 }}\n                    onClick={() => {\n                      window.location.href = \"/\";\n                    }}\n                  >\n                    {logo}\n                    <span\n                      className={\"ml-[8px]\"}\n                      style={{ fontSize: \"18px\", fontWeight: \"bolder\" }}\n                    >\n                      {title}\n                    </span>\n                  </div>\n\n                  <div>{mainTitleRightNode}</div>\n                </div>\n              </div>\n              {search && (\n                <div className={\"px-2\"}>\n                  <CanyonCardPrimary>\n                    <Button\n                      type=\"text\"\n                      className={\"w-full\"}\n                      onClick={() => {\n                        onClickGlobalSearch?.();\n                      }}\n                    >\n                      <div className={\"flex justify-between\"}>\n                        <SearchOutlined />\n                        <Text>Search</Text>\n\n                        <div className={\"inline-block\"}>\n                          <kbd className=\"px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500\">\n                            ⌘\n                          </kbd>\n                          <kbd className=\"px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500\">\n                            K\n                          </kbd>\n                        </div>\n                      </div>\n                    </Button>\n                  </CanyonCardPrimary>\n                </div>\n              )}\n\n              {account && (\n                <div className={\"px-2 flex flex-col mb-3\"}>\n                  <Text type={\"secondary\"} style={{ fontSize: \"10px\" }}>\n                    Account\n                  </Text>\n                  <CanyonCardPrimary>\n                    <Select\n                      variant={\"borderless\"}\n                      defaultValue=\"lucy\"\n                      style={{ width: \"100%\" }}\n                      options={[\n                        {\n                          label: \"Personal account\",\n                          options: [\n                            { label: \"Jack\", value: \"jack\" },\n                            { label: \"Lucy\", value: \"lucy\" },\n                          ],\n                        },\n                        {\n                          label: \"Organizations\",\n                          options: [{ label: \"yiminghe\", value: \"Yiminghe\" }],\n                        },\n                      ]}\n                    />\n                  </CanyonCardPrimary>\n                </div>\n              )}\n\n              <div\n                className={\"mb-1\"}\n                style={{\n                  borderBottom: `1px solid ${token.colorBorder}`,\n                }}\n              />\n\n              <Menu\n                onSelect={(selectInfo) => {\n                  onSelectMenu?.(selectInfo);\n                }}\n                selectedKeys={[menuSelectedKey]}\n                items={menuItems}\n                className={\"dark:bg-[#151718] px-1\"}\n                style={{ flex: \"1\" }}\n              />\n\n              <Dropdown\n                menu={{\n                  items: itemsDropdown,\n                  onClick: () => {},\n                }}\n              >\n                <div\n                  className={\n                    \"h-[77px] py-[16px] px-[16px] flex items-center justify-between cursor-pointer\"\n                  }\n                  style={{ borderTop: `1px solid ${token.colorBorder}` }}\n                >\n                  <Avatar src={MeData?.me.avatar}></Avatar>\n                  <div className={\"flex flex-col\"}>\n                    <Text ellipsis className={\"w-[150px]\"}>\n                      {MeData?.me.nickname}\n                    </Text>\n                    <Text ellipsis className={\"w-[150px]\"} type={\"secondary\"}>\n                      {MeData?.me.email || \"\"}\n                    </Text>\n                  </div>\n                  <MoreOutlined className={\"dark:text-[#fff]\"} />\n                </div>\n              </Dropdown>\n            </div>\n          }\n          mainContent={\n            <div\n              className={\"flex-1 bg-[#fbfcfd] dark:bg-[#0c0d0e] min-h-[100vh]\"}\n            >\n              <div className={\"m-auto max-w-[1200px] min-w-[1000px] px-[12px]\"}>\n                {breadcrumb}\n              </div>\n              <div className={\"m-auto max-w-[1200px] min-w-[1000px] p-[12px]\"}>\n                <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>\n                  {renderMainContent}\n                </ErrorBoundary>\n              </div>\n            </div>\n          }\n          footer={<Footer name={footerName} corp={\"Trip.com\"} />}\n        />\n      </>\n    </div>\n  );\n};\n\nexport default CanyonLayoutBase;\n",
  "coverage": {
    "path": "components/old-ui/components/layout/Base.tsx",
    "b": {
      "0": [
        0
      ],
      "1": [
        0
      ],
      "2": [
        57
      ],
      "3": [
        57,
        0
      ],
      "4": [
        57,
        0
      ],
      "5": [
        57,
        25
      ]
    },
    "f": {
      "0": 57,
      "1": 0,
      "2": 0,
      "3": 18,
      "4": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 8,
      "3": 57,
      "4": 57,
      "5": 0,
      "6": 0,
      "7": 18
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 27,
            "column": 2
          },
          "end": {
            "line": 27,
            "column": 18
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 27,
              "column": 10
            },
            "end": {
              "line": 27,
              "column": 18
            }
          }
        ],
        "line": 27
      },
      "1": {
        "loc": {
          "start": {
            "line": 30,
            "column": 2
          },
          "end": {
            "line": 30,
            "column": 22
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 30,
              "column": 20
            },
            "end": {
              "line": 30,
              "column": 22
            }
          }
        ],
        "line": 30
      },
      "2": {
        "loc": {
          "start": {
            "line": 40,
            "column": 2
          },
          "end": {
            "line": 40,
            "column": 23
          }
        },
        "type": "default-arg",
        "locations": [
          {
            "start": {
              "line": 40,
              "column": 15
            },
            "end": {
              "line": 40,
              "column": 23
            }
          }
        ],
        "line": 40
      },
      "3": {
        "loc": {
          "start": {
            "line": 74,
            "column": 15
          },
          "end": {
            "line": 100,
            "column": 15
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 74,
              "column": 15
            },
            "end": {
              "line": 74,
              "column": 21
            }
          },
          {
            "start": {
              "line": 75,
              "column": 16
            },
            "end": {
              "line": 99,
              "column": 22
            }
          }
        ],
        "line": 74
      },
      "4": {
        "loc": {
          "start": {
            "line": 102,
            "column": 15
          },
          "end": {
            "line": 128,
            "column": 15
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 102,
              "column": 15
            },
            "end": {
              "line": 102,
              "column": 22
            }
          },
          {
            "start": {
              "line": 103,
              "column": 16
            },
            "end": {
              "line": 127,
              "column": 22
            }
          }
        ],
        "line": 102
      },
      "5": {
        "loc": {
          "start": {
            "line": 165,
            "column": 23
          },
          "end": {
            "line": 165,
            "column": 45
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 165,
              "column": 23
            },
            "end": {
              "line": 165,
              "column": 39
            }
          },
          {
            "start": {
              "line": 165,
              "column": 43
            },
            "end": {
              "line": 165,
              "column": 45
            }
          }
        ],
        "line": 165
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 26,
            "column": 52
          },
          "end": {
            "line": 26,
            "column": 53
          }
        },
        "loc": {
          "start": {
            "line": 41,
            "column": 6
          },
          "end": {
            "line": 192,
            "column": 1
          }
        },
        "line": 41
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 58,
            "column": 29
          },
          "end": {
            "line": 58,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 58,
            "column": 35
          },
          "end": {
            "line": 60,
            "column": 21
          }
        },
        "line": 58
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 80,
            "column": 31
          },
          "end": {
            "line": 80,
            "column": 32
          }
        },
        "loc": {
          "start": {
            "line": 80,
            "column": 37
          },
          "end": {
            "line": 82,
            "column": 23
          }
        },
        "line": 80
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 138,
            "column": 26
          },
          "end": {
            "line": 138,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 138,
            "column": 42
          },
          "end": {
            "line": 140,
            "column": 17
          }
        },
        "line": 138
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 150,
            "column": 27
          },
          "end": {
            "line": 150,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 150,
            "column": 33
          },
          "end": {
            "line": 150,
            "column": 35
          }
        },
        "line": 150
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 8,
          "column": 21
        },
        "end": {
          "line": 8,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 9,
          "column": 24
        },
        "end": {
          "line": 9,
          "column": 34
        }
      },
      "2": {
        "start": {
          "line": 26,
          "column": 52
        },
        "end": {
          "line": 192,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 42,
          "column": 20
        },
        "end": {
          "line": 42,
          "column": 30
        }
      },
      "4": {
        "start": {
          "line": 44,
          "column": 2
        },
        "end": {
          "line": 191,
          "column": 4
        }
      },
      "5": {
        "start": {
          "line": 59,
          "column": 22
        },
        "end": {
          "line": 59,
          "column": 49
        }
      },
      "6": {
        "start": {
          "line": 81,
          "column": 24
        },
        "end": {
          "line": 81,
          "column": 48
        }
      },
      "7": {
        "start": {
          "line": 139,
          "column": 18
        },
        "end": {
          "line": 139,
          "column": 45
        }
      }
    }
  }
}