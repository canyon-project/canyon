window["components/old-ui/components/layout/ScrollBasedLayout.tsx"] = {
  "content": "import { FC, ReactNode, useEffect, useState } from \"react\";\nconst { useToken } = theme;\n\nconst ScrollBasedLayout: FC<{\n  sideBar: ReactNode;\n  mainContent: ReactNode;\n  footer: ReactNode;\n}> = ({ sideBar, mainContent, footer }) => {\n  const { token } = useToken();\n  const [isScrolled, setIsScrolled] = useState(false);\n\n  useEffect(() => {\n    const handleScroll = () => {\n      const scrollY = window.scrollY || document.documentElement.scrollTop;\n      const footer = document.getElementById(\"footer\");\n\n      // 检查滚动是否超过100vh\n      setIsScrolled(scrollY + window.innerHeight > footer.offsetTop);\n    };\n\n    // 添加滚动事件监听器\n    window.addEventListener(\"scroll\", handleScroll);\n\n    setTimeout(() => {\n      document.documentElement.scrollTop += 0.5;\n    }, 1000);\n\n    // 在组件卸载时移除监听器，以防止内存泄漏\n    return () => {\n      window.removeEventListener(\"scroll\", handleScroll);\n    };\n  }, []); // 仅在组件挂载和卸载时运行\n\n  return (\n    <div>\n      <div\n        style={{\n          display: \"flex\",\n          borderBottom: `1px solid ${token.colorBorder}`,\n        }}\n      >\n        <div\n          style={{\n            width: \"260px\",\n            background: \"\",\n            position: `${isScrolled ? \"unset\" : \"fixed\"}`,\n            display: `${!isScrolled ? \"unset\" : \"flex\"}`,\n            flexDirection: \"column\",\n          }}\n        >\n          <div style={{ flex: \"1\" }}></div>\n\n          <div style={{ height: \"100vh\", background: \"\" }}>{sideBar}</div>\n        </div>\n\n        <div\n          style={{\n            flex: \"1\",\n            marginLeft: `${!isScrolled ? \"260px\" : \"0\"}`,\n            minHeight: \"100vh\",\n          }}\n        >\n          {mainContent}\n        </div>\n      </div>\n      <div id={\"footer\"} style={{ height: \"200px\" }}>\n        {footer}\n      </div>\n    </div>\n  );\n};\n\nexport default ScrollBasedLayout;\n",
  "coverage": {
    "path": "components/old-ui/components/layout/ScrollBasedLayout.tsx",
    "b": {
      "0": [
        704,
        5
      ],
      "1": [
        27,
        72
      ],
      "2": [
        72,
        27
      ],
      "3": [
        72,
        27
      ]
    },
    "f": {
      "0": 99,
      "1": 8,
      "2": 704,
      "3": 8,
      "4": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 99,
      "3": 99,
      "4": 99,
      "5": 8,
      "6": 704,
      "7": 704,
      "8": 704,
      "9": 8,
      "10": 8,
      "11": 8,
      "12": 8,
      "13": 0,
      "14": 99
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 14,
            "column": 22
          },
          "end": {
            "line": 14,
            "column": 74
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 14,
              "column": 22
            },
            "end": {
              "line": 14,
              "column": 36
            }
          },
          {
            "start": {
              "line": 14,
              "column": 40
            },
            "end": {
              "line": 14,
              "column": 74
            }
          }
        ],
        "line": 14
      },
      "1": {
        "loc": {
          "start": {
            "line": 46,
            "column": 25
          },
          "end": {
            "line": 46,
            "column": 55
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 46,
              "column": 38
            },
            "end": {
              "line": 46,
              "column": 45
            }
          },
          {
            "start": {
              "line": 46,
              "column": 48
            },
            "end": {
              "line": 46,
              "column": 55
            }
          }
        ],
        "line": 46
      },
      "2": {
        "loc": {
          "start": {
            "line": 47,
            "column": 24
          },
          "end": {
            "line": 47,
            "column": 54
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 47,
              "column": 38
            },
            "end": {
              "line": 47,
              "column": 45
            }
          },
          {
            "start": {
              "line": 47,
              "column": 48
            },
            "end": {
              "line": 47,
              "column": 54
            }
          }
        ],
        "line": 47
      },
      "3": {
        "loc": {
          "start": {
            "line": 59,
            "column": 27
          },
          "end": {
            "line": 59,
            "column": 54
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 59,
              "column": 41
            },
            "end": {
              "line": 59,
              "column": 48
            }
          },
          {
            "start": {
              "line": 59,
              "column": 51
            },
            "end": {
              "line": 59,
              "column": 54
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
            "line": 8,
            "column": 5
          },
          "end": {
            "line": 8,
            "column": 6
          }
        },
        "loc": {
          "start": {
            "line": 8,
            "column": 43
          },
          "end": {
            "line": 71,
            "column": 1
          }
        },
        "line": 8
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 12,
            "column": 12
          },
          "end": {
            "line": 12,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 12,
            "column": 18
          },
          "end": {
            "line": 32,
            "column": 3
          }
        },
        "line": 12
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 13,
            "column": 25
          },
          "end": {
            "line": 13,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 31
          },
          "end": {
            "line": 19,
            "column": 5
          }
        },
        "line": 13
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 24,
            "column": 15
          },
          "end": {
            "line": 24,
            "column": 16
          }
        },
        "loc": {
          "start": {
            "line": 24,
            "column": 21
          },
          "end": {
            "line": 26,
            "column": 5
          }
        },
        "line": 24
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 29,
            "column": 11
          },
          "end": {
            "line": 29,
            "column": 12
          }
        },
        "loc": {
          "start": {
            "line": 29,
            "column": 17
          },
          "end": {
            "line": 31,
            "column": 5
          }
        },
        "line": 29
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 2,
          "column": 21
        },
        "end": {
          "line": 2,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 8,
          "column": 5
        },
        "end": {
          "line": 71,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 9,
          "column": 20
        },
        "end": {
          "line": 9,
          "column": 30
        }
      },
      "3": {
        "start": {
          "line": 10,
          "column": 38
        },
        "end": {
          "line": 10,
          "column": 53
        }
      },
      "4": {
        "start": {
          "line": 12,
          "column": 2
        },
        "end": {
          "line": 32,
          "column": 9
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 25
        },
        "end": {
          "line": 19,
          "column": 5
        }
      },
      "6": {
        "start": {
          "line": 14,
          "column": 22
        },
        "end": {
          "line": 14,
          "column": 74
        }
      },
      "7": {
        "start": {
          "line": 15,
          "column": 21
        },
        "end": {
          "line": 15,
          "column": 54
        }
      },
      "8": {
        "start": {
          "line": 18,
          "column": 6
        },
        "end": {
          "line": 18,
          "column": 69
        }
      },
      "9": {
        "start": {
          "line": 22,
          "column": 4
        },
        "end": {
          "line": 22,
          "column": 52
        }
      },
      "10": {
        "start": {
          "line": 24,
          "column": 4
        },
        "end": {
          "line": 26,
          "column": 13
        }
      },
      "11": {
        "start": {
          "line": 25,
          "column": 6
        },
        "end": {
          "line": 25,
          "column": 48
        }
      },
      "12": {
        "start": {
          "line": 29,
          "column": 4
        },
        "end": {
          "line": 31,
          "column": 6
        }
      },
      "13": {
        "start": {
          "line": 30,
          "column": 6
        },
        "end": {
          "line": 30,
          "column": 57
        }
      },
      "14": {
        "start": {
          "line": 34,
          "column": 2
        },
        "end": {
          "line": 70,
          "column": 4
        }
      }
    }
  }
}