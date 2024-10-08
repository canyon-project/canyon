window["layouts/genTitle.ts"] = {
  "content": "function matchPattern(str: string) {\n  if (\n    str.includes(\"projects\") &&\n    str.split(\"/\").length === 3 &&\n    ![\"new\"].includes(str.split(\"/\")[2])\n  ) {\n    return true;\n  }\n}\nexport const genTitle = (pathname: string) => {\n  if (matchPattern(pathname)) {\n    return `${pathname.split(\"/\")[2].split(\"-\")[1]} | Overview | Canyon`;\n  } else if (pathname.includes(\"commits\")) {\n    return `${pathname.split(\"/\")[2].split(\"-\")[1]} | Coverage Details | Canyon`;\n  } else if (pathname.includes(\"configure\")) {\n    return `${pathname.split(\"/\")[2].split(\"-\")[1]} | Configure | Canyon`;\n  } else if (pathname.includes(\"settings\")) {\n    return `Settings | Canyon`;\n  }\n  return `Canyon`;\n};\n",
  "coverage": {
    "path": "layouts/genTitle.ts",
    "b": {
      "0": [
        10,
        22
      ],
      "1": [
        32,
        21,
        10
      ],
      "2": [
        10,
        22
      ],
      "3": [
        1,
        21
      ],
      "4": [
        0,
        21
      ],
      "5": [
        4,
        17
      ]
    },
    "f": {
      "0": 32,
      "1": 32
    },
    "s": {
      "0": 32,
      "1": 10,
      "2": 8,
      "3": 32,
      "4": 10,
      "5": 22,
      "6": 1,
      "7": 21,
      "8": 0,
      "9": 21,
      "10": 4,
      "11": 17
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 2,
            "column": 2
          },
          "end": {
            "line": 8,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 2,
              "column": 2
            },
            "end": {
              "line": 8,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 2
      },
      "1": {
        "loc": {
          "start": {
            "line": 3,
            "column": 4
          },
          "end": {
            "line": 5,
            "column": 40
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 3,
              "column": 4
            },
            "end": {
              "line": 3,
              "column": 28
            }
          },
          {
            "start": {
              "line": 4,
              "column": 4
            },
            "end": {
              "line": 4,
              "column": 31
            }
          },
          {
            "start": {
              "line": 5,
              "column": 4
            },
            "end": {
              "line": 5,
              "column": 40
            }
          }
        ],
        "line": 3
      },
      "2": {
        "loc": {
          "start": {
            "line": 11,
            "column": 2
          },
          "end": {
            "line": 19,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 11,
              "column": 2
            },
            "end": {
              "line": 19,
              "column": 3
            }
          },
          {
            "start": {
              "line": 13,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          }
        ],
        "line": 11
      },
      "3": {
        "loc": {
          "start": {
            "line": 13,
            "column": 9
          },
          "end": {
            "line": 19,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 13,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          },
          {
            "start": {
              "line": 15,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          }
        ],
        "line": 13
      },
      "4": {
        "loc": {
          "start": {
            "line": 15,
            "column": 9
          },
          "end": {
            "line": 19,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 15,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          },
          {
            "start": {
              "line": 17,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          }
        ],
        "line": 15
      },
      "5": {
        "loc": {
          "start": {
            "line": 17,
            "column": 9
          },
          "end": {
            "line": 19,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 17,
              "column": 9
            },
            "end": {
              "line": 19,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 17
      }
    },
    "fnMap": {
      "0": {
        "name": "matchPattern",
        "decl": {
          "start": {
            "line": 1,
            "column": 9
          },
          "end": {
            "line": 1,
            "column": 21
          }
        },
        "loc": {
          "start": {
            "line": 1,
            "column": 35
          },
          "end": {
            "line": 9,
            "column": 1
          }
        },
        "line": 1
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 10,
            "column": 24
          },
          "end": {
            "line": 10,
            "column": 25
          }
        },
        "loc": {
          "start": {
            "line": 10,
            "column": 46
          },
          "end": {
            "line": 21,
            "column": 1
          }
        },
        "line": 10
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 2,
          "column": 2
        },
        "end": {
          "line": 8,
          "column": 3
        }
      },
      "1": {
        "start": {
          "line": 7,
          "column": 4
        },
        "end": {
          "line": 7,
          "column": 16
        }
      },
      "2": {
        "start": {
          "line": 10,
          "column": 24
        },
        "end": {
          "line": 21,
          "column": 1
        }
      },
      "3": {
        "start": {
          "line": 11,
          "column": 2
        },
        "end": {
          "line": 19,
          "column": 3
        }
      },
      "4": {
        "start": {
          "line": 12,
          "column": 4
        },
        "end": {
          "line": 12,
          "column": 73
        }
      },
      "5": {
        "start": {
          "line": 13,
          "column": 9
        },
        "end": {
          "line": 19,
          "column": 3
        }
      },
      "6": {
        "start": {
          "line": 14,
          "column": 4
        },
        "end": {
          "line": 14,
          "column": 81
        }
      },
      "7": {
        "start": {
          "line": 15,
          "column": 9
        },
        "end": {
          "line": 19,
          "column": 3
        }
      },
      "8": {
        "start": {
          "line": 16,
          "column": 4
        },
        "end": {
          "line": 16,
          "column": 74
        }
      },
      "9": {
        "start": {
          "line": 17,
          "column": 9
        },
        "end": {
          "line": 19,
          "column": 3
        }
      },
      "10": {
        "start": {
          "line": 18,
          "column": 4
        },
        "end": {
          "line": 18,
          "column": 31
        }
      },
      "11": {
        "start": {
          "line": 20,
          "column": 2
        },
        "end": {
          "line": 20,
          "column": 18
        }
      }
    }
  }
}