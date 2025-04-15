window["components/old-ui/components/card/Primary.tsx"] = {
  "content": "import { FC } from \"react\";\n\nconst { useToken } = theme;\nconst CanyonCardPrimary: FC<{\n  theme?: any;\n  language?: any;\n  children: any;\n}> = ({ theme, language, children }) => {\n  const { token } = useToken();\n  return (\n    <div\n      className={\"rounded-[8px] overflow-hidden\"}\n      style={{\n        border: `1px solid ${token.colorBorder}`,\n        boxShadow: `${token.boxShadowTertiary}`,\n      }}\n    >\n      {children}\n    </div>\n  );\n};\n\nexport default CanyonCardPrimary;\n",
  "coverage": {
    "path": "components/old-ui/components/card/Primary.tsx",
    "b": {},
    "f": {
      "0": 89
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 89,
      "3": 89
    },
    "branchMap": {},
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
            "column": 40
          },
          "end": {
            "line": 21,
            "column": 1
          }
        },
        "line": 8
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 21
        },
        "end": {
          "line": 3,
          "column": 26
        }
      },
      "1": {
        "start": {
          "line": 8,
          "column": 5
        },
        "end": {
          "line": 21,
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
          "column": 2
        },
        "end": {
          "line": 20,
          "column": 4
        }
      }
    }
  }
}