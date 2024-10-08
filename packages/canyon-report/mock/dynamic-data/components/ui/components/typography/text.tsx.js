window["components/ui/components/typography/text.tsx"] = {
  "content": "import { Space } from \"antd\";\nimport type { CSSProperties, FC, ReactNode } from \"react\";\nimport { cn } from \"@/lib/utils.ts\";\ninterface TextTypographyProps {\n  title: string;\n  icon: ReactNode;\n  right?: ReactNode;\n  style?: CSSProperties;\n}\nconst TextTypography: FC<TextTypographyProps> = ({\n  title,\n  icon,\n  right,\n  style,\n}) => {\n  return (\n    <div\n      style={style}\n      className={cn(\"flex\", \"justify-between\", \"items-center\", \"mb-5\")}\n    >\n      <Space style={{ fontSize: \"25px\", fontWeight: 500 }}>\n        <span className={\"text-[#687076] text-[32px]\"}>{icon}</span>\n        {title}\n      </Space>\n      <div>{right}</div>\n    </div>\n  );\n};\n\nexport default TextTypography;\n",
  "coverage": {
    "path": "components/ui/components/typography/text.tsx",
    "b": {},
    "f": {
      "0": 48
    },
    "s": {
      "0": 8,
      "1": 48
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 10,
            "column": 48
          },
          "end": {
            "line": 10,
            "column": 49
          }
        },
        "loc": {
          "start": {
            "line": 15,
            "column": 6
          },
          "end": {
            "line": 28,
            "column": 1
          }
        },
        "line": 15
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 10,
          "column": 48
        },
        "end": {
          "line": 28,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 16,
          "column": 2
        },
        "end": {
          "line": 27,
          "column": 4
        }
      }
    }
  }
}