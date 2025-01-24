window["components/app/CopyCode.tsx"] = {
  "content": "import \"./CopyCode.css\";\n\nimport { CopyOutlined } from \"@ant-design/icons\";\nimport { FC, useEffect } from \"react\";\n// @ts-ignore\nimport { CopyToClipboard } from \"react-copy-to-clipboard\";\nimport { createHighlighterCoreInstance } from \"@/components/CanyonReport/loadShiki.ts\";\n\nconst CopyCode: FC<{ code: string }> = ({ code }) => {\n  const fileContent = code;\n  const [content, setContent] = useState(\"\");\n\n  useEffect(() => {\n    if (fileContent) {\n      createHighlighterCoreInstance().then(({ codeToHtml }) => {\n        const html = codeToHtml(fileContent, {\n          lang: \"json\",\n          theme: \"tokyo-night\",\n        });\n        setContent(html);\n      });\n    }\n  }, [fileContent]);\n  return (\n    <div className={\"relative copy-code\"}>\n      <div className={\"absolute right-[10px] top-[10px]\"}>\n        <CopyToClipboard text={code}>\n          <Button\n            type={\"link\"}\n            className={\"btn hidden\"}\n            icon={<CopyOutlined />}\n          />\n        </CopyToClipboard>\n      </div>\n\n      <div className={\"p-2 bg-[#1a1b26] rounded-lg pb-[1px]\"}>\n        <div dangerouslySetInnerHTML={{ __html: content }} />\n      </div>\n    </div>\n  );\n};\n\nexport default CopyCode;\n",
  "coverage": {
    "path": "components/app/CopyCode.tsx",
    "b": {
      "0": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0
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
      "8": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 14,
            "column": 4
          },
          "end": {
            "line": 22,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 14,
              "column": 4
            },
            "end": {
              "line": 22,
              "column": 5
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 14
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 9,
            "column": 39
          },
          "end": {
            "line": 9,
            "column": 40
          }
        },
        "loc": {
          "start": {
            "line": 9,
            "column": 53
          },
          "end": {
            "line": 41,
            "column": 1
          }
        },
        "line": 9
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 13,
            "column": 12
          },
          "end": {
            "line": 13,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 13,
            "column": 18
          },
          "end": {
            "line": 23,
            "column": 3
          }
        },
        "line": 13
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 15,
            "column": 43
          },
          "end": {
            "line": 15,
            "column": 44
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 63
          },
          "end": {
            "line": 21,
            "column": 7
          }
        },
        "line": 15
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 9,
          "column": 39
        },
        "end": {
          "line": 41,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 10,
          "column": 22
        },
        "end": {
          "line": 10,
          "column": 26
        }
      },
      "2": {
        "start": {
          "line": 11,
          "column": 32
        },
        "end": {
          "line": 11,
          "column": 44
        }
      },
      "3": {
        "start": {
          "line": 13,
          "column": 2
        },
        "end": {
          "line": 23,
          "column": 20
        }
      },
      "4": {
        "start": {
          "line": 14,
          "column": 4
        },
        "end": {
          "line": 22,
          "column": 5
        }
      },
      "5": {
        "start": {
          "line": 15,
          "column": 6
        },
        "end": {
          "line": 21,
          "column": 9
        }
      },
      "6": {
        "start": {
          "line": 16,
          "column": 21
        },
        "end": {
          "line": 19,
          "column": 10
        }
      },
      "7": {
        "start": {
          "line": 20,
          "column": 8
        },
        "end": {
          "line": 20,
          "column": 25
        }
      },
      "8": {
        "start": {
          "line": 24,
          "column": 2
        },
        "end": {
          "line": 40,
          "column": 4
        }
      }
    }
  }
}