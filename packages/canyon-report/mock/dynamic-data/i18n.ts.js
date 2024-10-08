window["i18n.ts"] = {
  "content": "import i18n from \"i18next\";\nimport LanguageDetector from \"i18next-browser-languagedetector\";\nimport { initReactI18next } from \"react-i18next\";\nimport cn from \"../locales/cn.json\";\nimport en from \"../locales/en.json\";\nimport ja from \"../locales/ja.json\";\n\nconst resources = {\n  cn: {\n    translation: cn,\n  },\n  en: {\n    translation: en,\n  },\n  ja: {\n    translation: ja,\n  },\n};\n\ni18n\n  .use(LanguageDetector)\n  .use(initReactI18next)\n  .init({\n    fallbackLng: \"en\",\n    interpolation: {\n      escapeValue: false,\n    },\n    resources: resources,\n    lng: localStorage.getItem(\"language\") || \"cn\",\n  });\n\nexport default i18n;\n",
  "coverage": {
    "path": "i18n.ts",
    "b": {
      "0": [
        8,
        8
      ]
    },
    "f": {},
    "s": {
      "0": 8,
      "1": 8
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 29,
            "column": 9
          },
          "end": {
            "line": 29,
            "column": 49
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 29,
              "column": 9
            },
            "end": {
              "line": 29,
              "column": 41
            }
          },
          {
            "start": {
              "line": 29,
              "column": 45
            },
            "end": {
              "line": 29,
              "column": 49
            }
          }
        ],
        "line": 29
      }
    },
    "fnMap": {},
    "statementMap": {
      "0": {
        "start": {
          "line": 8,
          "column": 18
        },
        "end": {
          "line": 18,
          "column": 1
        }
      },
      "1": {
        "start": {
          "line": 20,
          "column": 0
        },
        "end": {
          "line": 30,
          "column": 5
        }
      }
    }
  }
}