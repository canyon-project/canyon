window["pages/index/projects/[id]/commits/helper/index.ts"] = {
  "content": "// import { data } from 'autoprefixer';\nimport axios from \"axios\";\n\nimport { getDecode } from \"../../../../../../helpers/utils/common.ts\";\n\ninterface HandleSelectFile {\n  projectID: string;\n  sha: string;\n  filepath: string;\n  reportID: string;\n  mode: string;\n}\nexport function handleSelectFile({\n  projectID,\n  sha,\n  filepath,\n  reportID,\n}: HandleSelectFile) {\n  // coverage/map\n  // codechange\n  // sourcecode\n\n  const fileContentRequest = axios\n    .get(`/api/sourcecode`, {\n      params: {\n        projectID: projectID,\n        sha: sha,\n        filepath: filepath,\n      },\n    })\n    .then(({ data }) => data);\n  const fileCoverageRequest = axios\n    .get(`/api/coverage/map`, {\n      params: {\n        projectID,\n        reportID: reportID,\n        sha: sha,\n        filepath: filepath,\n      },\n    })\n    .then(({ data }) => data[filepath]);\n\n  const fileCodeChangeRequest = axios\n    .get(`/api/codechange`, {\n      // operationName: 'GetCodeChange',\n      params: {\n        sha: sha,\n        filepath: filepath,\n      },\n    })\n    .then(({ data }) => data);\n  // commitSha, reportID, filepath\n  return Promise.all([\n    fileContentRequest,\n    fileCoverageRequest,\n    fileCodeChangeRequest,\n  ]).then(([fileContent, fileCoverage, fileCodeChange]) => {\n    return {\n      fileContent: getDecode(fileContent.content),\n      fileCoverage: fileCoverage,\n      fileCodeChange: fileCodeChange.additions || [],\n    };\n  });\n}\n\nexport const getCoverageSummaryMapService = ({ projectID, sha, reportID }) =>\n  axios({\n    url: \"/api/coverage/summary/map\",\n    method: \"GET\",\n    params: {\n      reportID: reportID || \"\",\n      sha: sha || \"\",\n      projectID: projectID || \"\",\n    },\n  })\n    .then(({ data }) => data)\n    .then((r) =>\n      r.map((i) => ({\n        ...i,\n        path: i.path.replace(\"~/\", \"\"),\n      })),\n    )\n    .then((r) => {\n      return r;\n    });\n",
  "coverage": {
    "path": "pages/index/projects/[id]/commits/helper/index.ts",
    "b": {
      "0": [
        0,
        0
      ],
      "1": [
        1,
        1
      ],
      "2": [
        1,
        0
      ],
      "3": [
        1,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 1,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0
    },
    "s": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 8,
      "9": 1,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 61,
            "column": 22
          },
          "end": {
            "line": 61,
            "column": 52
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 61,
              "column": 22
            },
            "end": {
              "line": 61,
              "column": 46
            }
          },
          {
            "start": {
              "line": 61,
              "column": 50
            },
            "end": {
              "line": 61,
              "column": 52
            }
          }
        ],
        "line": 61
      },
      "1": {
        "loc": {
          "start": {
            "line": 71,
            "column": 16
          },
          "end": {
            "line": 71,
            "column": 30
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 71,
              "column": 16
            },
            "end": {
              "line": 71,
              "column": 24
            }
          },
          {
            "start": {
              "line": 71,
              "column": 28
            },
            "end": {
              "line": 71,
              "column": 30
            }
          }
        ],
        "line": 71
      },
      "2": {
        "loc": {
          "start": {
            "line": 72,
            "column": 11
          },
          "end": {
            "line": 72,
            "column": 20
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 72,
              "column": 11
            },
            "end": {
              "line": 72,
              "column": 14
            }
          },
          {
            "start": {
              "line": 72,
              "column": 18
            },
            "end": {
              "line": 72,
              "column": 20
            }
          }
        ],
        "line": 72
      },
      "3": {
        "loc": {
          "start": {
            "line": 73,
            "column": 17
          },
          "end": {
            "line": 73,
            "column": 32
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 73,
              "column": 17
            },
            "end": {
              "line": 73,
              "column": 26
            }
          },
          {
            "start": {
              "line": 73,
              "column": 30
            },
            "end": {
              "line": 73,
              "column": 32
            }
          }
        ],
        "line": 73
      }
    },
    "fnMap": {
      "0": {
        "name": "handleSelectFile",
        "decl": {
          "start": {
            "line": 13,
            "column": 16
          },
          "end": {
            "line": 13,
            "column": 32
          }
        },
        "loc": {
          "start": {
            "line": 18,
            "column": 21
          },
          "end": {
            "line": 64,
            "column": 1
          }
        },
        "line": 18
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 31,
            "column": 10
          },
          "end": {
            "line": 31,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 31,
            "column": 24
          },
          "end": {
            "line": 31,
            "column": 28
          }
        },
        "line": 31
      },
      "2": {
        "name": "(anonymous_2)",
        "decl": {
          "start": {
            "line": 41,
            "column": 10
          },
          "end": {
            "line": 41,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 41,
            "column": 24
          },
          "end": {
            "line": 41,
            "column": 38
          }
        },
        "line": 41
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 51,
            "column": 10
          },
          "end": {
            "line": 51,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 51,
            "column": 24
          },
          "end": {
            "line": 51,
            "column": 28
          }
        },
        "line": 51
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 57,
            "column": 10
          },
          "end": {
            "line": 57,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 57,
            "column": 59
          },
          "end": {
            "line": 63,
            "column": 3
          }
        },
        "line": 57
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 66,
            "column": 44
          },
          "end": {
            "line": 66,
            "column": 45
          }
        },
        "loc": {
          "start": {
            "line": 67,
            "column": 2
          },
          "end": {
            "line": 85,
            "column": 6
          }
        },
        "line": 67
      },
      "6": {
        "name": "(anonymous_6)",
        "decl": {
          "start": {
            "line": 76,
            "column": 10
          },
          "end": {
            "line": 76,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 76,
            "column": 24
          },
          "end": {
            "line": 76,
            "column": 28
          }
        },
        "line": 76
      },
      "7": {
        "name": "(anonymous_7)",
        "decl": {
          "start": {
            "line": 77,
            "column": 10
          },
          "end": {
            "line": 77,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 78,
            "column": 6
          },
          "end": {
            "line": 81,
            "column": 9
          }
        },
        "line": 78
      },
      "8": {
        "name": "(anonymous_8)",
        "decl": {
          "start": {
            "line": 78,
            "column": 12
          },
          "end": {
            "line": 78,
            "column": 13
          }
        },
        "loc": {
          "start": {
            "line": 78,
            "column": 20
          },
          "end": {
            "line": 81,
            "column": 7
          }
        },
        "line": 78
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 83,
            "column": 10
          },
          "end": {
            "line": 83,
            "column": 11
          }
        },
        "loc": {
          "start": {
            "line": 83,
            "column": 17
          },
          "end": {
            "line": 85,
            "column": 5
          }
        },
        "line": 83
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 23,
          "column": 29
        },
        "end": {
          "line": 31,
          "column": 29
        }
      },
      "1": {
        "start": {
          "line": 31,
          "column": 24
        },
        "end": {
          "line": 31,
          "column": 28
        }
      },
      "2": {
        "start": {
          "line": 32,
          "column": 30
        },
        "end": {
          "line": 41,
          "column": 39
        }
      },
      "3": {
        "start": {
          "line": 41,
          "column": 24
        },
        "end": {
          "line": 41,
          "column": 38
        }
      },
      "4": {
        "start": {
          "line": 43,
          "column": 32
        },
        "end": {
          "line": 51,
          "column": 29
        }
      },
      "5": {
        "start": {
          "line": 51,
          "column": 24
        },
        "end": {
          "line": 51,
          "column": 28
        }
      },
      "6": {
        "start": {
          "line": 53,
          "column": 2
        },
        "end": {
          "line": 63,
          "column": 5
        }
      },
      "7": {
        "start": {
          "line": 58,
          "column": 4
        },
        "end": {
          "line": 62,
          "column": 6
        }
      },
      "8": {
        "start": {
          "line": 66,
          "column": 44
        },
        "end": {
          "line": 85,
          "column": 6
        }
      },
      "9": {
        "start": {
          "line": 67,
          "column": 2
        },
        "end": {
          "line": 85,
          "column": 6
        }
      },
      "10": {
        "start": {
          "line": 76,
          "column": 24
        },
        "end": {
          "line": 76,
          "column": 28
        }
      },
      "11": {
        "start": {
          "line": 78,
          "column": 6
        },
        "end": {
          "line": 81,
          "column": 9
        }
      },
      "12": {
        "start": {
          "line": 78,
          "column": 20
        },
        "end": {
          "line": 81,
          "column": 7
        }
      },
      "13": {
        "start": {
          "line": 84,
          "column": 6
        },
        "end": {
          "line": 84,
          "column": 15
        }
      }
    }
  }
}