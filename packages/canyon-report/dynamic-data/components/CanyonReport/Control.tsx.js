window["components/CanyonReport/Control.tsx"] = {
  "content": "import Icon, { BarsOutlined, SearchOutlined } from \"@ant-design/icons\";\nimport PrepareProdFn from \"@/components/CanyonReport/PrepareProdFn.tsx\";\nimport PhTreeView from \"@/components/CanyonReport/PhTreeView.tsx\";\nimport { Divider, SliderSingleProps } from \"antd\";\nimport { getCOlor } from \"@/helpers/utils/common.ts\";\n\nconst marks: SliderSingleProps[\"marks\"] = {\n  50: {\n    style: {\n      fontSize: \"10px\",\n    },\n    label: <>50</>,\n  },\n  80: {\n    style: {\n      fontSize: \"10px\",\n    },\n    label: <>80</>,\n  },\n};\nfunction returnPositiveNumbers(num) {\n  if (num < 0) {\n    return 0;\n  } else {\n    return num;\n  }\n}\nfunction genBackground(range) {\n  const a = range[0];\n  const b = range[1];\n  return `linear-gradient(to right, ${getCOlor(0)} 0%, ${getCOlor(0)} ${(returnPositiveNumbers(50 - a) * 100) / (b - a)}%, ${getCOlor(60)} ${(returnPositiveNumbers(50 - a) * 100) / (b - a)}%, ${getCOlor(60)} ${(returnPositiveNumbers(80 - a) * 100) / (b - a)}%, ${getCOlor(90)} ${((80 - a) * 100) / (b - a)}%, ${getCOlor(90)} 100%)`;\n}\n\nconst CanyonReportControl = ({\n  numberFiles,\n  onChangeOnlyChange,\n  onChangeOnlyChangeKeywords,\n  keywords,\n  onlyChange,\n  onChangeShowMode,\n  onChangeRange,\n  showMode,\n  range,\n}) => {\n  const { t } = useTranslation();\n  // TODO 暂时不能删除prm\n  const prm = useParams();\n  // const [range, setRange] = useState([0, 100]);\n  return (\n    <>\n      <div className={\"flex mb-2 justify-between items-center\"}>\n        <div className={\"flex gap-2 flex-col\"}>\n          <Space>\n            <Segmented\n              value={showMode}\n              defaultValue={showMode}\n              onChange={(v) => {\n                onChangeShowMode(v);\n              }}\n              options={[\n                {\n                  label: t(\"projects.detail.code.tree\"),\n                  value: \"tree\",\n                  icon: <Icon component={PhTreeView} />,\n                },\n                {\n                  label: t(\"projects.detail.file.list\"),\n                  value: \"list\",\n                  icon: <BarsOutlined />,\n                },\n              ]}\n            />\n\n            <span style={{ fontSize: \"14px\" }}>\n              {/*<span className={'mr-2'}>{numberFiles}</span>*/}\n              {t(\"projects.detail.total.files\", { msg: numberFiles })}\n              {/*覆盖率提升优先级列表*/}\n              {/*转换生产流量为测试用例*/}\n              <PrepareProdFn />\n            </span>\n          </Space>\n        </div>\n\n        <div className={\"flex items-center\"}>\n          <div className={\"flex items-center gap-2\"}>\n            <Typography.Text type={\"secondary\"} style={{ fontSize: \"12px\" }}>\n              {t(\"projects.detail.only.changed\")}:{\" \"}\n            </Typography.Text>\n            <Switch\n              checked={onlyChange}\n              size={\"small\"}\n              onChange={onChangeOnlyChange}\n              // checkedChildren={<HeartFilled />}\n            />\n          </div>\n          <Divider type={\"vertical\"} />\n          <div className={\"flex items-center\"}>\n            <Typography.Text type={\"secondary\"} style={{ fontSize: \"12px\" }}>\n              范围：\n            </Typography.Text>\n            {/*style={{ transform: \"translateY(10px)\" }}*/}\n            <div style={{ height: \"30px\", transform: \"translateY(-2px)\" }}>\n              <Slider\n                className={\"w-[160px]\"}\n                range\n                marks={marks}\n                defaultValue={range}\n                onChange={(va) => {\n                  onChangeRange(va);\n                }}\n                styles={{\n                  rail: {\n                    // background: `linear-gradient(to right, ${getCOlor(0)} 0%, ${getCOlor(0)} 50.00%, ${getCOlor(60)} 50.00%, ${getCOlor(60)} 80.00%, ${getCOlor(100)} 80.00%, ${getCOlor(100)} 100%)`,\n                  },\n                  track: {\n                    background: \"transparent\",\n                    // background: \"#0071c2\",\n                  },\n                  tracks: {\n                    // background: \"#0071c2\",\n                    background: genBackground(range),\n                  },\n                }}\n              />\n            </div>\n          </div>\n          <Divider type={\"vertical\"} />\n          <Input\n            value={keywords}\n            addonBefore={<SearchOutlined />}\n            placeholder={t(\"projects.detail.search.placeholder\")}\n            className={\"w-[240px]\"}\n            size={\"small\"}\n            onChange={onChangeOnlyChangeKeywords}\n          />\n        </div>\n      </div>\n    </>\n  );\n};\n\nexport default CanyonReportControl;\n",
  "coverage": {
    "path": "components/CanyonReport/Control.tsx",
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
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 8,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 22,
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
              "line": 22,
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
        "line": 22
      }
    },
    "fnMap": {
      "0": {
        "name": "returnPositiveNumbers",
        "decl": {
          "start": {
            "line": 21,
            "column": 9
          },
          "end": {
            "line": 21,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 21,
            "column": 36
          },
          "end": {
            "line": 27,
            "column": 1
          }
        },
        "line": 21
      },
      "1": {
        "name": "genBackground",
        "decl": {
          "start": {
            "line": 28,
            "column": 9
          },
          "end": {
            "line": 28,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 28,
            "column": 30
          },
          "end": {
            "line": 32,
            "column": 1
          }
        },
        "line": 28
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 34,
            "column": 28
          },
          "end": {
            "line": 34,
            "column": 29
          }
        },
        "loc": {
          "start": {
            "line": 44,
            "column": 6
          },
          "end": {
            "line": 153,
            "column": 1
          }
        },
        "line": 44
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 57,
            "column": 24
          },
          "end": {
            "line": 57,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 57,
            "column": 31
          },
          "end": {
            "line": 59,
            "column": 15
          }
        },
        "line": 57
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 121,
            "column": 26
          },
          "end": {
            "line": 121,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 121,
            "column": 34
          },
          "end": {
            "line": 123,
            "column": 17
          }
        },
        "line": 121
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 7,
          "column": 42
        },
        "end": {
          "line": 20,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 22,
          "column": 2
        },
        "end": {
          "line": 26,
          "column": 3
        }
      },
      "2": {
        "start": {
          "line": 23,
          "column": 4
        },
        "end": {
          "line": 23,
          "column": 13
        }
      },
      "3": {
        "start": {
          "line": 25,
          "column": 4
        },
        "end": {
          "line": 25,
          "column": 15
        }
      },
      "4": {
        "start": {
          "line": 29,
          "column": 12
        },
        "end": {
          "line": 29,
          "column": 20
        }
      },
      "5": {
        "start": {
          "line": 30,
          "column": 12
        },
        "end": {
          "line": 30,
          "column": 20
        }
      },
      "6": {
        "start": {
          "line": 31,
          "column": 2
        },
        "end": {
          "line": 31,
          "column": 332
        }
      },
      "7": {
        "start": {
          "line": 34,
          "column": 28
        },
        "end": {
          "line": 153,
          "column": 1
        }
      },
      "8": {
        "start": {
          "line": 45,
          "column": 16
        },
        "end": {
          "line": 45,
          "column": 32
        }
      },
      "9": {
        "start": {
          "line": 47,
          "column": 14
        },
        "end": {
          "line": 47,
          "column": 25
        }
      },
      "10": {
        "start": {
          "line": 49,
          "column": 2
        },
        "end": {
          "line": 152,
          "column": 4
        }
      },
      "11": {
        "start": {
          "line": 58,
          "column": 16
        },
        "end": {
          "line": 58,
          "column": 36
        }
      },
      "12": {
        "start": {
          "line": 122,
          "column": 18
        },
        "end": {
          "line": 122,
          "column": 36
        }
      }
    }
  }
}