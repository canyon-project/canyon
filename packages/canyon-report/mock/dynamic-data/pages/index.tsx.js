window["pages/index.tsx"] = {
  "content": "import {\n  ArrowRightOutlined,\n  BarChartOutlined,\n  FolderOutlined,\n  LogoutOutlined,\n  SettingOutlined,\n} from \"@ant-design/icons\";\nimport { useQuery } from \"@apollo/client\";\nimport { useRequest } from \"ahooks\";\nimport axios from \"axios\";\nimport { useTranslation } from \"react-i18next\";\n\nimport book from \"../assets/book.svg\";\nimport {\n  CanyonLayoutBase,\n  CanyonModalGlobalSearch,\n} from \"../components/old-ui\";\nimport { MeDocument } from \"../helpers/backend/gen/graphql.ts\";\nimport { genBreadcrumbItems } from \"../layouts/genBreadcrumbItems.tsx\";\nimport { genTitle } from \"../layouts/genTitle.ts\";\nconst theme = localStorage.getItem(\"theme\") || \"light\";\n// console.log(theme, 'theme');\nfunction Index() {\n  const { t } = useTranslation();\n  useEffect(() => {\n    if (localStorage.getItem(\"token\") === null) {\n      localStorage.clear();\n      localStorage.setItem(\"callback\", window.location.href);\n      nav(\"/login\");\n    }\n  }, []);\n\n  const loc = useLocation();\n  const nav = useNavigate();\n\n  useEffect(() => {\n    if (loc.pathname === \"/\") {\n      nav(\"/projects\");\n    }\n    document.title = genTitle(loc.pathname);\n\n    try {\n      // @ts-ignore\n      if (meData?.me.username && meData?.me.username !== \"tzhangm\") {\n        // @ts-ignore\n        fetch(window.__canyon__.dsn, {\n          method: \"POST\",\n          headers: {\n            \"Content-Type\": \"application/json\",\n            Authorization: `Bearer ${localStorage.getItem(\"token\")}`,\n          },\n          body: JSON.stringify({\n            // @ts-ignore\n            coverage: window.__coverage__,\n            // @ts-ignore\n            commitSha: window.__canyon__.commitSha,\n            // @ts-ignore\n            projectID: window.__canyon__.projectID,\n            // @ts-ignore\n            instrumentCwd: window.__canyon__.instrumentCwd,\n            // @ts-ignore\n            reportID: `${meData?.me.username}|${loc.pathname}`,\n            // @ts-ignore\n            branch: window.__canyon__.branch,\n          }),\n        });\n      }\n    } catch (e) {\n      // console.log(e);\n    }\n  }, [loc.pathname]);\n\n  useEffect(() => {\n    setMenuSelectedKey(loc.pathname.replace(\"/\", \"\"));\n  }, [loc.pathname]);\n  const { data: meData } = useQuery(MeDocument);\n  useEffect(() => {\n    localStorage.setItem(\"username\", meData?.me.username || \"\");\n  }, [meData]);\n  const { data: baseData } = useRequest(\n    () => axios.get(\"/api/base\").then(({ data }) => data),\n    {\n      onSuccess(data) {\n        // @ts-ignore\n        window.GITLAB_URL = data.GITLAB_URL;\n      },\n    },\n  );\n  const [menuSelectedKey, setMenuSelectedKey] = useState<string>(\"projects\");\n  // @ts-ignore\n  window.canyonModalGlobalSearchRef = useRef(null);\n  return (\n    <>\n      {/*<GlobaScreenWidthLimitModal />*/}\n      <CanyonLayoutBase\n        breadcrumb={\n          <div>\n            {/*榜单mark*/}\n            <Breadcrumb\n              className={\"py-3\"}\n              items={genBreadcrumbItems(loc.pathname)}\n            />\n          </div>\n        }\n        itemsDropdown={[\n          {\n            label: (\n              <div className={\"text-red-500\"}>\n                <LogoutOutlined className={\"mr-2\"} />\n                Logout\n              </div>\n            ),\n            onClick: () => {\n              localStorage.clear();\n              window.location.href = \"/login\";\n            },\n          },\n        ]}\n        MeData={meData}\n        onClickGlobalSearch={() => {\n          // @ts-ignore\n          window.canyonModalGlobalSearchRef.current.report();\n        }}\n        title={\"Canyon\"}\n        logo={\n          <div>\n            <img src={`/${theme}-logo.svg?a=1`} alt=\"\" className={\"w-[28px]\"} />\n          </div>\n        }\n        mainTitleRightNode={\n          <div>\n            <Tooltip\n              title={\n                <div>\n                  <span>{t(\"menus.docs\")}</span>\n                  <ArrowRightOutlined />\n                </div>\n              }\n            >\n              <a\n                href={baseData?.SYSTEM_QUESTION_LINK}\n                target={\"_blank\"}\n                rel=\"noreferrer\"\n                className={\"ml-2\"}\n              >\n                {/* eslint-disable-next-line jsx-a11y/alt-text */}\n                <img src={book} />\n              </a>\n            </Tooltip>\n            {/*marker position*/}\n          </div>\n        }\n        menuSelectedKey={menuSelectedKey}\n        onSelectMenu={(selectInfo) => {\n          setMenuSelectedKey(selectInfo.key);\n          nav(`/${selectInfo.key}`);\n        }}\n        menuItems={[\n          {\n            label: t(\"menus.projects\"),\n            key: \"projects\",\n            icon: <FolderOutlined />,\n          },\n          {\n            label: t(\"报表\"),\n            key: \"reports\",\n            icon: <BarChartOutlined />,\n          },\n          {\n            label: t(\"menus.settings\"),\n            key: \"settings\",\n            icon: <SettingOutlined />,\n          },\n        ]}\n        renderMainContent={<Outlet />}\n        search={false}\n        account={false}\n      />\n      {/*// @ts-ignore*/}\n      <CanyonModalGlobalSearch ref={canyonModalGlobalSearchRef} />\n    </>\n  );\n}\n\nexport default Index;\n",
  "coverage": {
    "path": "pages/index.tsx",
    "b": {
      "0": [
        8,
        8
      ],
      "1": [
        0,
        8
      ],
      "2": [
        1,
        31
      ],
      "3": [
        23,
        9
      ],
      "4": [
        32,
        23
      ],
      "5": [
        16,
        8
      ]
    },
    "f": {
      "0": 71,
      "1": 8,
      "2": 32,
      "3": 24,
      "4": 16,
      "5": 8,
      "6": 8,
      "7": 8,
      "8": 0,
      "9": 0,
      "10": 18
    },
    "s": {
      "0": 8,
      "1": 71,
      "2": 71,
      "3": 8,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 71,
      "8": 71,
      "9": 71,
      "10": 32,
      "11": 1,
      "12": 32,
      "13": 32,
      "14": 32,
      "15": 23,
      "16": 71,
      "17": 24,
      "18": 71,
      "19": 71,
      "20": 16,
      "21": 71,
      "22": 8,
      "23": 8,
      "24": 8,
      "25": 71,
      "26": 71,
      "27": 71,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 18,
      "32": 18
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 21,
            "column": 14
          },
          "end": {
            "line": 21,
            "column": 54
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 21,
              "column": 14
            },
            "end": {
              "line": 21,
              "column": 43
            }
          },
          {
            "start": {
              "line": 21,
              "column": 47
            },
            "end": {
              "line": 21,
              "column": 54
            }
          }
        ],
        "line": 21
      },
      "1": {
        "loc": {
          "start": {
            "line": 26,
            "column": 4
          },
          "end": {
            "line": 30,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 26,
              "column": 4
            },
            "end": {
              "line": 30,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 26
      },
      "2": {
        "loc": {
          "start": {
            "line": 37,
            "column": 4
          },
          "end": {
            "line": 39,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 37,
              "column": 4
            },
            "end": {
              "line": 39,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 37
      },
      "3": {
        "loc": {
          "start": {
            "line": 44,
            "column": 6
          },
          "end": {
            "line": 67,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 44,
              "column": 6
            },
            "end": {
              "line": 67,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 44
      },
      "4": {
        "loc": {
          "start": {
            "line": 44,
            "column": 10
          },
          "end": {
            "line": 44,
            "column": 66
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 44,
              "column": 10
            },
            "end": {
              "line": 44,
              "column": 29
            }
          },
          {
            "start": {
              "line": 44,
              "column": 33
            },
            "end": {
              "line": 44,
              "column": 66
            }
          }
        ],
        "line": 44
      },
      "5": {
        "loc": {
          "start": {
            "line": 78,
            "column": 37
          },
          "end": {
            "line": 78,
            "column": 62
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 78,
              "column": 37
            },
            "end": {
              "line": 78,
              "column": 56
            }
          },
          {
            "start": {
              "line": 78,
              "column": 60
            },
            "end": {
              "line": 78,
              "column": 62
            }
          }
        ],
        "line": 78
      }
    },
    "fnMap": {
      "0": {
        "name": "Index",
        "decl": {
          "start": {
            "line": 23,
            "column": 9
          },
          "end": {
            "line": 23,
            "column": 14
          }
        },
        "loc": {
          "start": {
            "line": 23,
            "column": 17
          },
          "end": {
            "line": 183,
            "column": 1
          }
        },
        "line": 23
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 25,
            "column": 12
          },
          "end": {
            "line": 25,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 25,
            "column": 18
          },
          "end": {
            "line": 31,
            "column": 3
          }
        },
        "line": 25
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 36,
            "column": 12
          },
          "end": {
            "line": 36,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 36,
            "column": 18
          },
          "end": {
            "line": 71,
            "column": 3
          }
        },
        "line": 36
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 73,
            "column": 12
          },
          "end": {
            "line": 73,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 73,
            "column": 18
          },
          "end": {
            "line": 75,
            "column": 3
          }
        },
        "line": 73
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 77,
            "column": 12
          },
          "end": {
            "line": 77,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 77,
            "column": 18
          },
          "end": {
            "line": 79,
            "column": 3
          }
        },
        "line": 77
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 81,
            "column": 4
          },
          "end": {
            "line": 81,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 10
          },
          "end": {
            "line": 81,
            "column": 57
          }
        },
        "line": 81
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 81,
            "column": 38
          },
          "end": {
            "line": 81,
            "column": 39
          }
        },
        "loc": {
          "start": {
            "line": 81,
            "column": 52
          },
          "end": {
            "line": 81,
            "column": 56
          }
        },
        "line": 81
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 83,
            "column": 6
          },
          "end": {
            "line": 83,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 83,
            "column": 22
          },
          "end": {
            "line": 86,
            "column": 7
          }
        },
        "line": 83
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 113,
            "column": 21
          },
          "end": {
            "line": 113,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 113,
            "column": 27
          },
          "end": {
            "line": 116,
            "column": 13
          }
        },
        "line": 113
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 120,
            "column": 29
          },
          "end": {
            "line": 120,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 120,
            "column": 35
          },
          "end": {
            "line": 123,
            "column": 9
          }
        },
        "line": 120
      },
      "10": {
        "name": "(anonymous_10)",
        "decl": {
          "start": {
            "line": 154,
            "column": 22
          },
          "end": {
            "line": 154,
            "column": 23
          }
        },
        "loc": {
          "start": {
            "line": 154,
            "column": 38
          },
          "end": {
            "line": 157,
            "column": 9
          }
        },
        "line": 154
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 21,
          "column": 14
        },
        "end": {
          "line": 21,
          "column": 54
        }
      },
      "1": {
        "start": {
          "line": 24,
          "column": 16
        },
        "end": {
          "line": 24,
          "column": 32
        }
      },
      "2": {
        "start": {
          "line": 25,
          "column": 2
        },
        "end": {
          "line": 31,
          "column": 9
        }
      },
      "3": {
        "start": {
          "line": 26,
          "column": 4
        },
        "end": {
          "line": 30,
          "column": 5
        }
      },
      "4": {
        "start": {
          "line": 27,
          "column": 6
        },
        "end": {
          "line": 27,
          "column": 27
        }
      },
      "5": {
        "start": {
          "line": 28,
          "column": 6
        },
        "end": {
          "line": 28,
          "column": 61
        }
      },
      "6": {
        "start": {
          "line": 29,
          "column": 6
        },
        "end": {
          "line": 29,
          "column": 20
        }
      },
      "7": {
        "start": {
          "line": 33,
          "column": 14
        },
        "end": {
          "line": 33,
          "column": 27
        }
      },
      "8": {
        "start": {
          "line": 34,
          "column": 14
        },
        "end": {
          "line": 34,
          "column": 27
        }
      },
      "9": {
        "start": {
          "line": 36,
          "column": 2
        },
        "end": {
          "line": 71,
          "column": 21
        }
      },
      "10": {
        "start": {
          "line": 37,
          "column": 4
        },
        "end": {
          "line": 39,
          "column": 5
        }
      },
      "11": {
        "start": {
          "line": 38,
          "column": 6
        },
        "end": {
          "line": 38,
          "column": 23
        }
      },
      "12": {
        "start": {
          "line": 40,
          "column": 4
        },
        "end": {
          "line": 40,
          "column": 44
        }
      },
      "13": {
        "start": {
          "line": 42,
          "column": 4
        },
        "end": {
          "line": 70,
          "column": 5
        }
      },
      "14": {
        "start": {
          "line": 44,
          "column": 6
        },
        "end": {
          "line": 67,
          "column": 7
        }
      },
      "15": {
        "start": {
          "line": 46,
          "column": 8
        },
        "end": {
          "line": 66,
          "column": 11
        }
      },
      "16": {
        "start": {
          "line": 73,
          "column": 2
        },
        "end": {
          "line": 75,
          "column": 21
        }
      },
      "17": {
        "start": {
          "line": 74,
          "column": 4
        },
        "end": {
          "line": 74,
          "column": 54
        }
      },
      "18": {
        "start": {
          "line": 76,
          "column": 27
        },
        "end": {
          "line": 76,
          "column": 47
        }
      },
      "19": {
        "start": {
          "line": 77,
          "column": 2
        },
        "end": {
          "line": 79,
          "column": 15
        }
      },
      "20": {
        "start": {
          "line": 78,
          "column": 4
        },
        "end": {
          "line": 78,
          "column": 64
        }
      },
      "21": {
        "start": {
          "line": 80,
          "column": 29
        },
        "end": {
          "line": 88,
          "column": 3
        }
      },
      "22": {
        "start": {
          "line": 81,
          "column": 10
        },
        "end": {
          "line": 81,
          "column": 57
        }
      },
      "23": {
        "start": {
          "line": 81,
          "column": 52
        },
        "end": {
          "line": 81,
          "column": 56
        }
      },
      "24": {
        "start": {
          "line": 85,
          "column": 8
        },
        "end": {
          "line": 85,
          "column": 44
        }
      },
      "25": {
        "start": {
          "line": 89,
          "column": 48
        },
        "end": {
          "line": 89,
          "column": 76
        }
      },
      "26": {
        "start": {
          "line": 91,
          "column": 2
        },
        "end": {
          "line": 91,
          "column": 51
        }
      },
      "27": {
        "start": {
          "line": 92,
          "column": 2
        },
        "end": {
          "line": 182,
          "column": 4
        }
      },
      "28": {
        "start": {
          "line": 114,
          "column": 14
        },
        "end": {
          "line": 114,
          "column": 35
        }
      },
      "29": {
        "start": {
          "line": 115,
          "column": 14
        },
        "end": {
          "line": 115,
          "column": 46
        }
      },
      "30": {
        "start": {
          "line": 122,
          "column": 10
        },
        "end": {
          "line": 122,
          "column": 61
        }
      },
      "31": {
        "start": {
          "line": 155,
          "column": 10
        },
        "end": {
          "line": 155,
          "column": 45
        }
      },
      "32": {
        "start": {
          "line": 156,
          "column": 10
        },
        "end": {
          "line": 156,
          "column": 36
        }
      }
    }
  }
}