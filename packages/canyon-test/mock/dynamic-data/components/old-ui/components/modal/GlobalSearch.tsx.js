window["components/old-ui/components/modal/GlobalSearch.tsx"] = {
  "content": "import { forwardRef, useImperativeHandle, useState } from \"react\";\n\nconst { Search } = Input;\nconst CanyonModalGlobalSearch = (props, ref) => {\n  const [open, setOpen] = useState(false);\n\n  useImperativeHandle(ref, () => ({\n    report: () => {\n      setOpen(true);\n    },\n  }));\n\n  return (\n    <Modal\n      closeIcon={false}\n      width={770}\n      open={open}\n      onCancel={() => {\n        setOpen(false);\n      }}\n      onOk={() => {\n        setOpen(false);\n      }}\n      footer={false}\n    >\n      <Search></Search>\n    </Modal>\n  );\n};\n\nexport default forwardRef(CanyonModalGlobalSearch);\n",
  "coverage": {
    "path": "components/old-ui/components/modal/GlobalSearch.tsx",
    "b": {},
    "f": {
      "0": 57,
      "1": 57,
      "2": 0,
      "3": 0,
      "4": 0
    },
    "s": {
      "0": 8,
      "1": 8,
      "2": 57,
      "3": 57,
      "4": 57,
      "5": 0,
      "6": 57,
      "7": 0,
      "8": 0
    },
    "branchMap": {},
    "fnMap": {
      "0": {
        "name": "(anonymous_0)",
        "decl": {
          "start": {
            "line": 4,
            "column": 32
          },
          "end": {
            "line": 4,
            "column": 33
          }
        },
        "loc": {
          "start": {
            "line": 4,
            "column": 48
          },
          "end": {
            "line": 29,
            "column": 1
          }
        },
        "line": 4
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 7,
            "column": 27
          },
          "end": {
            "line": 7,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 7,
            "column": 34
          },
          "end": {
            "line": 11,
            "column": 3
          }
        },
        "line": 7
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 8,
            "column": 12
          },
          "end": {
            "line": 8,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 8,
            "column": 18
          },
          "end": {
            "line": 10,
            "column": 5
          }
        },
        "line": 8
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 18,
            "column": 16
          },
          "end": {
            "line": 18,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 22
          },
          "end": {
            "line": 20,
            "column": 7
          }
        },
        "line": 18
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 21,
            "column": 12
          },
          "end": {
            "line": 21,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 21,
            "column": 18
          },
          "end": {
            "line": 23,
            "column": 7
          }
        },
        "line": 21
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 3,
          "column": 19
        },
        "end": {
          "line": 3,
          "column": 24
        }
      },
      "1": {
        "start": {
          "line": 4,
          "column": 32
        },
        "end": {
          "line": 29,
          "column": 1
        }
      },
      "2": {
        "start": {
          "line": 5,
          "column": 26
        },
        "end": {
          "line": 5,
          "column": 41
        }
      },
      "3": {
        "start": {
          "line": 7,
          "column": 2
        },
        "end": {
          "line": 11,
          "column": 6
        }
      },
      "4": {
        "start": {
          "line": 7,
          "column": 34
        },
        "end": {
          "line": 11,
          "column": 3
        }
      },
      "5": {
        "start": {
          "line": 9,
          "column": 6
        },
        "end": {
          "line": 9,
          "column": 20
        }
      },
      "6": {
        "start": {
          "line": 13,
          "column": 2
        },
        "end": {
          "line": 28,
          "column": 4
        }
      },
      "7": {
        "start": {
          "line": 19,
          "column": 8
        },
        "end": {
          "line": 19,
          "column": 23
        }
      },
      "8": {
        "start": {
          "line": 22,
          "column": 8
        },
        "end": {
          "line": 22,
          "column": 23
        }
      }
    }
  }
}