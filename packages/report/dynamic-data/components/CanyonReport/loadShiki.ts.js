window["components/CanyonReport/loadShiki.ts"] = {
  "content": "import { createHighlighterCore } from \"shiki/core\";\nimport getWasm from \"shiki/wasm\";\nimport lightplus from \"shiki/themes/light-plus.mjs\";\nimport css from \"shiki/langs/css.mjs\";\nimport jscss from \"shiki/langs/javascript.mjs\";\nimport { createOnigurumaEngine } from \"shiki/engine/oniguruma\";\n\nexport const createHighlighterCoreInstance = async () => {\n  return await createHighlighterCore({\n    themes: [\n      // 传入导入的包，而不是字符串\n      lightplus,\n    ],\n    langs: [css, jscss],\n    // `shiki/wasm` contains the wasm binary inlined as base64 string.\n    engine: createOnigurumaEngine(getWasm),\n  });\n};\n",
  "coverage": {
    "path": "components/CanyonReport/loadShiki.ts",
    "b": {},
    "f": {
      "0": 0
    },
    "s": {
      "0": 8,
      "1": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 8,
            "column": 45
          },
          "end": {
            "line": 8,
            "column": 46
          }
        },
        "loc": {
          "start": {
            "line": 8,
            "column": 57
          },
          "end": {
            "line": 18,
            "column": 1
          }
        },
        "line": 8
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 8,
          "column": 45
        },
        "end": {
          "line": 18,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 9,
          "column": 2
        },
        "end": {
          "line": 17,
          "column": 5
        }
      }
    }
  }
}