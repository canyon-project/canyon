window["components/CanyonReport/helper.tsx"] = {
  "content": "export function coreFn(\n  fileCoverage: any,\n  fileDetail: string,\n): {\n  times: {\n    lineNumber: number;\n    count: number;\n  }[];\n  rows: string[];\n  maxWidth: number;\n  lines: {\n    executionNumber: number;\n  }[];\n} {\n  const nullData = {\n    times: [],\n    rows: [],\n    maxWidth: 0,\n    lines: [],\n  };\n  if (!fileCoverage.s) {\n    return nullData;\n  }\n\n  const content = fileDetail;\n  // 1.转换成数组\n  const rows = [\"\"];\n  let index = 0;\n  for (let i = 0; i < content.length; i++) {\n    if (content[i] === \"\\n\") {\n      index += 1;\n      rows.push(\"\");\n    } else {\n      rows[index] += content[i];\n    }\n  }\n  const maxWidth = JSON.parse(JSON.stringify(rows)).sort(\n    (a: string, b: string) => -(a.length - b.length),\n  )[0].length;\n\n  // 获取numberOfRows\n  // 获取行覆盖率\n  function getLineCoverage(data: any) {\n    const statementMap = data.statementMap;\n    const statements = data.s;\n    const lineMap = Object.create(null);\n    Object.entries(statements).forEach(([st, count]: any) => {\n      if (!statementMap[st]) {\n        return;\n      }\n      const { line } = statementMap[st].start;\n      const prevVal = lineMap[line];\n      if (prevVal === undefined || prevVal < count) {\n        lineMap[line] = count;\n      }\n    });\n    return lineMap;\n  }\n\n  // 计算行\n  const lineStats = getLineCoverage(fileCoverage);\n  if (!lineStats) {\n    return nullData;\n  }\n  // numberOfRows\n  const numberOfRows: any[] = [];\n  Object.entries(lineStats).forEach(([lineNumber, count]) => {\n    numberOfRows.push({ lineNumber, count });\n    // 这边计算出了行的次数！！！！！！\n  });\n\n  const lines = [];\n  for (let i = 0; i < rows.length; i++) {\n    if (numberOfRows.find((n) => Number(n.lineNumber) === i + 1)) {\n      lines.push({\n        executionNumber: numberOfRows.find(\n          (n) => Number(n.lineNumber) === i + 1,\n        ).count,\n      });\n    } else {\n      lines.push({\n        executionNumber: -1,\n      });\n    }\n  }\n  return {\n    times: numberOfRows,\n    rows,\n    lines,\n    maxWidth,\n  };\n}\n\nexport function genDecorationsLv2Array(code, startends) {\n  const lines = code.split(\"\\n\");\n  function convertRanges(arr) {\n    const result = [];\n    arr.forEach((data) => {\n      const start = data.start;\n      const end = data.end;\n\n      for (let i = start[0]; i <= end[0]; i++) {\n        const intervalStart = i === start[0] ? start[1] : 0;\n        const intervalEnd = lines[i].length;\n        result.push([i, intervalStart, intervalEnd]);\n      }\n    });\n    // 输出每一行的区间值\n    return result;\n  }\n\n  const convertedData = convertRanges(startends);\n  function mergeRanges(ranges) {\n    // 对区间按照起始位置进行排序\n    ranges.sort((a, b) => a[0] - b[0]);\n\n    const merged = [];\n\n    let currentRange = ranges[0];\n    for (let i = 1; i < ranges.length; i++) {\n      const nextRange = ranges[i];\n\n      // 如果当前区间和下一个区间有重叠，则合并它们\n      if (currentRange[1] >= nextRange[0]) {\n        currentRange[1] = Math.max(currentRange[1], nextRange[1]);\n      } else {\n        merged.push(currentRange);\n        currentRange = nextRange;\n      }\n    }\n\n    merged.push(currentRange);\n\n    return merged;\n  }\n\n  function mergeRows(array) {\n    const groupedRows = {};\n\n    // 将相同行的元素分组\n    array.forEach(([row, col, value]) => {\n      if (!groupedRows[row]) {\n        groupedRows[row] = [];\n      }\n      groupedRows[row].push([col, value]);\n    });\n\n    const mergedArray = [];\n\n    // 对每个分组合并区间\n    for (const row in groupedRows) {\n      const mergedRanges = mergeRanges(groupedRows[row]);\n      mergedRanges.forEach((range) => {\n        mergedArray.push([parseInt(row), range[0], range[1]]);\n      });\n    }\n\n    return mergedArray;\n  }\n\n  const mergedArray = mergeRows(convertedData);\n  return mergedArray;\n}\n\nexport function capitalizeFirstLetter(string) {\n  return string.charAt(0).toUpperCase() + string.slice(1);\n}\n\nexport function checkSuffix(path) {\n  //   只要path里含有vue、js、jsx等就返回true\n  return (\n    path.includes(\".vue\") ||\n    path.includes(\".js\") ||\n    path.includes(\".jsx\") ||\n    path.includes(\".ts\") ||\n    path.includes(\".tsx\")\n  );\n}\n\nexport function mergeIntervals(intervals) {\n  // 如果输入为空，直接返回空列表\n  if (intervals.length === 0) {\n    return [];\n  }\n\n  // 将所有线段按起始位置进行排序\n  intervals.sort((a, b) => a[0] - b[0]);\n\n  // 初始化结果列表\n  const merged = [];\n  let [currentStart, currentEnd] = intervals[0];\n\n  for (const [start, end] of intervals.slice(1)) {\n    if (start <= currentEnd) {\n      // 当前线段与前一个线段有重叠\n      currentEnd = Math.max(currentEnd, end); // 更新结束位置\n    } else {\n      // 当前线段与前一个线段没有重叠\n      merged.push([currentStart, currentEnd]); // 将前一个线段加入结果列表\n      [currentStart, currentEnd] = [start, end]; // 更新当前线段的起始和结束位置\n    }\n  }\n\n  // 添加最后一个线段\n  merged.push([currentStart, currentEnd]);\n\n  return merged;\n}\n",
  "coverage": {
    "path": "components/CanyonReport/helper.tsx",
    "b": {
      "0": [
        0,
        0
      ],
      "1": [
        0,
        0
      ],
      "2": [
        0,
        0
      ],
      "3": [
        0,
        0
      ],
      "4": [
        0,
        0
      ],
      "5": [
        0,
        0
      ],
      "6": [
        0,
        0
      ],
      "7": [
        0,
        0
      ],
      "8": [
        0,
        0
      ],
      "9": [
        0,
        0
      ],
      "10": [
        0,
        0,
        0,
        0,
        0
      ],
      "11": [
        0,
        0
      ],
      "12": [
        0,
        0
      ]
    },
    "f": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0
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
      "8": 0,
      "9": 0,
      "10": 0,
      "11": 0,
      "12": 0,
      "13": 0,
      "14": 0,
      "15": 0,
      "16": 0,
      "17": 0,
      "18": 0,
      "19": 0,
      "20": 0,
      "21": 0,
      "22": 0,
      "23": 0,
      "24": 0,
      "25": 0,
      "26": 0,
      "27": 0,
      "28": 0,
      "29": 0,
      "30": 0,
      "31": 0,
      "32": 0,
      "33": 0,
      "34": 0,
      "35": 0,
      "36": 0,
      "37": 0,
      "38": 0,
      "39": 0,
      "40": 0,
      "41": 0,
      "42": 0,
      "43": 0,
      "44": 0,
      "45": 0,
      "46": 0,
      "47": 0,
      "48": 0,
      "49": 0,
      "50": 0,
      "51": 0,
      "52": 0,
      "53": 0,
      "54": 0,
      "55": 0,
      "56": 0,
      "57": 0,
      "58": 0,
      "59": 0,
      "60": 0,
      "61": 0,
      "62": 0,
      "63": 0,
      "64": 0,
      "65": 0,
      "66": 0,
      "67": 0,
      "68": 0,
      "69": 0,
      "70": 0,
      "71": 0,
      "72": 0,
      "73": 0,
      "74": 0,
      "75": 0,
      "76": 0,
      "77": 0,
      "78": 0,
      "79": 0,
      "80": 0,
      "81": 0,
      "82": 0,
      "83": 0,
      "84": 0,
      "85": 0,
      "86": 0,
      "87": 0,
      "88": 0,
      "89": 0,
      "90": 0,
      "91": 0,
      "92": 0
    },
    "branchMap": {
      "0": {
        "loc": {
          "start": {
            "line": 21,
            "column": 2
          },
          "end": {
            "line": 23,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 21,
              "column": 2
            },
            "end": {
              "line": 23,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 21
      },
      "1": {
        "loc": {
          "start": {
            "line": 30,
            "column": 4
          },
          "end": {
            "line": 35,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 30,
              "column": 4
            },
            "end": {
              "line": 35,
              "column": 5
            }
          },
          {
            "start": {
              "line": 33,
              "column": 11
            },
            "end": {
              "line": 35,
              "column": 5
            }
          }
        ],
        "line": 30
      },
      "2": {
        "loc": {
          "start": {
            "line": 48,
            "column": 6
          },
          "end": {
            "line": 50,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 48,
              "column": 6
            },
            "end": {
              "line": 50,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 48
      },
      "3": {
        "loc": {
          "start": {
            "line": 53,
            "column": 6
          },
          "end": {
            "line": 55,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 53,
              "column": 6
            },
            "end": {
              "line": 55,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 53
      },
      "4": {
        "loc": {
          "start": {
            "line": 53,
            "column": 10
          },
          "end": {
            "line": 53,
            "column": 50
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 53,
              "column": 10
            },
            "end": {
              "line": 53,
              "column": 31
            }
          },
          {
            "start": {
              "line": 53,
              "column": 35
            },
            "end": {
              "line": 53,
              "column": 50
            }
          }
        ],
        "line": 53
      },
      "5": {
        "loc": {
          "start": {
            "line": 62,
            "column": 2
          },
          "end": {
            "line": 64,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 62,
              "column": 2
            },
            "end": {
              "line": 64,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 62
      },
      "6": {
        "loc": {
          "start": {
            "line": 74,
            "column": 4
          },
          "end": {
            "line": 84,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 74,
              "column": 4
            },
            "end": {
              "line": 84,
              "column": 5
            }
          },
          {
            "start": {
              "line": 80,
              "column": 11
            },
            "end": {
              "line": 84,
              "column": 5
            }
          }
        ],
        "line": 74
      },
      "7": {
        "loc": {
          "start": {
            "line": 103,
            "column": 30
          },
          "end": {
            "line": 103,
            "column": 59
          }
        },
        "type": "cond-expr",
        "locations": [
          {
            "start": {
              "line": 103,
              "column": 47
            },
            "end": {
              "line": 103,
              "column": 55
            }
          },
          {
            "start": {
              "line": 103,
              "column": 58
            },
            "end": {
              "line": 103,
              "column": 59
            }
          }
        ],
        "line": 103
      },
      "8": {
        "loc": {
          "start": {
            "line": 124,
            "column": 6
          },
          "end": {
            "line": 129,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 124,
              "column": 6
            },
            "end": {
              "line": 129,
              "column": 7
            }
          },
          {
            "start": {
              "line": 126,
              "column": 13
            },
            "end": {
              "line": 129,
              "column": 7
            }
          }
        ],
        "line": 124
      },
      "9": {
        "loc": {
          "start": {
            "line": 142,
            "column": 6
          },
          "end": {
            "line": 144,
            "column": 7
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 142,
              "column": 6
            },
            "end": {
              "line": 144,
              "column": 7
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 142
      },
      "10": {
        "loc": {
          "start": {
            "line": 172,
            "column": 4
          },
          "end": {
            "line": 176,
            "column": 25
          }
        },
        "type": "binary-expr",
        "locations": [
          {
            "start": {
              "line": 172,
              "column": 4
            },
            "end": {
              "line": 172,
              "column": 25
            }
          },
          {
            "start": {
              "line": 173,
              "column": 4
            },
            "end": {
              "line": 173,
              "column": 24
            }
          },
          {
            "start": {
              "line": 174,
              "column": 4
            },
            "end": {
              "line": 174,
              "column": 25
            }
          },
          {
            "start": {
              "line": 175,
              "column": 4
            },
            "end": {
              "line": 175,
              "column": 24
            }
          },
          {
            "start": {
              "line": 176,
              "column": 4
            },
            "end": {
              "line": 176,
              "column": 25
            }
          }
        ],
        "line": 172
      },
      "11": {
        "loc": {
          "start": {
            "line": 182,
            "column": 2
          },
          "end": {
            "line": 184,
            "column": 3
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 182,
              "column": 2
            },
            "end": {
              "line": 184,
              "column": 3
            }
          },
          {
            "start": {},
            "end": {}
          }
        ],
        "line": 182
      },
      "12": {
        "loc": {
          "start": {
            "line": 194,
            "column": 4
          },
          "end": {
            "line": 201,
            "column": 5
          }
        },
        "type": "if",
        "locations": [
          {
            "start": {
              "line": 194,
              "column": 4
            },
            "end": {
              "line": 201,
              "column": 5
            }
          },
          {
            "start": {
              "line": 197,
              "column": 11
            },
            "end": {
              "line": 201,
              "column": 5
            }
          }
        ],
        "line": 194
      }
    },
    "fnMap": {
      "0": {
        "name": "coreFn",
        "decl": {
          "start": {
            "line": 1,
            "column": 16
          },
          "end": {
            "line": 1,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 14,
            "column": 2
          },
          "end": {
            "line": 92,
            "column": 1
          }
        },
        "line": 14
      },
      "1": {
        "name": "(anonymous_1)",
        "decl": {
          "start": {
            "line": 38,
            "column": 4
          },
          "end": {
            "line": 38,
            "column": 5
          }
        },
        "loc": {
          "start": {
            "line": 38,
            "column": 30
          },
          "end": {
            "line": 38,
            "column": 52
          }
        },
        "line": 38
      },
      "2": {
        "name": "getLineCoverage",
        "decl": {
          "start": {
            "line": 43,
            "column": 11
          },
          "end": {
            "line": 43,
            "column": 26
          }
        },
        "loc": {
          "start": {
            "line": 43,
            "column": 38
          },
          "end": {
            "line": 58,
            "column": 3
          }
        },
        "line": 43
      },
      "3": {
        "name": "(anonymous_3)",
        "decl": {
          "start": {
            "line": 47,
            "column": 39
          },
          "end": {
            "line": 47,
            "column": 40
          }
        },
        "loc": {
          "start": {
            "line": 47,
            "column": 61
          },
          "end": {
            "line": 56,
            "column": 5
          }
        },
        "line": 47
      },
      "4": {
        "name": "(anonymous_4)",
        "decl": {
          "start": {
            "line": 67,
            "column": 36
          },
          "end": {
            "line": 67,
            "column": 37
          }
        },
        "loc": {
          "start": {
            "line": 67,
            "column": 61
          },
          "end": {
            "line": 70,
            "column": 3
          }
        },
        "line": 67
      },
      "5": {
        "name": "(anonymous_5)",
        "decl": {
          "start": {
            "line": 74,
            "column": 26
          },
          "end": {
            "line": 74,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 74,
            "column": 33
          },
          "end": {
            "line": 74,
            "column": 63
          }
        },
        "line": 74
      },
      "6": {
        "name": "(anonymous_6)",
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
            "line": 77,
            "column": 17
          },
          "end": {
            "line": 77,
            "column": 47
          }
        },
        "line": 77
      },
      "7": {
        "name": "genDecorationsLv2Array",
        "decl": {
          "start": {
            "line": 94,
            "column": 16
          },
          "end": {
            "line": 94,
            "column": 38
          }
        },
        "loc": {
          "start": {
            "line": 94,
            "column": 56
          },
          "end": {
            "line": 163,
            "column": 1
          }
        },
        "line": 94
      },
      "8": {
        "name": "convertRanges",
        "decl": {
          "start": {
            "line": 96,
            "column": 11
          },
          "end": {
            "line": 96,
            "column": 24
          }
        },
        "loc": {
          "start": {
            "line": 96,
            "column": 30
          },
          "end": {
            "line": 110,
            "column": 3
          }
        },
        "line": 96
      },
      "9": {
        "name": "(anonymous_9)",
        "decl": {
          "start": {
            "line": 98,
            "column": 16
          },
          "end": {
            "line": 98,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 98,
            "column": 26
          },
          "end": {
            "line": 107,
            "column": 5
          }
        },
        "line": 98
      },
      "10": {
        "name": "mergeRanges",
        "decl": {
          "start": {
            "line": 113,
            "column": 11
          },
          "end": {
            "line": 113,
            "column": 22
          }
        },
        "loc": {
          "start": {
            "line": 113,
            "column": 31
          },
          "end": {
            "line": 135,
            "column": 3
          }
        },
        "line": 113
      },
      "11": {
        "name": "(anonymous_11)",
        "decl": {
          "start": {
            "line": 115,
            "column": 16
          },
          "end": {
            "line": 115,
            "column": 17
          }
        },
        "loc": {
          "start": {
            "line": 115,
            "column": 26
          },
          "end": {
            "line": 115,
            "column": 37
          }
        },
        "line": 115
      },
      "12": {
        "name": "mergeRows",
        "decl": {
          "start": {
            "line": 137,
            "column": 11
          },
          "end": {
            "line": 137,
            "column": 20
          }
        },
        "loc": {
          "start": {
            "line": 137,
            "column": 28
          },
          "end": {
            "line": 159,
            "column": 3
          }
        },
        "line": 137
      },
      "13": {
        "name": "(anonymous_13)",
        "decl": {
          "start": {
            "line": 141,
            "column": 18
          },
          "end": {
            "line": 141,
            "column": 19
          }
        },
        "loc": {
          "start": {
            "line": 141,
            "column": 41
          },
          "end": {
            "line": 146,
            "column": 5
          }
        },
        "line": 141
      },
      "14": {
        "name": "(anonymous_14)",
        "decl": {
          "start": {
            "line": 153,
            "column": 27
          },
          "end": {
            "line": 153,
            "column": 28
          }
        },
        "loc": {
          "start": {
            "line": 153,
            "column": 38
          },
          "end": {
            "line": 155,
            "column": 7
          }
        },
        "line": 153
      },
      "15": {
        "name": "capitalizeFirstLetter",
        "decl": {
          "start": {
            "line": 165,
            "column": 16
          },
          "end": {
            "line": 165,
            "column": 37
          }
        },
        "loc": {
          "start": {
            "line": 165,
            "column": 46
          },
          "end": {
            "line": 167,
            "column": 1
          }
        },
        "line": 165
      },
      "16": {
        "name": "checkSuffix",
        "decl": {
          "start": {
            "line": 169,
            "column": 16
          },
          "end": {
            "line": 169,
            "column": 27
          }
        },
        "loc": {
          "start": {
            "line": 169,
            "column": 34
          },
          "end": {
            "line": 178,
            "column": 1
          }
        },
        "line": 169
      },
      "17": {
        "name": "mergeIntervals",
        "decl": {
          "start": {
            "line": 180,
            "column": 16
          },
          "end": {
            "line": 180,
            "column": 30
          }
        },
        "loc": {
          "start": {
            "line": 180,
            "column": 42
          },
          "end": {
            "line": 208,
            "column": 1
          }
        },
        "line": 180
      },
      "18": {
        "name": "(anonymous_18)",
        "decl": {
          "start": {
            "line": 187,
            "column": 17
          },
          "end": {
            "line": 187,
            "column": 18
          }
        },
        "loc": {
          "start": {
            "line": 187,
            "column": 27
          },
          "end": {
            "line": 187,
            "column": 38
          }
        },
        "line": 187
      }
    },
    "statementMap": {
      "0": {
        "start": {
          "line": 15,
          "column": 19
        },
        "end": {
          "line": 20,
          "column": 3
        }
      },
      "1": {
        "start": {
          "line": 21,
          "column": 2
        },
        "end": {
          "line": 23,
          "column": 3
        }
      },
      "2": {
        "start": {
          "line": 22,
          "column": 4
        },
        "end": {
          "line": 22,
          "column": 20
        }
      },
      "3": {
        "start": {
          "line": 25,
          "column": 18
        },
        "end": {
          "line": 25,
          "column": 28
        }
      },
      "4": {
        "start": {
          "line": 27,
          "column": 15
        },
        "end": {
          "line": 27,
          "column": 19
        }
      },
      "5": {
        "start": {
          "line": 28,
          "column": 14
        },
        "end": {
          "line": 28,
          "column": 15
        }
      },
      "6": {
        "start": {
          "line": 29,
          "column": 2
        },
        "end": {
          "line": 36,
          "column": 3
        }
      },
      "7": {
        "start": {
          "line": 29,
          "column": 15
        },
        "end": {
          "line": 29,
          "column": 16
        }
      },
      "8": {
        "start": {
          "line": 30,
          "column": 4
        },
        "end": {
          "line": 35,
          "column": 5
        }
      },
      "9": {
        "start": {
          "line": 31,
          "column": 6
        },
        "end": {
          "line": 31,
          "column": 17
        }
      },
      "10": {
        "start": {
          "line": 32,
          "column": 6
        },
        "end": {
          "line": 32,
          "column": 20
        }
      },
      "11": {
        "start": {
          "line": 34,
          "column": 6
        },
        "end": {
          "line": 34,
          "column": 32
        }
      },
      "12": {
        "start": {
          "line": 37,
          "column": 19
        },
        "end": {
          "line": 39,
          "column": 13
        }
      },
      "13": {
        "start": {
          "line": 38,
          "column": 30
        },
        "end": {
          "line": 38,
          "column": 52
        }
      },
      "14": {
        "start": {
          "line": 44,
          "column": 25
        },
        "end": {
          "line": 44,
          "column": 42
        }
      },
      "15": {
        "start": {
          "line": 45,
          "column": 23
        },
        "end": {
          "line": 45,
          "column": 29
        }
      },
      "16": {
        "start": {
          "line": 46,
          "column": 20
        },
        "end": {
          "line": 46,
          "column": 39
        }
      },
      "17": {
        "start": {
          "line": 47,
          "column": 4
        },
        "end": {
          "line": 56,
          "column": 7
        }
      },
      "18": {
        "start": {
          "line": 48,
          "column": 6
        },
        "end": {
          "line": 50,
          "column": 7
        }
      },
      "19": {
        "start": {
          "line": 49,
          "column": 8
        },
        "end": {
          "line": 49,
          "column": 15
        }
      },
      "20": {
        "start": {
          "line": 51,
          "column": 23
        },
        "end": {
          "line": 51,
          "column": 45
        }
      },
      "21": {
        "start": {
          "line": 52,
          "column": 22
        },
        "end": {
          "line": 52,
          "column": 35
        }
      },
      "22": {
        "start": {
          "line": 53,
          "column": 6
        },
        "end": {
          "line": 55,
          "column": 7
        }
      },
      "23": {
        "start": {
          "line": 54,
          "column": 8
        },
        "end": {
          "line": 54,
          "column": 30
        }
      },
      "24": {
        "start": {
          "line": 57,
          "column": 4
        },
        "end": {
          "line": 57,
          "column": 19
        }
      },
      "25": {
        "start": {
          "line": 61,
          "column": 20
        },
        "end": {
          "line": 61,
          "column": 49
        }
      },
      "26": {
        "start": {
          "line": 62,
          "column": 2
        },
        "end": {
          "line": 64,
          "column": 3
        }
      },
      "27": {
        "start": {
          "line": 63,
          "column": 4
        },
        "end": {
          "line": 63,
          "column": 20
        }
      },
      "28": {
        "start": {
          "line": 66,
          "column": 30
        },
        "end": {
          "line": 66,
          "column": 32
        }
      },
      "29": {
        "start": {
          "line": 67,
          "column": 2
        },
        "end": {
          "line": 70,
          "column": 5
        }
      },
      "30": {
        "start": {
          "line": 68,
          "column": 4
        },
        "end": {
          "line": 68,
          "column": 45
        }
      },
      "31": {
        "start": {
          "line": 72,
          "column": 16
        },
        "end": {
          "line": 72,
          "column": 18
        }
      },
      "32": {
        "start": {
          "line": 73,
          "column": 2
        },
        "end": {
          "line": 85,
          "column": 3
        }
      },
      "33": {
        "start": {
          "line": 73,
          "column": 15
        },
        "end": {
          "line": 73,
          "column": 16
        }
      },
      "34": {
        "start": {
          "line": 74,
          "column": 4
        },
        "end": {
          "line": 84,
          "column": 5
        }
      },
      "35": {
        "start": {
          "line": 74,
          "column": 33
        },
        "end": {
          "line": 74,
          "column": 63
        }
      },
      "36": {
        "start": {
          "line": 75,
          "column": 6
        },
        "end": {
          "line": 79,
          "column": 9
        }
      },
      "37": {
        "start": {
          "line": 77,
          "column": 17
        },
        "end": {
          "line": 77,
          "column": 47
        }
      },
      "38": {
        "start": {
          "line": 81,
          "column": 6
        },
        "end": {
          "line": 83,
          "column": 9
        }
      },
      "39": {
        "start": {
          "line": 86,
          "column": 2
        },
        "end": {
          "line": 91,
          "column": 4
        }
      },
      "40": {
        "start": {
          "line": 95,
          "column": 16
        },
        "end": {
          "line": 95,
          "column": 32
        }
      },
      "41": {
        "start": {
          "line": 97,
          "column": 19
        },
        "end": {
          "line": 97,
          "column": 21
        }
      },
      "42": {
        "start": {
          "line": 98,
          "column": 4
        },
        "end": {
          "line": 107,
          "column": 7
        }
      },
      "43": {
        "start": {
          "line": 99,
          "column": 20
        },
        "end": {
          "line": 99,
          "column": 30
        }
      },
      "44": {
        "start": {
          "line": 100,
          "column": 18
        },
        "end": {
          "line": 100,
          "column": 26
        }
      },
      "45": {
        "start": {
          "line": 102,
          "column": 6
        },
        "end": {
          "line": 106,
          "column": 7
        }
      },
      "46": {
        "start": {
          "line": 102,
          "column": 19
        },
        "end": {
          "line": 102,
          "column": 27
        }
      },
      "47": {
        "start": {
          "line": 103,
          "column": 30
        },
        "end": {
          "line": 103,
          "column": 59
        }
      },
      "48": {
        "start": {
          "line": 104,
          "column": 28
        },
        "end": {
          "line": 104,
          "column": 43
        }
      },
      "49": {
        "start": {
          "line": 105,
          "column": 8
        },
        "end": {
          "line": 105,
          "column": 53
        }
      },
      "50": {
        "start": {
          "line": 109,
          "column": 4
        },
        "end": {
          "line": 109,
          "column": 18
        }
      },
      "51": {
        "start": {
          "line": 112,
          "column": 24
        },
        "end": {
          "line": 112,
          "column": 48
        }
      },
      "52": {
        "start": {
          "line": 115,
          "column": 4
        },
        "end": {
          "line": 115,
          "column": 39
        }
      },
      "53": {
        "start": {
          "line": 115,
          "column": 26
        },
        "end": {
          "line": 115,
          "column": 37
        }
      },
      "54": {
        "start": {
          "line": 117,
          "column": 19
        },
        "end": {
          "line": 117,
          "column": 21
        }
      },
      "55": {
        "start": {
          "line": 119,
          "column": 23
        },
        "end": {
          "line": 119,
          "column": 32
        }
      },
      "56": {
        "start": {
          "line": 120,
          "column": 4
        },
        "end": {
          "line": 130,
          "column": 5
        }
      },
      "57": {
        "start": {
          "line": 120,
          "column": 17
        },
        "end": {
          "line": 120,
          "column": 18
        }
      },
      "58": {
        "start": {
          "line": 121,
          "column": 24
        },
        "end": {
          "line": 121,
          "column": 33
        }
      },
      "59": {
        "start": {
          "line": 124,
          "column": 6
        },
        "end": {
          "line": 129,
          "column": 7
        }
      },
      "60": {
        "start": {
          "line": 125,
          "column": 8
        },
        "end": {
          "line": 125,
          "column": 66
        }
      },
      "61": {
        "start": {
          "line": 127,
          "column": 8
        },
        "end": {
          "line": 127,
          "column": 34
        }
      },
      "62": {
        "start": {
          "line": 128,
          "column": 8
        },
        "end": {
          "line": 128,
          "column": 33
        }
      },
      "63": {
        "start": {
          "line": 132,
          "column": 4
        },
        "end": {
          "line": 132,
          "column": 30
        }
      },
      "64": {
        "start": {
          "line": 134,
          "column": 4
        },
        "end": {
          "line": 134,
          "column": 18
        }
      },
      "65": {
        "start": {
          "line": 138,
          "column": 24
        },
        "end": {
          "line": 138,
          "column": 26
        }
      },
      "66": {
        "start": {
          "line": 141,
          "column": 4
        },
        "end": {
          "line": 146,
          "column": 7
        }
      },
      "67": {
        "start": {
          "line": 142,
          "column": 6
        },
        "end": {
          "line": 144,
          "column": 7
        }
      },
      "68": {
        "start": {
          "line": 143,
          "column": 8
        },
        "end": {
          "line": 143,
          "column": 30
        }
      },
      "69": {
        "start": {
          "line": 145,
          "column": 6
        },
        "end": {
          "line": 145,
          "column": 42
        }
      },
      "70": {
        "start": {
          "line": 148,
          "column": 24
        },
        "end": {
          "line": 148,
          "column": 26
        }
      },
      "71": {
        "start": {
          "line": 151,
          "column": 4
        },
        "end": {
          "line": 156,
          "column": 5
        }
      },
      "72": {
        "start": {
          "line": 152,
          "column": 27
        },
        "end": {
          "line": 152,
          "column": 56
        }
      },
      "73": {
        "start": {
          "line": 153,
          "column": 6
        },
        "end": {
          "line": 155,
          "column": 9
        }
      },
      "74": {
        "start": {
          "line": 154,
          "column": 8
        },
        "end": {
          "line": 154,
          "column": 62
        }
      },
      "75": {
        "start": {
          "line": 158,
          "column": 4
        },
        "end": {
          "line": 158,
          "column": 23
        }
      },
      "76": {
        "start": {
          "line": 161,
          "column": 22
        },
        "end": {
          "line": 161,
          "column": 46
        }
      },
      "77": {
        "start": {
          "line": 162,
          "column": 2
        },
        "end": {
          "line": 162,
          "column": 21
        }
      },
      "78": {
        "start": {
          "line": 166,
          "column": 2
        },
        "end": {
          "line": 166,
          "column": 58
        }
      },
      "79": {
        "start": {
          "line": 171,
          "column": 2
        },
        "end": {
          "line": 177,
          "column": 4
        }
      },
      "80": {
        "start": {
          "line": 182,
          "column": 2
        },
        "end": {
          "line": 184,
          "column": 3
        }
      },
      "81": {
        "start": {
          "line": 183,
          "column": 4
        },
        "end": {
          "line": 183,
          "column": 14
        }
      },
      "82": {
        "start": {
          "line": 187,
          "column": 2
        },
        "end": {
          "line": 187,
          "column": 40
        }
      },
      "83": {
        "start": {
          "line": 187,
          "column": 27
        },
        "end": {
          "line": 187,
          "column": 38
        }
      },
      "84": {
        "start": {
          "line": 190,
          "column": 17
        },
        "end": {
          "line": 190,
          "column": 19
        }
      },
      "85": {
        "start": {
          "line": 191,
          "column": 35
        },
        "end": {
          "line": 191,
          "column": 47
        }
      },
      "86": {
        "start": {
          "line": 193,
          "column": 2
        },
        "end": {
          "line": 202,
          "column": 3
        }
      },
      "87": {
        "start": {
          "line": 194,
          "column": 4
        },
        "end": {
          "line": 201,
          "column": 5
        }
      },
      "88": {
        "start": {
          "line": 196,
          "column": 6
        },
        "end": {
          "line": 196,
          "column": 45
        }
      },
      "89": {
        "start": {
          "line": 199,
          "column": 6
        },
        "end": {
          "line": 199,
          "column": 46
        }
      },
      "90": {
        "start": {
          "line": 200,
          "column": 6
        },
        "end": {
          "line": 200,
          "column": 48
        }
      },
      "91": {
        "start": {
          "line": 205,
          "column": 2
        },
        "end": {
          "line": 205,
          "column": 42
        }
      },
      "92": {
        "start": {
          "line": 207,
          "column": 2
        },
        "end": {
          "line": 207,
          "column": 16
        }
      }
    }
  }
}