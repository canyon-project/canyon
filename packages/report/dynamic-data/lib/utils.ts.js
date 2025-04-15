window["lib/utils.ts"] = {
  "content": "import { type ClassValue, clsx } from \"clsx\";\nimport { twMerge } from \"tailwind-merge\";\n\nexport function cn(...inputs: ClassValue[]) {\n  return twMerge(clsx(inputs));\n}\n",
  "coverage": {
    "path": "lib/utils.ts",
    "b": {},
    "f": {
      "0": 48
    },
    "s": {
      "0": 48
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "cn",
        "decl": {
          "start": {
            "line": 4,
            "column": 16
          },
          "end": {
            "line": 4,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 4,
            "column": 44
          },
          "end": {
            "line": 6,
            "column": 1
          }
        },
        "line": 4
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 5,
          "column": 2
        },
        "end": {
          "line": 5,
          "column": 31
        }
      }
    }
  }
}