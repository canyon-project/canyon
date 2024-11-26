window["pages/index/projects/[id]/commits/[sha].tsx"] = {
  "content": "import { useQuery } from \"@apollo/client\";\nimport { useRequest } from \"ahooks\";\nimport {\n  useLocation,\n  useNavigate,\n  useParams,\n  useSearchParams,\n} from \"react-router-dom\";\n\nimport CanyonReport from \"../../../../../components/CanyonReport\";\nimport { GetProjectByIdDocument } from \"../../../../../helpers/backend/gen/graphql.ts\";\nimport { getCoverageSummaryMapService, handleSelectFile } from \"./helper\";\nconst { useToken } = theme;\n\nconst Sha = () => {\n  const prm = useParams();\n  const nav = useNavigate();\n  const [sprm] = useSearchParams();\n  // 在组件中\n  const location = useLocation();\n  const currentPathname = location.pathname;\n  const { data: getProjectByIdDocumentData } = useQuery(\n    GetProjectByIdDocument,\n    {\n      variables: {\n        projectID: prm[\"id\"] as string,\n      },\n    },\n  );\n  const pathWithNamespace =\n    getProjectByIdDocumentData?.getProjectByID.pathWithNamespace.split(\"/\")[1];\n  const { token } = useToken();\n\n  const { data: coverageSummaryMapData, loading } = useRequest(\n    () =>\n      getCoverageSummaryMapService({\n        projectID: prm.id as string,\n        reportID: sprm.get(\"report_id\"),\n        sha: prm.sha,\n      }),\n    {\n      onSuccess() {},\n    },\n  );\n\n  const [activatedPath, setActivatedPath] = useState(sprm.get(\"path\") || \"\");\n  const [mainData, setMainData] = useState<any>(false);\n\n  useEffect(() => {\n    const params = new URLSearchParams();\n    if (sprm.get(\"report_id\")) {\n      params.append(\"report_id\", sprm.get(\"report_id\") || \"\");\n    }\n    if (sprm.get(\"mode\")) {\n      params.append(\"mode\", sprm.get(\"mode\") || \"\");\n    }\n    params.append(\"path\", activatedPath);\n\n    // 将参数拼接到路径中\n    const pathWithParams = `${currentPathname}?${params.toString()}${location.hash}`;\n\n    nav(pathWithParams);\n\n    if (activatedPath.includes(\".\")) {\n      handleSelectFile({\n        filepath: activatedPath,\n        reportID: sprm.get(\"report_id\") || \"\",\n        sha: prm.sha || \"\",\n        projectID: prm.id || \"\",\n        mode: sprm.get(\"mode\") || \"\",\n      }).then((r) => {\n        if (r.fileCoverage) {\n          // console.log(r)\n          setMainData(r);\n        } else {\n          setMainData(false);\n        }\n      });\n    } else {\n      // console.log('设么也不做');\n      setMainData(false);\n    }\n  }, [activatedPath]);\n\n  return (\n    <>\n      <div\n        className=\"p-2 rounded-md bg-white dark:bg-[#151718] flex \"\n        style={{\n          boxShadow: `${token.boxShadowTertiary}`,\n          display: \"none\",\n        }}\n      >\n        <div>\n          <div>Ant Design Title 1</div>\n          <div>\n            sign, a design language for background applications, is refined by\n          </div>\n        </div>\n        <Divider type={\"vertical\"} style={{ height: \"60px\" }} />\n        <div>\n          <div>Ant Design Title 1</div>\n          <div>\n            sign, a design language for background applications, is refined by\n          </div>\n        </div>\n        <Divider type={\"vertical\"} style={{ height: \"60px\" }} />\n        <div>\n          <div>Ant Design Title 1</div>\n          <div>\n            sign, a design language for background applications, is refined by\n          </div>\n        </div>\n      </div>\n      <div className={\"h-[10px]\"}></div>\n      <div\n        className=\"p-2 rounded-md bg-white dark:bg-[#151718]\"\n        style={{\n          // border: `1px solid ${token.colorBorder}`,\n          boxShadow: `${token.boxShadowTertiary}`,\n        }}\n      >\n        <>\n          {getProjectByIdDocumentData?.getProjectByID.language ===\n            \"JavaScript\" && (\n            <CanyonReport\n              theme={localStorage.getItem(\"theme\") || \"light\"}\n              mainData={mainData}\n              pathWithNamespace={pathWithNamespace}\n              activatedPath={activatedPath}\n              coverageSummaryMapData={coverageSummaryMapData || []}\n              loading={loading}\n              onSelect={(v: any) => {\n                setActivatedPath(v.path);\n              }}\n            />\n          )}\n        </>\n      </div>\n    </>\n  );\n};\n\nexport default Sha;\n",
  "coverage": {
    "path": "pages/index/projects/[id]/commits/[sha].tsx",
    "b": {
      "0": [
        1,
        1
      ],
      "1": [
        0,
        1
      ],
      "2": [
        0,
        0
      ],
      "3": [
        0,
        1
      ],
      "4": [
        0,
        0
      ],
      "5": [
        0,
        1
      ],
      "6": [
        0,
        0
      ],
      "7": [
        0,
        0
      ],
      "8": [
        0,
        0
      ],
      "9": [
        0,
        0
      ],
      "10": [
        0,
        0
      ],
      "11": [
        1,
        0
      ],
      "12": [
        0,
        0
      ],
      "13": [
        0,
        0
      ]
    },
    "f": {
      "0": 1,
      "1": 1,
      "2": 0,
      "3": 1,
      "4": 0,
      "5": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 1,
      "3": 1,
      "4": 1,
      "5": 1,
      "6": 1,
      "7": 1,
      "8": 1,
      "9": 1,
      "10": 1,
      "11": 1,
      "12": 1,
      "13": 1,
      "14": 1,
      "15": 1,
      "16": 1,
      "17": 0,
      "18": 1,
      "19": 0,
      "20": 1,
      "21": 1,
      "22": 1,
      "23": 1,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 1,
      "29": 1,
      "30": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 46,
            "column": 53
          },
          "end": {
            "line": 46,
            "column": 75
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 46,
              "column": 53
            },
            "end": {
              "line": 46,
              "column": 69
            }
          },
          {
            "start": {
              "line": 46,
              "column": 73
            },
            "end": {
              "line": 46,
              "column": 75
            }
          }
        ],
        "line": 46
      },
      "1": {
        "loc": {
          "start": {
            "line": 51,
            "column": 4
          },
          "end": {
            "line": 53,
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
              "line": 53,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 51
      },
      "2": {
        "loc": {
          "start": {
            "line": 52,
            "column": 33
          },
          "end": {
            "line": 52,
            "column": 60
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 52,
              "column": 33
            },
            "end": {
              "line": 52,
              "column": 54
            }
          },
          {
            "start": {
              "line": 52,
              "column": 58
            },
            "end": {
              "line": 52,
              "column": 60
            }
          }
        ],
        "line": 52
      },
      "3": {
        "loc": {
          "start": {
            "line": 54,
            "column": 4
          },
          "end": {
            "line": 56,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 54,
              "column": 4
            },
            "end": {
              "line": 56,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 54
      },
      "4": {
        "loc": {
          "start": {
            "line": 55,
            "column": 28
          },
          "end": {
            "line": 55,
            "column": 50
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 55,
              "column": 28
            },
            "end": {
              "line": 55,
              "column": 44
            }
          },
          {
            "start": {
              "line": 55,
              "column": 48
            },
            "end": {
              "line": 55,
              "column": 50
            }
          }
        ],
        "line": 55
      },
      "5": {
        "loc": {
          "start": {
            "line": 64,
            "column": 4
          },
          "end": {
            "line": 82,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 64,
              "column": 4
            },
            "end": {
              "line": 82,
              "column": 5
            }
          },
          {
            "start": {
              "line": 79,
              "column": 11
            },
            "end": {
              "line": 82,
              "column": 5
            }
          }
        ],
        "line": 64
      },
      "6": {
        "loc": {
          "start": {
            "line": 67,
            "column": 18
          },
          "end": {
            "line": 67,
            "column": 45
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 67,
              "column": 18
            },
            "end": {
              "line": 67,
              "column": 39
            }
          },
          {
            "start": {
              "line": 67,
              "column": 43
            },
            "end": {
              "line": 67,
              "column": 45
            }
          }
        ],
        "line": 67
      },
      "7": {
        "loc": {
          "start": {
            "line": 68,
            "column": 13
          },
          "end": {
            "line": 68,
            "column": 26
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 68,
              "column": 13
            },
            "end": {
              "line": 68,
              "column": 20
            }
          },
          {
            "start": {
              "line": 68,
              "column": 24
            },
            "end": {
              "line": 68,
              "column": 26
            }
          }
        ],
        "line": 68
      },
      "8": {
        "loc": {
          "start": {
            "line": 69,
            "column": 19
          },
          "end": {
            "line": 69,
            "column": 31
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 69,
              "column": 19
            },
            "end": {
              "line": 69,
              "column": 25
            }
          },
          {
            "start": {
              "line": 69,
              "column": 29
            },
            "end": {
              "line": 69,
              "column": 31
            }
          }
        ],
        "line": 69
      },
      "9": {
        "loc": {
          "start": {
            "line": 70,
            "column": 14
          },
          "end": {
            "line": 70,
            "column": 36
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 70,
              "column": 14
            },
            "end": {
              "line": 70,
              "column": 30
            }
          },
          {
            "start": {
              "line": 70,
              "column": 34
            },
            "end": {
              "line": 70,
              "column": 36
            }
          }
        ],
        "line": 70
      },
      "10": {
        "loc": {
          "start": {
            "line": 72,
            "column": 8
          },
          "end": {
            "line": 77,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 72,
              "column": 8
            },
            "end": {
              "line": 77,
              "column": 9
            }
          },
          {
            "start": {
              "line": 75,
              "column": 15
            },
            "end": {
              "line": 77,
              "column": 9
            }
          }
        ],
        "line": 72
      },
      "11": {
        "loc": {
          "start": {
            "line": 124,
            "column": 11
          },
          "end": {
            "line": 137,
            "column": 11
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 124,
              "column": 11
            },
            "end": {
              "line": 125,
              "column": 24
            }
          },
          {
            "start": {
              "line": 126,
              "column": 12
            },
            "end": {
              "line": 136,
              "column": 14
            }
          }
        ],
        "line": 124
      },
      "12": {
        "loc": {
          "start": {
            "line": 127,
            "column": 21
          },
          "end": {
            "line": 127,
            "column": 61
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 127,
              "column": 21
            },
            "end": {
              "line": 127,
              "column": 50
            }
          },
          {
            "start": {
              "line": 127,
              "column": 54
            },
            "end": {
              "line": 127,
              "column": 61
            }
          }
        ],
        "line": 127
      },
      "13": {
        "loc": {
          "start": {
            "line": 131,
            "column": 38
          },
          "end": {
            "line": 131,
            "column": 66
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 131,
              "column": 38
            },
            "end": {
              "line": 131,
              "column": 60
            }
          },
          {
            "start": {
              "line": 131,
              "column": 64
            },
            "end": {
              "line": 131,
              "column": 66
            }
          }
        ],
        "line": 131
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 15,
            "column": 12
          },
          "end": {
            "line": 15,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 18
          },
          "end": {
            "line": 142,
            "column": 1
          }
        },
        "line": 15
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 35,
            "column": 4
          },
          "end": {
            "line": 35,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 36,
            "column": 6
          },
          "end": {
            "line": 40,
            "column": 8
          }
        },
        "line": 36
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 42,
            "column": 6
          },
          "end": {
            "line": 42,
            "column": 7
          }
        },
        "loc": {
          "start": {
            "line": 42,
            "column": 18
          },
          "end": {
            "line": 42,
            "column": 20
          }
        },
        "line": 42
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 49,
            "column": 12
          },
          "end": {
            "line": 49,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 49,
            "column": 18
          },
          "end": {
            "line": 83,
            "column": 3
          }
        },
        "line": 49
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 71,
            "column": 14
          },
          "end": {
            "line": 71,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 71,
            "column": 21
          },
          "end": {
            "line": 78,
            "column": 7
          }
        },
        "line": 71
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 133,
            "column": 24
          },
          "end": {
            "line": 133,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 133,
            "column": 36
          },
          "end": {
            "line": 135,
            "column": 15
          }
        },
        "line": 133
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 13,
          "column": 21
        },
        "end": {
          "line": 13,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 15,
          "column": 12
        },
        "end": {
          "line": 142,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 16,
          "column": 14
        },
        "end": {
          "line": 16,
          "column": 25
        }
      },
      "3": {
        "start": {
          "line": 17,
          "column": 14
        },
        "end": {
          "line": 17,
          "column": 27
        }
      },
      "4": {
        "start": {
          "line": 18,
          "column": 17
        },
        "end": {
          "line": 18,
          "column": 34
        }
      },
      "5": {
        "start": {
          "line": 20,
          "column": 19
        },
        "end": {
          "line": 20,
          "column": 32
        }
      },
      "6": {
        "start": {
          "line": 21,
          "column": 26
        },
        "end": {
          "line": 21,
          "column": 43
        }
      },
      "7": {
        "start": {
          "line": 22,
          "column": 47
        },
        "end": {
          "line": 29,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 31,
          "column": 4
        },
        "end": {
          "line": 31,
          "column": 78
        }
      },
      "9": {
        "start": {
          "line": 32,
          "column": 20
        },
        "end": {
          "line": 32,
          "column": 30
        }
      },
      "10": {
        "start": {
          "line": 34,
          "column": 52
        },
        "end": {
          "line": 44,
          "column": 3
        }
      },
      "11": {
        "start": {
          "line": 36,
          "column": 6
        },
        "end": {
          "line": 40,
          "column": 8
        }
      },
      "12": {
        "start": {
          "line": 46,
          "column": 44
        },
        "end": {
          "line": 46,
          "column": 76
        }
      },
      "13": {
        "start": {
          "line": 47,
          "column": 34
        },
        "end": {
          "line": 47,
          "column": 54
        }
      },
      "14": {
        "start": {
          "line": 49,
          "column": 2
        },
        "end": {
          "line": 83,
          "column": 22
        }
      },
      "15": {
        "start": {
          "line": 50,
          "column": 19
        },
        "end": {
          "line": 50,
          "column": 40
        }
      },
      "16": {
        "start": {
          "line": 51,
          "column": 4
        },
        "end": {
          "line": 53,
          "column": 5
        }
      },
      "17": {
        "start": {
          "line": 52,
          "column": 6
        },
        "end": {
          "line": 52,
          "column": 62
        }
      },
      "18": {
        "start": {
          "line": 54,
          "column": 4
        },
        "end": {
          "line": 56,
          "column": 5
        }
      },
      "19": {
        "start": {
          "line": 55,
          "column": 6
        },
        "end": {
          "line": 55,
          "column": 52
        }
      },
      "20": {
        "start": {
          "line": 57,
          "column": 4
        },
        "end": {
          "line": 57,
          "column": 41
        }
      },
      "21": {
        "start": {
          "line": 60,
          "column": 27
        },
        "end": {
          "line": 60,
          "column": 84
        }
      },
      "22": {
        "start": {
          "line": 62,
          "column": 4
        },
        "end": {
          "line": 62,
          "column": 24
        }
      },
      "23": {
        "start": {
          "line": 64,
          "column": 4
        },
        "end": {
          "line": 82,
          "column": 5
        }
      },
      "24": {
        "start": {
          "line": 65,
          "column": 6
        },
        "end": {
          "line": 78,
          "column": 9
        }
      },
      "25": {
        "start": {
          "line": 72,
          "column": 8
        },
        "end": {
          "line": 77,
          "column": 9
        }
      },
      "26": {
        "start": {
          "line": 74,
          "column": 10
        },
        "end": {
          "line": 74,
          "column": 25
        }
      },
      "27": {
        "start": {
          "line": 76,
          "column": 10
        },
        "end": {
          "line": 76,
          "column": 29
        }
      },
      "28": {
        "start": {
          "line": 81,
          "column": 6
        },
        "end": {
          "line": 81,
          "column": 25
        }
      },
      "29": {
        "start": {
          "line": 85,
          "column": 2
        },
        "end": {
          "line": 141,
          "column": 4
        }
      },
      "30": {
        "start": {
          "line": 134,
          "column": 16
        },
        "end": {
          "line": 134,
          "column": 41
        }
      }
    }
  }
}