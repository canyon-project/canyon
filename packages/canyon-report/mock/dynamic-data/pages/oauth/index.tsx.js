window["pages/oauth/index.tsx"] = {
  "content": "import { CanyonPageOauth } from \"../../components/old-ui\";\nimport { useNavigate, useSearchParams } from \"react-router-dom\";\n\nconst Oauth = () => {\n  const [URLSearchParams] = useSearchParams();\n  const nav = useNavigate();\n  return (\n    <div>\n      <CanyonPageOauth\n        URLSearchParams={URLSearchParams}\n        onOauthFail={() => {\n          localStorage.clear();\n          nav(\"/login\");\n        }}\n      />\n    </div>\n  );\n};\n\nexport default Oauth;\n",
  "coverage": {
    "path": "pages/oauth/index.tsx",
    "b": {},
    "f": {
      "0": 0,
      "1": 0
    },
    "s": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 4,
            "column": 14
          },
          "end": {
            "line": 4,
            "column": 15
          }
        },
        "loc": {
          "start": {
            "line": 4,
            "column": 20
          },
          "end": {
            "line": 18,
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
            "column": 21
          },
          "end": {
            "line": 11,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 11,
            "column": 27
          },
          "end": {
            "line": 14,
            "column": 9
          }
        },
        "line": 11
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 4,
          "column": 14
        },
        "end": {
          "line": 18,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 5,
          "column": 28
        },
        "end": {
          "line": 5,
          "column": 45
        }
      },
      "2": {
        "start": {
          "line": 6,
          "column": 14
        },
        "end": {
          "line": 6,
          "column": 27
        }
      },
      "3": {
        "start": {
          "line": 7,
          "column": 2
        },
        "end": {
          "line": 17,
          "column": 4
        }
      },
      "4": {
        "start": {
          "line": 12,
          "column": 10
        },
        "end": {
          "line": 12,
          "column": 31
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 10
        },
        "end": {
          "line": 13,
          "column": 24
        }
      }
    }
  }
}