window["layouts/genBreadcrumbItems.tsx"] = {
  "content": "import { useTranslation } from \"react-i18next\";\nimport { useNavigate } from \"react-router-dom\";\nfunction matchPattern(str: string) {\n  if (\n    str.includes(\"projects\") &&\n    str.split(\"/\").length === 3 &&\n    ![\"new\"].includes(str.split(\"/\")[2])\n  ) {\n    return true;\n  }\n}\n\nexport function genBreadcrumbItems(pathname: string) {\n  // eslint-disable-next-line react-hooks/rules-of-hooks\n  const { t } = useTranslation();\n  // eslint-disable-next-line react-hooks/rules-of-hooks\n  const nav = useNavigate();\n  if (matchPattern(pathname)) {\n    return [\n      {\n        title: <span className={\"cursor-pointer\"}>{t(\"menus.projects\")}</span>,\n        onClick() {\n          nav(\"/projects\");\n        },\n      },\n      {\n        title: t(\"projects.overview\"),\n      },\n    ];\n  } else if (pathname.includes(\"commits\")) {\n    return [\n      {\n        title: <span className={\"cursor-pointer\"}>{t(\"menus.projects\")}</span>,\n        onClick() {\n          nav(\"/projects\");\n        },\n      },\n      {\n        title: (\n          <span className={\"cursor-pointer\"}>{t(\"projects.overview\")}</span>\n        ),\n        onClick() {\n          const regex = /\\/projects\\/(.+?)\\//;\n          // const regex = /\\/projects\\/(\\d+)\\//;\n          const match = pathname.match(regex);\n          if (match) {\n            const projectId = match[1];\n            nav(`/projects/${projectId}`);\n          } else {\n            console.log(\"未找到匹配的项目ID\");\n          }\n        },\n      },\n      {\n        title: t(\"projects.coverage_details\"),\n        // title: 'Coverage Details',\n      },\n    ];\n  } else if (pathname.includes(\"configure\")) {\n    return [\n      {\n        title: <span className={\"cursor-pointer\"}>{t(\"menus.projects\")}</span>,\n        onClick() {\n          nav(\"/projects\");\n        },\n      },\n      {\n        title: (\n          <span className={\"cursor-pointer\"}>{t(\"projects.overview\")}</span>\n        ),\n        onClick() {\n          const regex = /\\/projects\\/(.+?)\\//;\n          // const regex = /\\/projects\\/(\\d+)\\//;\n          const match = pathname.match(regex);\n          if (match) {\n            const projectId = match[1];\n            nav(`/projects/${projectId}`);\n          } else {\n            console.log(\"未找到匹配的项目ID\");\n          }\n        },\n      },\n      {\n        title: \"项目配置\",\n        // title: 'Coverage Details',\n      },\n    ];\n  } else {\n    return [];\n  }\n}\n",
  "coverage": {
    "path": "layouts/genBreadcrumbItems.tsx",
    "b": {
      "0": [
        29,
        42
      ],
      "1": [
        71,
        52,
        29
      ],
      "2": [
        29,
        42
      ],
      "3": [
        1,
        41
      ],
      "4": [
        0,
        0
      ],
      "5": [
        0,
        41
      ],
      "6": [
        0,
        0
      ]
    },
    "f": {
      "0": 71,
      "1": 71,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    },
    "s": {
      "0": 71,
      "1": 29,
      "2": 71,
      "3": 71,
      "4": 71,
      "5": 29,
      "6": 0,
      "7": 42,
      "8": 1,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 41,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 41
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 4,
            "column": 2
          },
          "end": {
            "line": 10,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 4,
              "column": 2
            },
            "end": {
              "line": 10,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 4
      },
      "1": {
        "loc": {
          "start": {
            "line": 5,
            "column": 4
          },
          "end": {
            "line": 7,
            "column": 40
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 28
            }
          },
          {
            "start": {
              "line": 6,
              "column": 4
            },
            "end": {
              "line": 6,
              "column": 31
            }
          },
          {
            "start": {
              "line": 7,
              "column": 4
            },
            "end": {
              "line": 7,
              "column": 40
            }
          }
        ],
        "line": 5
      },
      "2": {
        "loc": {
          "start": {
            "line": 18,
            "column": 2
          },
          "end": {
            "line": 90,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 18,
              "column": 2
            },
            "end": {
              "line": 90,
              "column": 3
            }
          },
          {
            "start": {
              "line": 30,
              "column": 9
            },
            "end": {
              "line": 90,
              "column": 3
            }
          }
        ],
        "line": 18
      },
      "3": {
        "loc": {
          "start": {
            "line": 30,
            "column": 9
          },
          "end": {
            "line": 90,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 30,
              "column": 9
            },
            "end": {
              "line": 90,
              "column": 3
            }
          },
          {
            "start": {
              "line": 59,
              "column": 9
            },
            "end": {
              "line": 90,
              "column": 3
            }
          }
        ],
        "line": 30
      },
      "4": {
        "loc": {
          "start": {
            "line": 46,
            "column": 10
          },
          "end": {
            "line": 51,
            "column": 11
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 46,
              "column": 10
            },
            "end": {
              "line": 51,
              "column": 11
            }
          },
          {
            "start": {
              "line": 49,
              "column": 17
            },
            "end": {
              "line": 51,
              "column": 11
            }
          }
        ],
        "line": 46
      },
      "5": {
        "loc": {
          "start": {
            "line": 59,
            "column": 9
          },
          "end": {
            "line": 90,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 59,
              "column": 9
            },
            "end": {
              "line": 90,
              "column": 3
            }
          },
          {
            "start": {
              "line": 88,
              "column": 9
            },
            "end": {
              "line": 90,
              "column": 3
            }
          }
        ],
        "line": 59
      },
      "6": {
        "loc": {
          "start": {
            "line": 75,
            "column": 10
          },
          "end": {
            "line": 80,
            "column": 11
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 75,
              "column": 10
            },
            "end": {
              "line": 80,
              "column": 11
            }
          },
          {
            "start": {
              "line": 78,
              "column": 17
            },
            "end": {
              "line": 80,
              "column": 11
            }
          }
        ],
        "line": 75
      }
    },
    "fnMap": {
      "0": {
        "name": "matchPattern",
        "decl": {
          "start": {
            "line": 3,
            "column": 9
          },
          "end": {
            "line": 3,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 3,
            "column": 35
          },
          "end": {
            "line": 11,
            "column": 1
          }
        },
        "line": 3
      },
      "1": {
        "name": "genBreadcrumbItems",
        "decl": {
          "start": {
            "line": 13,
            "column": 16
          },
          "end": {
            "line": 13,
            "column": 34
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 53
          },
          "end": {
            "line": 91,
            "column": 1
          }
        },
        "line": 13
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 22,
            "column": 8
          },
          "end": {
            "line": 22,
            "column": 9
          }
        },
        "loc": {
          "start": {
            "line": 22,
            "column": 18
          },
          "end": {
            "line": 24,
            "column": 9
          }
        },
        "line": 22
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 34,
            "column": 8
          },
          "end": {
            "line": 34,
            "column": 9
          }
        },
        "loc": {
          "start": {
            "line": 34,
            "column": 18
          },
          "end": {
            "line": 36,
            "column": 9
          }
        },
        "line": 34
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 42,
            "column": 8
          },
          "end": {
            "line": 42,
            "column": 9
          }
        },
        "loc": {
          "start": {
            "line": 42,
            "column": 18
          },
          "end": {
            "line": 52,
            "column": 9
          }
        },
        "line": 42
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 63,
            "column": 8
          },
          "end": {
            "line": 63,
            "column": 9
          }
        },
        "loc": {
          "start": {
            "line": 63,
            "column": 18
          },
          "end": {
            "line": 65,
            "column": 9
          }
        },
        "line": 63
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 71,
            "column": 8
          },
          "end": {
            "line": 71,
            "column": 9
          }
        },
        "loc": {
          "start": {
            "line": 71,
            "column": 18
          },
          "end": {
            "line": 81,
            "column": 9
          }
        },
        "line": 71
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 4,
          "column": 2
        },
        "end": {
          "line": 10,
          "column": 3
        }
      },
      "1": {
        "start": {
          "line": 9,
          "column": 4
        },
        "end": {
          "line": 9,
          "column": 16
        }
      },
      "2": {
        "start": {
          "line": 15,
          "column": 16
        },
        "end": {
          "line": 15,
          "column": 32
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
          "column": 2
        },
        "end": {
          "line": 90,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 19,
          "column": 4
        },
        "end": {
          "line": 29,
          "column": 6
        }
      },
      "6": {
        "start": {
          "line": 23,
          "column": 10
        },
        "end": {
          "line": 23,
          "column": 27
        }
      },
      "7": {
        "start": {
          "line": 30,
          "column": 9
        },
        "end": {
          "line": 90,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 31,
          "column": 4
        },
        "end": {
          "line": 58,
          "column": 6
        }
      },
      "9": {
        "start": {
          "line": 35,
          "column": 10
        },
        "end": {
          "line": 35,
          "column": 27
        }
      },
      "10": {
        "start": {
          "line": 43,
          "column": 24
        },
        "end": {
          "line": 43,
          "column": 45
        }
      },
      "11": {
        "start": {
          "line": 45,
          "column": 24
        },
        "end": {
          "line": 45,
          "column": 45
        }
      },
      "12": {
        "start": {
          "line": 46,
          "column": 10
        },
        "end": {
          "line": 51,
          "column": 11
        }
      },
      "13": {
        "start": {
          "line": 47,
          "column": 30
        },
        "end": {
          "line": 47,
          "column": 38
        }
      },
      "14": {
        "start": {
          "line": 48,
          "column": 12
        },
        "end": {
          "line": 48,
          "column": 42
        }
      },
      "15": {
        "start": {
          "line": 50,
          "column": 12
        },
        "end": {
          "line": 50,
          "column": 38
        }
      },
      "16": {
        "start": {
          "line": 59,
          "column": 9
        },
        "end": {
          "line": 90,
          "column": 3
        }
      },
      "17": {
        "start": {
          "line": 60,
          "column": 4
        },
        "end": {
          "line": 87,
          "column": 6
        }
      },
      "18": {
        "start": {
          "line": 64,
          "column": 10
        },
        "end": {
          "line": 64,
          "column": 27
        }
      },
      "19": {
        "start": {
          "line": 72,
          "column": 24
        },
        "end": {
          "line": 72,
          "column": 45
        }
      },
      "20": {
        "start": {
          "line": 74,
          "column": 24
        },
        "end": {
          "line": 74,
          "column": 45
        }
      },
      "21": {
        "start": {
          "line": 75,
          "column": 10
        },
        "end": {
          "line": 80,
          "column": 11
        }
      },
      "22": {
        "start": {
          "line": 76,
          "column": 30
        },
        "end": {
          "line": 76,
          "column": 38
        }
      },
      "23": {
        "start": {
          "line": 77,
          "column": 12
        },
        "end": {
          "line": 77,
          "column": 42
        }
      },
      "24": {
        "start": {
          "line": 79,
          "column": 12
        },
        "end": {
          "line": 79,
          "column": 38
        }
      },
      "25": {
        "start": {
          "line": 89,
          "column": 4
        },
        "end": {
          "line": 89,
          "column": 14
        }
      }
    }
  }
}