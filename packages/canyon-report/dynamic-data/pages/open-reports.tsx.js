window["pages/open-reports.tsx"] = {
  "content": "import Reports from \"./index/reports.tsx\";\nimport { ArrowLeftOutlined } from \"@ant-design/icons\";\nimport LineChart from \"@/components/LineChart.tsx\";\n\nconst OpenReports = () => {\n  return (\n    <div>\n      <div className={\"p-[20px]\"}>\n        <div className={\"py-[10px]\"}>\n          <a href={\"/\"}>\n            <ArrowLeftOutlined />\n            回到Canyon主页\n          </a>\n        </div>\n        <LineChart />\n        <div className={\"h-5\"}></div>\n        <Reports />\n      </div>\n    </div>\n  );\n};\n\nexport default OpenReports;\n",
  "coverage": {
    "path": "pages/open-reports.tsx",
    "b": {},
    "f": {
      "0": 0
    },
    "s": {
      "0": 0,
      "1": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 5,
            "column": 20
          },
          "end": {
            "line": 5,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 5,
            "column": 26
          },
          "end": {
            "line": 21,
            "column": 1
          }
        },
        "line": 5
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 5,
          "column": 20
        },
        "end": {
          "line": 21,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 6,
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