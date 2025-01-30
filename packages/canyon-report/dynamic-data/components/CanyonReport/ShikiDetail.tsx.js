window["components/CanyonReport/ShikiDetail.tsx"] = {
  "content": "import { mergeIntervals } from \"./helper.tsx\";\nimport { createHighlighterCoreInstance } from \"@/components/CanyonReport/loadShiki.ts\";\n\nconst ShikiDetail = ({ defaultValue, filecoverage, theme }) => {\n  const [content, setContent] = useState(\"\");\n\n  const statementStats = filecoverage.s;\n  const statementMeta = filecoverage.statementMap;\n  const structuredText = defaultValue\n    .split(\"\\n\")\n    .reduce((previousValue, currentValue, currentIndex) => {\n      return {\n        ...previousValue,\n        [currentIndex]: currentValue,\n      };\n    }, {});\n  const statementDecorations = [];\n\n  Object.entries(statementStats).forEach(([stName, count]) => {\n    const meta = statementMeta[stName];\n    if (meta) {\n      const type = count > 0 ? \"yes\" : \"no\";\n      const startCol = meta.start.column;\n      let endCol = meta.end.column + 1;\n      const startLine = meta.start.line;\n      const endLine = meta.end.line;\n\n      if (type === \"no\" && structuredText[startLine]) {\n        if (endLine !== startLine) {\n          endCol = structuredText[startLine].length;\n        }\n        //     转化为字符的起始\n\n        let start = 0;\n        let end = 0;\n\n        for (let i = 0; i < startLine - 1; i++) {\n          start += structuredText[i].length + 1;\n        }\n        for (let i = 0; i < endLine - 1; i++) {\n          end += structuredText[i].length + 1;\n        }\n\n        start += startCol;\n        end += endCol;\n        statementDecorations.push([start, end]);\n      }\n    }\n  });\n\n  const fnDecorations = [];\n  const fnStats = filecoverage.f;\n  const fnMeta = filecoverage.fnMap;\n  Object.entries(fnStats).forEach(([fName, count]) => {\n    const meta = fnMeta[fName];\n    if (meta) {\n      const type = count > 0 ? \"yes\" : \"no\";\n      // Some versions of the instrumenter in the wild populate 'func'\n      // but not 'decl':\n      const decl = meta.decl || meta.loc;\n      const startCol = decl.start.column;\n      let endCol = decl.end.column + 1;\n      const startLine = decl.start.line;\n      const endLine = decl.end.line;\n\n      if (type === \"no\" && structuredText[startLine]) {\n        if (endLine !== startLine) {\n          endCol = structuredText[startLine].length;\n        }\n\n        //     转化为字符的起始\n\n        let start = 0;\n        let end = 0;\n\n        for (let i = 0; i < startLine - 1; i++) {\n          start += structuredText[i].length + 1;\n        }\n        for (let i = 0; i < endLine - 1; i++) {\n          end += structuredText[i].length + 1;\n        }\n\n        start += startCol;\n        end += endCol;\n        fnDecorations.push([start, end]);\n      }\n    }\n  });\n\n  useEffect(() => {\n    createHighlighterCoreInstance().then(({ codeToHtml }) => {\n      try {\n        const res = codeToHtml(defaultValue, {\n          lang: \"javascript\",\n          theme: theme === \"light\" ? \"light-plus\" : \"tokyo-night\",\n          decorations: mergeIntervals(\n            [...statementDecorations, ...fnDecorations].filter((item) => {\n              // defaultValue\n              if (item[0] >= item[1]) {\n                return false;\n              } else if (item[1] > defaultValue.length) {\n                return false;\n              } else {\n                return item[0] < item[1];\n              }\n            }),\n          ).map(([start, end]) => {\n            return {\n              start,\n              end,\n              properties: { class: \"content-class-no-found\" },\n            };\n          }),\n        });\n        setContent(res);\n      } catch (err) {\n        console.log(\"覆盖率着色失败\", err);\n        const r = codeToHtml(defaultValue, {\n          lang: \"javascript\",\n          theme: theme === \"light\" ? \"light-plus\" : \"tokyo-night\",\n        });\n\n        setContent(r);\n      }\n    });\n  }, []);\n\n  return (\n    <div className={\"px-[12px] overflow-x-auto w-full\"}>\n      <div dangerouslySetInnerHTML={{ __html: content }}></div>\n    </div>\n  );\n};\n\nexport default ShikiDetail;\n",
  "coverage": {
    "path": "components/CanyonReport/ShikiDetail.tsx",
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
        0
      ],
      "3": [
        0,
        0
      ],
      "4": [
        0,
        0
      ],
      "5": [
        0,
        0
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
        0,
        0
      ],
      "12": [
        0,
        0
      ],
      "13": [
        0,
        0
      ],
      "14": [
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
      "2": 0,
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
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 0,
      "64": 0,
      "65": 0,
      "66": 0,
      "67": 0,
      "68": 0,
      "69": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 21,
            "column": 4
          },
          "end": {
            "line": 48,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 21,
              "column": 4
            },
            "end": {
              "line": 48,
              "column": 5
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
            "line": 22,
            "column": 19
          },
          "end": {
            "line": 22,
            "column": 43
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 22,
              "column": 31
            },
            "end": {
              "line": 22,
              "column": 36
            }
          },
          {
            "start": {
              "line": 22,
              "column": 39
            },
            "end": {
              "line": 22,
              "column": 43
            }
          }
        ],
        "line": 22
      },
      "2": {
        "loc": {
          "start": {
            "line": 28,
            "column": 6
          },
          "end": {
            "line": 47,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 28,
              "column": 6
            },
            "end": {
              "line": 47,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 28
      },
      "3": {
        "loc": {
          "start": {
            "line": 28,
            "column": 10
          },
          "end": {
            "line": 28,
            "column": 52
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 28,
              "column": 10
            },
            "end": {
              "line": 28,
              "column": 23
            }
          },
          {
            "start": {
              "line": 28,
              "column": 27
            },
            "end": {
              "line": 28,
              "column": 52
            }
          }
        ],
        "line": 28
      },
      "4": {
        "loc": {
          "start": {
            "line": 29,
            "column": 8
          },
          "end": {
            "line": 31,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 29,
              "column": 8
            },
            "end": {
              "line": 31,
              "column": 9
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 29
      },
      "5": {
        "loc": {
          "start": {
            "line": 56,
            "column": 4
          },
          "end": {
            "line": 87,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 56,
              "column": 4
            },
            "end": {
              "line": 87,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 56
      },
      "6": {
        "loc": {
          "start": {
            "line": 57,
            "column": 19
          },
          "end": {
            "line": 57,
            "column": 43
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 57,
              "column": 31
            },
            "end": {
              "line": 57,
              "column": 36
            }
          },
          {
            "start": {
              "line": 57,
              "column": 39
            },
            "end": {
              "line": 57,
              "column": 43
            }
          }
        ],
        "line": 57
      },
      "7": {
        "loc": {
          "start": {
            "line": 60,
            "column": 19
          },
          "end": {
            "line": 60,
            "column": 40
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 60,
              "column": 19
            },
            "end": {
              "line": 60,
              "column": 28
            }
          },
          {
            "start": {
              "line": 60,
              "column": 32
            },
            "end": {
              "line": 60,
              "column": 40
            }
          }
        ],
        "line": 60
      },
      "8": {
        "loc": {
          "start": {
            "line": 66,
            "column": 6
          },
          "end": {
            "line": 86,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 66,
              "column": 6
            },
            "end": {
              "line": 86,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 66
      },
      "9": {
        "loc": {
          "start": {
            "line": 66,
            "column": 10
          },
          "end": {
            "line": 66,
            "column": 52
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 66,
              "column": 10
            },
            "end": {
              "line": 66,
              "column": 23
            }
          },
          {
            "start": {
              "line": 66,
              "column": 27
            },
            "end": {
              "line": 66,
              "column": 52
            }
          }
        ],
        "line": 66
      },
      "10": {
        "loc": {
          "start": {
            "line": 67,
            "column": 8
          },
          "end": {
            "line": 69,
            "column": 9
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 67,
              "column": 8
            },
            "end": {
              "line": 69,
              "column": 9
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 67
      },
      "11": {
        "loc": {
          "start": {
            "line": 95,
            "column": 17
          },
          "end": {
            "line": 95,
            "column": 65
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 95,
              "column": 37
            },
            "end": {
              "line": 95,
              "column": 49
            }
          },
          {
            "start": {
              "line": 95,
              "column": 52
            },
            "end": {
              "line": 95,
              "column": 65
            }
          }
        ],
        "line": 95
      },
      "12": {
        "loc": {
          "start": {
            "line": 99,
            "column": 14
          },
          "end": {
            "line": 105,
            "column": 15
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 99,
              "column": 14
            },
            "end": {
              "line": 105,
              "column": 15
            }
          },
          {
            "start": {
              "line": 101,
              "column": 21
            },
            "end": {
              "line": 105,
              "column": 15
            }
          }
        ],
        "line": 99
      },
      "13": {
        "loc": {
          "start": {
            "line": 101,
            "column": 21
          },
          "end": {
            "line": 105,
            "column": 15
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 101,
              "column": 21
            },
            "end": {
              "line": 105,
              "column": 15
            }
          },
          {
            "start": {
              "line": 103,
              "column": 21
            },
            "end": {
              "line": 105,
              "column": 15
            }
          }
        ],
        "line": 101
      },
      "14": {
        "loc": {
          "start": {
            "line": 120,
            "column": 17
          },
          "end": {
            "line": 120,
            "column": 65
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 120,
              "column": 37
            },
            "end": {
              "line": 120,
              "column": 49
            }
          },
          {
            "start": {
              "line": 120,
              "column": 52
            },
            "end": {
              "line": 120,
              "column": 65
            }
          }
        ],
        "line": 120
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 4,
            "column": 20
          },
          "end": {
            "line": 4,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 4,
            "column": 63
          },
          "end": {
            "line": 133,
            "column": 1
          }
        },
        "line": 4
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 11,
            "column": 12
          },
          "end": {
            "line": 11,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 11,
            "column": 59
          },
          "end": {
            "line": 16,
            "column": 5
          }
        },
        "line": 11
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 19,
            "column": 41
          },
          "end": {
            "line": 19,
            "column": 42
          }
        },
        "loc": {
          "start": {
            "line": 19,
            "column": 62
          },
          "end": {
            "line": 49,
            "column": 3
          }
        },
        "line": 19
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 54,
            "column": 34
          },
          "end": {
            "line": 54,
            "column": 35
          }
        },
        "loc": {
          "start": {
            "line": 54,
            "column": 54
          },
          "end": {
            "line": 88,
            "column": 3
          }
        },
        "line": 54
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 90,
            "column": 12
          },
          "end": {
            "line": 90,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 90,
            "column": 18
          },
          "end": {
            "line": 126,
            "column": 3
          }
        },
        "line": 90
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 91,
            "column": 41
          },
          "end": {
            "line": 91,
            "column": 42
          }
        },
        "loc": {
          "start": {
            "line": 91,
            "column": 61
          },
          "end": {
            "line": 125,
            "column": 5
          }
        },
        "line": 91
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 97,
            "column": 63
          },
          "end": {
            "line": 97,
            "column": 64
          }
        },
        "loc": {
          "start": {
            "line": 97,
            "column": 73
          },
          "end": {
            "line": 106,
            "column": 13
          }
        },
        "line": 97
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 107,
            "column": 16
          },
          "end": {
            "line": 107,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 107,
            "column": 34
          },
          "end": {
            "line": 113,
            "column": 11
          }
        },
        "line": 107
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 4,
          "column": 20
        },
        "end": {
          "line": 133,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 5,
          "column": 32
        },
        "end": {
          "line": 5,
          "column": 44
        }
      },
      "2": {
        "start": {
          "line": 7,
          "column": 25
        },
        "end": {
          "line": 7,
          "column": 39
        }
      },
      "3": {
        "start": {
          "line": 8,
          "column": 24
        },
        "end": {
          "line": 8,
          "column": 49
        }
      },
      "4": {
        "start": {
          "line": 9,
          "column": 25
        },
        "end": {
          "line": 16,
          "column": 10
        }
      },
      "5": {
        "start": {
          "line": 12,
          "column": 6
        },
        "end": {
          "line": 15,
          "column": 8
        }
      },
      "6": {
        "start": {
          "line": 17,
          "column": 31
        },
        "end": {
          "line": 17,
          "column": 33
        }
      },
      "7": {
        "start": {
          "line": 19,
          "column": 2
        },
        "end": {
          "line": 49,
          "column": 5
        }
      },
      "8": {
        "start": {
          "line": 20,
          "column": 17
        },
        "end": {
          "line": 20,
          "column": 38
        }
      },
      "9": {
        "start": {
          "line": 21,
          "column": 4
        },
        "end": {
          "line": 48,
          "column": 5
        }
      },
      "10": {
        "start": {
          "line": 22,
          "column": 19
        },
        "end": {
          "line": 22,
          "column": 43
        }
      },
      "11": {
        "start": {
          "line": 23,
          "column": 23
        },
        "end": {
          "line": 23,
          "column": 40
        }
      },
      "12": {
        "start": {
          "line": 24,
          "column": 19
        },
        "end": {
          "line": 24,
          "column": 38
        }
      },
      "13": {
        "start": {
          "line": 25,
          "column": 24
        },
        "end": {
          "line": 25,
          "column": 39
        }
      },
      "14": {
        "start": {
          "line": 26,
          "column": 22
        },
        "end": {
          "line": 26,
          "column": 35
        }
      },
      "15": {
        "start": {
          "line": 28,
          "column": 6
        },
        "end": {
          "line": 47,
          "column": 7
        }
      },
      "16": {
        "start": {
          "line": 29,
          "column": 8
        },
        "end": {
          "line": 31,
          "column": 9
        }
      },
      "17": {
        "start": {
          "line": 30,
          "column": 10
        },
        "end": {
          "line": 30,
          "column": 52
        }
      },
      "18": {
        "start": {
          "line": 34,
          "column": 20
        },
        "end": {
          "line": 34,
          "column": 21
        }
      },
      "19": {
        "start": {
          "line": 35,
          "column": 18
        },
        "end": {
          "line": 35,
          "column": 19
        }
      },
      "20": {
        "start": {
          "line": 37,
          "column": 8
        },
        "end": {
          "line": 39,
          "column": 9
        }
      },
      "21": {
        "start": {
          "line": 37,
          "column": 21
        },
        "end": {
          "line": 37,
          "column": 22
        }
      },
      "22": {
        "start": {
          "line": 38,
          "column": 10
        },
        "end": {
          "line": 38,
          "column": 48
        }
      },
      "23": {
        "start": {
          "line": 40,
          "column": 8
        },
        "end": {
          "line": 42,
          "column": 9
        }
      },
      "24": {
        "start": {
          "line": 40,
          "column": 21
        },
        "end": {
          "line": 40,
          "column": 22
        }
      },
      "25": {
        "start": {
          "line": 41,
          "column": 10
        },
        "end": {
          "line": 41,
          "column": 46
        }
      },
      "26": {
        "start": {
          "line": 44,
          "column": 8
        },
        "end": {
          "line": 44,
          "column": 26
        }
      },
      "27": {
        "start": {
          "line": 45,
          "column": 8
        },
        "end": {
          "line": 45,
          "column": 22
        }
      },
      "28": {
        "start": {
          "line": 46,
          "column": 8
        },
        "end": {
          "line": 46,
          "column": 48
        }
      },
      "29": {
        "start": {
          "line": 51,
          "column": 24
        },
        "end": {
          "line": 51,
          "column": 26
        }
      },
      "30": {
        "start": {
          "line": 52,
          "column": 18
        },
        "end": {
          "line": 52,
          "column": 32
        }
      },
      "31": {
        "start": {
          "line": 53,
          "column": 17
        },
        "end": {
          "line": 53,
          "column": 35
        }
      },
      "32": {
        "start": {
          "line": 54,
          "column": 2
        },
        "end": {
          "line": 88,
          "column": 5
        }
      },
      "33": {
        "start": {
          "line": 55,
          "column": 17
        },
        "end": {
          "line": 55,
          "column": 30
        }
      },
      "34": {
        "start": {
          "line": 56,
          "column": 4
        },
        "end": {
          "line": 87,
          "column": 5
        }
      },
      "35": {
        "start": {
          "line": 57,
          "column": 19
        },
        "end": {
          "line": 57,
          "column": 43
        }
      },
      "36": {
        "start": {
          "line": 60,
          "column": 19
        },
        "end": {
          "line": 60,
          "column": 40
        }
      },
      "37": {
        "start": {
          "line": 61,
          "column": 23
        },
        "end": {
          "line": 61,
          "column": 40
        }
      },
      "38": {
        "start": {
          "line": 62,
          "column": 19
        },
        "end": {
          "line": 62,
          "column": 38
        }
      },
      "39": {
        "start": {
          "line": 63,
          "column": 24
        },
        "end": {
          "line": 63,
          "column": 39
        }
      },
      "40": {
        "start": {
          "line": 64,
          "column": 22
        },
        "end": {
          "line": 64,
          "column": 35
        }
      },
      "41": {
        "start": {
          "line": 66,
          "column": 6
        },
        "end": {
          "line": 86,
          "column": 7
        }
      },
      "42": {
        "start": {
          "line": 67,
          "column": 8
        },
        "end": {
          "line": 69,
          "column": 9
        }
      },
      "43": {
        "start": {
          "line": 68,
          "column": 10
        },
        "end": {
          "line": 68,
          "column": 52
        }
      },
      "44": {
        "start": {
          "line": 73,
          "column": 20
        },
        "end": {
          "line": 73,
          "column": 21
        }
      },
      "45": {
        "start": {
          "line": 74,
          "column": 18
        },
        "end": {
          "line": 74,
          "column": 19
        }
      },
      "46": {
        "start": {
          "line": 76,
          "column": 8
        },
        "end": {
          "line": 78,
          "column": 9
        }
      },
      "47": {
        "start": {
          "line": 76,
          "column": 21
        },
        "end": {
          "line": 76,
          "column": 22
        }
      },
      "48": {
        "start": {
          "line": 77,
          "column": 10
        },
        "end": {
          "line": 77,
          "column": 48
        }
      },
      "49": {
        "start": {
          "line": 79,
          "column": 8
        },
        "end": {
          "line": 81,
          "column": 9
        }
      },
      "50": {
        "start": {
          "line": 79,
          "column": 21
        },
        "end": {
          "line": 79,
          "column": 22
        }
      },
      "51": {
        "start": {
          "line": 80,
          "column": 10
        },
        "end": {
          "line": 80,
          "column": 46
        }
      },
      "52": {
        "start": {
          "line": 83,
          "column": 8
        },
        "end": {
          "line": 83,
          "column": 26
        }
      },
      "53": {
        "start": {
          "line": 84,
          "column": 8
        },
        "end": {
          "line": 84,
          "column": 22
        }
      },
      "54": {
        "start": {
          "line": 85,
          "column": 8
        },
        "end": {
          "line": 85,
          "column": 41
        }
      },
      "55": {
        "start": {
          "line": 90,
          "column": 2
        },
        "end": {
          "line": 126,
          "column": 9
        }
      },
      "56": {
        "start": {
          "line": 91,
          "column": 4
        },
        "end": {
          "line": 125,
          "column": 7
        }
      },
      "57": {
        "start": {
          "line": 92,
          "column": 6
        },
        "end": {
          "line": 124,
          "column": 7
        }
      },
      "58": {
        "start": {
          "line": 93,
          "column": 20
        },
        "end": {
          "line": 114,
          "column": 10
        }
      },
      "59": {
        "start": {
          "line": 99,
          "column": 14
        },
        "end": {
          "line": 105,
          "column": 15
        }
      },
      "60": {
        "start": {
          "line": 100,
          "column": 16
        },
        "end": {
          "line": 100,
          "column": 29
        }
      },
      "61": {
        "start": {
          "line": 101,
          "column": 21
        },
        "end": {
          "line": 105,
          "column": 15
        }
      },
      "62": {
        "start": {
          "line": 102,
          "column": 16
        },
        "end": {
          "line": 102,
          "column": 29
        }
      },
      "63": {
        "start": {
          "line": 104,
          "column": 16
        },
        "end": {
          "line": 104,
          "column": 41
        }
      },
      "64": {
        "start": {
          "line": 108,
          "column": 12
        },
        "end": {
          "line": 112,
          "column": 14
        }
      },
      "65": {
        "start": {
          "line": 115,
          "column": 8
        },
        "end": {
          "line": 115,
          "column": 24
        }
      },
      "66": {
        "start": {
          "line": 117,
          "column": 8
        },
        "end": {
          "line": 117,
          "column": 36
        }
      },
      "67": {
        "start": {
          "line": 118,
          "column": 18
        },
        "end": {
          "line": 121,
          "column": 10
        }
      },
      "68": {
        "start": {
          "line": 123,
          "column": 8
        },
        "end": {
          "line": 123,
          "column": 22
        }
      },
      "69": {
        "start": {
          "line": 128,
          "column": 2
        },
        "end": {
          "line": 132,
          "column": 4
        }
      }
    }
  }
}