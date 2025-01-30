window["components/ui/components/form/region.tsx"] = {
  "content": "import { PlusOutlined } from \"@ant-design/icons\";\nimport { Button, Card, Space } from \"antd\";\nimport type { FC, ReactNode } from \"react\";\n\nconst RegionForm: FC<{\n  title: string;\n  icon: ReactNode;\n  onSave?: () => void;\n  onAdd?: () => void;\n  children: ReactNode;\n}> = ({ title, icon, onSave, onAdd, children }) => {\n  return (\n    <Card\n      className={\"shadow rounded-lg overflow-hidden\"}\n      title={\n        <div className={\"flex items-center\"}>\n          <div className={\"text-[#687076] mr-2 text-[16px]\"}>{icon}</div>\n          <span>{title}</span>\n        </div>\n      }\n    >\n      <Card.Grid hoverable={false} style={{ width: \"100%\" }}>\n        <div className={\"mb-5\"}>{children}</div>\n        <Space>\n          <Button type={\"primary\"} onClick={onSave}>\n            保存更改\n          </Button>\n          {onAdd && (\n            <Button icon={<PlusOutlined />} onClick={onAdd}>\n              添加\n            </Button>\n          )}\n        </Space>\n      </Card.Grid>\n    </Card>\n  );\n};\n\nexport default RegionForm;\n",
  "coverage": {
    "path": "components/ui/components/form/region.tsx",
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
      "1": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 28,
            "column": 11
          },
          "end": {
            "line": 32,
            "column": 11
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 28,
              "column": 11
            },
            "end": {
              "line": 28,
              "column": 16
            }
          },
          {
            "start": {
              "line": 29,
              "column": 12
            },
            "end": {
              "line": 31,
              "column": 21
            }
          }
        ],
        "line": 28
      }
    },
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 11,
            "column": 5
          },
          "end": {
            "line": 11,
            "column": 6
          }
        },
        "loc": {
          "start": {
            "line": 11,
            "column": 51
          },
          "end": {
            "line": 37,
            "column": 1
          }
        },
        "line": 11
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 11,
          "column": 5
        },
        "end": {
          "line": 37,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 12,
          "column": 2
        },
        "end": {
          "line": 36,
          "column": 4
        }
      }
    }
  }
}