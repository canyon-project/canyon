window["components/old-ui/components/page/login/index.tsx"] = {
  "content": "import Icon from \"@ant-design/icons\";\nimport { FC } from \"react\";\n\nimport { EpTopRight } from \"../../../../../assets/icons/EpTopRight.tsx\";\nimport img from \"../../../../../assets/img/img.png\";\nimport { CanyonCardPrimary } from \"../../card\";\nimport LoginBtn from \"./LoginBtn.tsx\";\nimport LoginForm from \"./LoginForm.tsx\";\n\nconst { Title } = Typography;\n\nconst CanyonPageLogin: FC<{\n  onLoginSuccess: () => void;\n  oauthUrl: { gitlab: string };\n  logo: React.ReactNode;\n  register?: string;\n}> = ({ onLoginSuccess, oauthUrl, logo, register }) => {\n  return (\n    <div className={\"w-full relative\"}>\n      <div className={\"m-auto w-[680px] pt-20\"}>\n        <CanyonCardPrimary>\n          <div className={\"flex\"}>\n            <div className={\"bg-blue-950 w-[60px] flex justify-center pt-5\"}>\n              <Title level={2} className={\"\"} style={{ color: \"white\" }}>\n                {logo}\n              </Title>\n            </div>\n\n            <div className={\"bg-white flex-1\"}>\n              <div className={\"px-10 pt-5\"}>\n                <Title level={3}>Log in and continue</Title>\n              </div>\n              <Tabs\n                tabBarExtraContent={\n                  register && (\n                    <div className={\"pr-5\"}>\n                      <a href={register} target={\"_blank\"} rel=\"noreferrer\">\n                        Register\n                        <Icon component={EpTopRight} />\n                      </a>\n                    </div>\n                  )\n                }\n                items={[\n                  {\n                    label: \"Sign In\",\n                    key: \"login\",\n                    children: (\n                      <div className={\"flex px-10 py-5\"}>\n                        <LoginForm onLoginSuccess={onLoginSuccess}></LoginForm>\n                        <Divider\n                          type={\"vertical\"}\n                          style={{ height: \"200px\" }}\n                        />\n                        <LoginBtn oauthUrl={oauthUrl} />\n                      </div>\n                    ),\n                  },\n                ]}\n              />\n            </div>\n          </div>\n        </CanyonCardPrimary>\n      </div>\n\n      <div\n        className={\"absolute top-0 flex flex-wrap h-[100vh] w-full\"}\n        style={{\n          zIndex: \"-100\",\n          backgroundImage: `url(${img})`,\n          backgroundSize: \"20%\",\n          opacity: \".5\",\n        }}\n      ></div>\n    </div>\n  );\n};\n\nexport default CanyonPageLogin;\n",
  "coverage": {
    "path": "components/old-ui/components/page/login/index.tsx",
    "b": {
      "0": [
        0,
        0
      ]
    },
    "f": {
      "0": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 35,
            "column": 18
          },
          "end": {
            "line": 42,
            "column": 19
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 35,
              "column": 18
            },
            "end": {
              "line": 35,
              "column": 26
            }
          },
          {
            "start": {
              "line": 36,
              "column": 20
            },
            "end": {
              "line": 41,
              "column": 26
            }
          }
        ],
        "line": 35
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 17,
            "column": 5
          },
          "end": {
            "line": 17,
            "column": 6
          }
        },
        "loc": {
          "start": {
            "line": 17,
            "column": 55
          },
          "end": {
            "line": 77,
            "column": 1
          }
        },
        "line": 17
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 10,
          "column": 18
        },
        "end": {
          "line": 10,
          "column": 28
        }
      },
      "1": {
        "start": {
          "line": 17,
          "column": 5
        },
        "end": {
          "line": 77,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 18,
          "column": 2
        },
        "end": {
          "line": 76,
          "column": 4
        }
      }
    }
  }
}