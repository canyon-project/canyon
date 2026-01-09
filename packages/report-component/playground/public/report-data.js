window.reportData = {
  type: 'istanbuljs',
  reportPath: 'coverage/index.html',
  version: '1.0.0',
  watermarks: {
    bytes: [50, 80],
    statements: [50, 80],
    branches: [50, 80],
    functions: [50, 80],
    lines: [50, 80],
  },
  summary: {},
  instrumentCwd: '/Users/travzhang/github.com/istanbuljs/istanbuljs',
  files: [
    {
      diff: {
        additions: [1, 2, 3],
        deletions: [4, 5, 6],
      },
      source:
        "/*\n Copyright 2012-2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst { MapStore } = require('./lib/map-store');\n/**\n * @module Exports\n */\nmodule.exports = {\n    createSourceMapStore(opts) {\n        return new MapStore(opts);\n    }\n};\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/index.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 21,
          },
          end: {
            line: 7,
            column: 47,
          },
        },
        1: {
          start: {
            line: 11,
            column: 0,
          },
          end: {
            line: 15,
            column: 2,
          },
        },
        2: {
          start: {
            line: 13,
            column: 8,
          },
          end: {
            line: 13,
            column: 34,
          },
        },
      },
      fnMap: {
        0: {
          name: '(anonymous_0)',
          decl: {
            start: {
              line: 12,
              column: 4,
            },
            end: {
              line: 12,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 12,
              column: 31,
            },
            end: {
              line: 14,
              column: 5,
            },
          },
          line: 12,
        },
      },
      branchMap: {},
      s: {
        0: 1,
        1: 1,
        2: 0,
      },
      f: {
        0: 0,
      },
      b: {},
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst pathutils = require('./pathutils');\nconst {\n    originalPositionFor,\n    allGeneratedPositionsFor,\n    GREATEST_LOWER_BOUND,\n    LEAST_UPPER_BOUND\n} = require('@jridgewell/trace-mapping');\n\n/**\n * AST ranges are inclusive for start positions and exclusive for end positions.\n * Source maps are also logically ranges over text, though interacting with\n * them is generally achieved by working with explicit positions.\n *\n * When finding the _end_ location of an AST item, the range behavior is\n * important because what we're asking for is the _end_ of whatever range\n * corresponds to the end location we seek.\n *\n * This boils down to the following steps, conceptually, though the source-map\n * library doesn't expose primitives to do this nicely:\n *\n * 1. Find the range on the generated file that ends at, or exclusively\n *    contains the end position of the AST node.\n * 2. Find the range on the original file that corresponds to\n *    that generated range.\n * 3. Find the _end_ location of that original range.\n */\nfunction originalEndPositionFor(sourceMap, generatedEnd) {\n    // Given the generated location, find the original location of the mapping\n    // that corresponds to a range on the generated file that overlaps the\n    // generated file end location. Note however that this position on its\n    // own is not useful because it is the position of the _start_ of the range\n    // on the original file, and we want the _end_ of the range.\n    const beforeEndMapping = originalPositionTryBoth(\n        sourceMap,\n        generatedEnd.line,\n        generatedEnd.column - 1\n    );\n    if (beforeEndMapping.source === null) {\n        return null;\n    }\n\n    // Convert that original position back to a generated one, with a bump\n    // to the right, and a rightward bias. Since 'generatedPositionFor' searches\n    // for mappings in the original-order sorted list, this will find the\n    // mapping that corresponds to the one immediately after the\n    // beforeEndMapping mapping.\n    const afterEndMappings = allGeneratedPositionsFor(sourceMap, {\n        source: beforeEndMapping.source,\n        line: beforeEndMapping.line,\n        column: beforeEndMapping.column + 1,\n        bias: LEAST_UPPER_BOUND\n    });\n\n    for (let i = 0; i < afterEndMappings.length; i++) {\n        const afterEndMapping = afterEndMappings[i];\n        if (afterEndMapping.line === null) continue;\n\n        const original = originalPositionFor(sourceMap, afterEndMapping);\n        // If the lines match, it means that something comes after our mapping,\n        // so it must end where this one begins.\n        if (original.line === beforeEndMapping.line) return original;\n    }\n\n    // If a generated mapping wasn't found (or all that were found were not on\n    // the same line), then there's nothing after this range and we can\n    // consider it to extend to infinity.\n    return {\n        source: beforeEndMapping.source,\n        line: beforeEndMapping.line,\n        column: Infinity\n    };\n}\n\n/**\n * Attempts to determine the original source position, first\n * returning the closest element to the left (GREATEST_LOWER_BOUND),\n * and next returning the closest element to the right (LEAST_UPPER_BOUND).\n */\nfunction originalPositionTryBoth(sourceMap, line, column) {\n    const mapping = originalPositionFor(sourceMap, {\n        line,\n        column,\n        bias: GREATEST_LOWER_BOUND\n    });\n    if (mapping.source === null) {\n        return originalPositionFor(sourceMap, {\n            line,\n            column,\n            bias: LEAST_UPPER_BOUND\n        });\n    } else {\n        return mapping;\n    }\n}\n\nfunction isInvalidPosition(pos) {\n    return (\n        !pos ||\n        typeof pos.line !== 'number' ||\n        typeof pos.column !== 'number' ||\n        pos.line < 0 ||\n        pos.column < 0\n    );\n}\n\n/**\n * determines the original position for a given location\n * @param  {SourceMapConsumer} sourceMap the source map\n * @param  {Object} generatedLocation the original location Object\n * @returns {Object} the remapped location Object\n */\nfunction getMapping(sourceMap, generatedLocation, origFile) {\n    if (!generatedLocation) {\n        return null;\n    }\n\n    if (\n        isInvalidPosition(generatedLocation.start) ||\n        isInvalidPosition(generatedLocation.end)\n    ) {\n        return null;\n    }\n\n    const start = originalPositionTryBoth(\n        sourceMap,\n        generatedLocation.start.line,\n        generatedLocation.start.column\n    );\n    let end = originalEndPositionFor(sourceMap, generatedLocation.end);\n\n    /* istanbul ignore if: edge case too hard to test for */\n    if (!(start && end)) {\n        return null;\n    }\n\n    if (!(start.source && end.source)) {\n        return null;\n    }\n\n    if (start.source !== end.source) {\n        return null;\n    }\n\n    /* istanbul ignore if: edge case too hard to test for */\n    if (start.line === null || start.column === null) {\n        return null;\n    }\n\n    /* istanbul ignore if: edge case too hard to test for */\n    if (end.line === null || end.column === null) {\n        return null;\n    }\n\n    if (start.line === end.line && start.column === end.column) {\n        end = originalPositionFor(sourceMap, {\n            line: generatedLocation.end.line,\n            column: generatedLocation.end.column,\n            bias: LEAST_UPPER_BOUND\n        });\n        end.column -= 1;\n    }\n\n    return {\n        source: pathutils.relativeTo(start.source, origFile),\n        loc: {\n            start: {\n                line: start.line,\n                column: start.column\n            },\n            end: {\n                line: end.line,\n                column: end.column\n            }\n        }\n    };\n}\n\nmodule.exports = getMapping;\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/get-mapping.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 18,
          },
          end: {
            line: 7,
            column: 40,
          },
        },
        1: {
          start: {
            line: 13,
            column: 4,
          },
          end: {
            line: 13,
            column: 40,
          },
        },
        2: {
          start: {
            line: 39,
            column: 29,
          },
          end: {
            line: 43,
            column: 5,
          },
        },
        3: {
          start: {
            line: 44,
            column: 4,
          },
          end: {
            line: 46,
            column: 5,
          },
        },
        4: {
          start: {
            line: 45,
            column: 8,
          },
          end: {
            line: 45,
            column: 20,
          },
        },
        5: {
          start: {
            line: 53,
            column: 29,
          },
          end: {
            line: 58,
            column: 6,
          },
        },
        6: {
          start: {
            line: 60,
            column: 4,
          },
          end: {
            line: 68,
            column: 5,
          },
        },
        7: {
          start: {
            line: 60,
            column: 17,
          },
          end: {
            line: 60,
            column: 18,
          },
        },
        8: {
          start: {
            line: 61,
            column: 32,
          },
          end: {
            line: 61,
            column: 51,
          },
        },
        9: {
          start: {
            line: 62,
            column: 8,
          },
          end: {
            line: 62,
            column: 52,
          },
        },
        10: {
          start: {
            line: 62,
            column: 43,
          },
          end: {
            line: 62,
            column: 52,
          },
        },
        11: {
          start: {
            line: 64,
            column: 25,
          },
          end: {
            line: 64,
            column: 72,
          },
        },
        12: {
          start: {
            line: 67,
            column: 8,
          },
          end: {
            line: 67,
            column: 69,
          },
        },
        13: {
          start: {
            line: 67,
            column: 53,
          },
          end: {
            line: 67,
            column: 69,
          },
        },
        14: {
          start: {
            line: 73,
            column: 4,
          },
          end: {
            line: 77,
            column: 6,
          },
        },
        15: {
          start: {
            line: 86,
            column: 20,
          },
          end: {
            line: 90,
            column: 6,
          },
        },
        16: {
          start: {
            line: 91,
            column: 4,
          },
          end: {
            line: 99,
            column: 5,
          },
        },
        17: {
          start: {
            line: 92,
            column: 8,
          },
          end: {
            line: 96,
            column: 11,
          },
        },
        18: {
          start: {
            line: 98,
            column: 8,
          },
          end: {
            line: 98,
            column: 23,
          },
        },
        19: {
          start: {
            line: 103,
            column: 4,
          },
          end: {
            line: 109,
            column: 6,
          },
        },
        20: {
          start: {
            line: 119,
            column: 4,
          },
          end: {
            line: 121,
            column: 5,
          },
        },
        21: {
          start: {
            line: 120,
            column: 8,
          },
          end: {
            line: 120,
            column: 20,
          },
        },
        22: {
          start: {
            line: 123,
            column: 4,
          },
          end: {
            line: 128,
            column: 5,
          },
        },
        23: {
          start: {
            line: 127,
            column: 8,
          },
          end: {
            line: 127,
            column: 20,
          },
        },
        24: {
          start: {
            line: 130,
            column: 18,
          },
          end: {
            line: 134,
            column: 5,
          },
        },
        25: {
          start: {
            line: 135,
            column: 14,
          },
          end: {
            line: 135,
            column: 70,
          },
        },
        26: {
          start: {
            line: 138,
            column: 4,
          },
          end: {
            line: 140,
            column: 5,
          },
        },
        27: {
          start: {
            line: 142,
            column: 4,
          },
          end: {
            line: 144,
            column: 5,
          },
        },
        28: {
          start: {
            line: 143,
            column: 8,
          },
          end: {
            line: 143,
            column: 20,
          },
        },
        29: {
          start: {
            line: 146,
            column: 4,
          },
          end: {
            line: 148,
            column: 5,
          },
        },
        30: {
          start: {
            line: 147,
            column: 8,
          },
          end: {
            line: 147,
            column: 20,
          },
        },
        31: {
          start: {
            line: 151,
            column: 4,
          },
          end: {
            line: 153,
            column: 5,
          },
        },
        32: {
          start: {
            line: 156,
            column: 4,
          },
          end: {
            line: 158,
            column: 5,
          },
        },
        33: {
          start: {
            line: 160,
            column: 4,
          },
          end: {
            line: 167,
            column: 5,
          },
        },
        34: {
          start: {
            line: 161,
            column: 8,
          },
          end: {
            line: 165,
            column: 11,
          },
        },
        35: {
          start: {
            line: 166,
            column: 8,
          },
          end: {
            line: 166,
            column: 24,
          },
        },
        36: {
          start: {
            line: 169,
            column: 4,
          },
          end: {
            line: 181,
            column: 6,
          },
        },
        37: {
          start: {
            line: 184,
            column: 0,
          },
          end: {
            line: 184,
            column: 28,
          },
        },
      },
      fnMap: {
        0: {
          name: 'originalEndPositionFor',
          decl: {
            start: {
              line: 33,
              column: 9,
            },
            end: {
              line: 33,
              column: 31,
            },
          },
          loc: {
            start: {
              line: 33,
              column: 57,
            },
            end: {
              line: 78,
              column: 1,
            },
          },
          line: 33,
        },
        1: {
          name: 'originalPositionTryBoth',
          decl: {
            start: {
              line: 85,
              column: 9,
            },
            end: {
              line: 85,
              column: 32,
            },
          },
          loc: {
            start: {
              line: 85,
              column: 58,
            },
            end: {
              line: 100,
              column: 1,
            },
          },
          line: 85,
        },
        2: {
          name: 'isInvalidPosition',
          decl: {
            start: {
              line: 102,
              column: 9,
            },
            end: {
              line: 102,
              column: 26,
            },
          },
          loc: {
            start: {
              line: 102,
              column: 32,
            },
            end: {
              line: 110,
              column: 1,
            },
          },
          line: 102,
        },
        3: {
          name: 'getMapping',
          decl: {
            start: {
              line: 118,
              column: 9,
            },
            end: {
              line: 118,
              column: 19,
            },
          },
          loc: {
            start: {
              line: 118,
              column: 60,
            },
            end: {
              line: 182,
              column: 1,
            },
          },
          line: 118,
        },
      },
      branchMap: {
        0: {
          loc: {
            start: {
              line: 44,
              column: 4,
            },
            end: {
              line: 46,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 44,
                column: 4,
              },
              end: {
                line: 46,
                column: 5,
              },
            },
            {
              start: {
                line: 44,
                column: 4,
              },
              end: {
                line: 46,
                column: 5,
              },
            },
          ],
          line: 44,
        },
        1: {
          loc: {
            start: {
              line: 62,
              column: 8,
            },
            end: {
              line: 62,
              column: 52,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 62,
                column: 8,
              },
              end: {
                line: 62,
                column: 52,
              },
            },
            {
              start: {
                line: 62,
                column: 8,
              },
              end: {
                line: 62,
                column: 52,
              },
            },
          ],
          line: 62,
        },
        2: {
          loc: {
            start: {
              line: 67,
              column: 8,
            },
            end: {
              line: 67,
              column: 69,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 67,
                column: 8,
              },
              end: {
                line: 67,
                column: 69,
              },
            },
            {
              start: {
                line: 67,
                column: 8,
              },
              end: {
                line: 67,
                column: 69,
              },
            },
          ],
          line: 67,
        },
        3: {
          loc: {
            start: {
              line: 91,
              column: 4,
            },
            end: {
              line: 99,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 91,
                column: 4,
              },
              end: {
                line: 99,
                column: 5,
              },
            },
            {
              start: {
                line: 91,
                column: 4,
              },
              end: {
                line: 99,
                column: 5,
              },
            },
          ],
          line: 91,
        },
        4: {
          loc: {
            start: {
              line: 104,
              column: 8,
            },
            end: {
              line: 108,
              column: 22,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 104,
                column: 8,
              },
              end: {
                line: 104,
                column: 12,
              },
            },
            {
              start: {
                line: 105,
                column: 8,
              },
              end: {
                line: 105,
                column: 36,
              },
            },
            {
              start: {
                line: 106,
                column: 8,
              },
              end: {
                line: 106,
                column: 38,
              },
            },
            {
              start: {
                line: 107,
                column: 8,
              },
              end: {
                line: 107,
                column: 20,
              },
            },
            {
              start: {
                line: 108,
                column: 8,
              },
              end: {
                line: 108,
                column: 22,
              },
            },
          ],
          line: 104,
        },
        5: {
          loc: {
            start: {
              line: 119,
              column: 4,
            },
            end: {
              line: 121,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 119,
                column: 4,
              },
              end: {
                line: 121,
                column: 5,
              },
            },
            {
              start: {
                line: 119,
                column: 4,
              },
              end: {
                line: 121,
                column: 5,
              },
            },
          ],
          line: 119,
        },
        6: {
          loc: {
            start: {
              line: 123,
              column: 4,
            },
            end: {
              line: 128,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 123,
                column: 4,
              },
              end: {
                line: 128,
                column: 5,
              },
            },
            {
              start: {
                line: 123,
                column: 4,
              },
              end: {
                line: 128,
                column: 5,
              },
            },
          ],
          line: 123,
        },
        7: {
          loc: {
            start: {
              line: 124,
              column: 8,
            },
            end: {
              line: 125,
              column: 48,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 124,
                column: 8,
              },
              end: {
                line: 124,
                column: 50,
              },
            },
            {
              start: {
                line: 125,
                column: 8,
              },
              end: {
                line: 125,
                column: 48,
              },
            },
          ],
          line: 124,
        },
        8: {
          loc: {
            start: {
              line: 138,
              column: 4,
            },
            end: {
              line: 140,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 138,
                column: 4,
              },
              end: {
                line: 140,
                column: 5,
              },
            },
          ],
          line: 138,
        },
        9: {
          loc: {
            start: {
              line: 138,
              column: 10,
            },
            end: {
              line: 138,
              column: 22,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 138,
                column: 10,
              },
              end: {
                line: 138,
                column: 15,
              },
            },
            {
              start: {
                line: 138,
                column: 19,
              },
              end: {
                line: 138,
                column: 22,
              },
            },
          ],
          line: 138,
        },
        10: {
          loc: {
            start: {
              line: 142,
              column: 4,
            },
            end: {
              line: 144,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 142,
                column: 4,
              },
              end: {
                line: 144,
                column: 5,
              },
            },
            {
              start: {
                line: 142,
                column: 4,
              },
              end: {
                line: 144,
                column: 5,
              },
            },
          ],
          line: 142,
        },
        11: {
          loc: {
            start: {
              line: 142,
              column: 10,
            },
            end: {
              line: 142,
              column: 36,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 142,
                column: 10,
              },
              end: {
                line: 142,
                column: 22,
              },
            },
            {
              start: {
                line: 142,
                column: 26,
              },
              end: {
                line: 142,
                column: 36,
              },
            },
          ],
          line: 142,
        },
        12: {
          loc: {
            start: {
              line: 146,
              column: 4,
            },
            end: {
              line: 148,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 146,
                column: 4,
              },
              end: {
                line: 148,
                column: 5,
              },
            },
            {
              start: {
                line: 146,
                column: 4,
              },
              end: {
                line: 148,
                column: 5,
              },
            },
          ],
          line: 146,
        },
        13: {
          loc: {
            start: {
              line: 151,
              column: 4,
            },
            end: {
              line: 153,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 151,
                column: 4,
              },
              end: {
                line: 153,
                column: 5,
              },
            },
          ],
          line: 151,
        },
        14: {
          loc: {
            start: {
              line: 151,
              column: 8,
            },
            end: {
              line: 151,
              column: 52,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 151,
                column: 8,
              },
              end: {
                line: 151,
                column: 27,
              },
            },
            {
              start: {
                line: 151,
                column: 31,
              },
              end: {
                line: 151,
                column: 52,
              },
            },
          ],
          line: 151,
        },
        15: {
          loc: {
            start: {
              line: 156,
              column: 4,
            },
            end: {
              line: 158,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 156,
                column: 4,
              },
              end: {
                line: 158,
                column: 5,
              },
            },
          ],
          line: 156,
        },
        16: {
          loc: {
            start: {
              line: 156,
              column: 8,
            },
            end: {
              line: 156,
              column: 48,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 156,
                column: 8,
              },
              end: {
                line: 156,
                column: 25,
              },
            },
            {
              start: {
                line: 156,
                column: 29,
              },
              end: {
                line: 156,
                column: 48,
              },
            },
          ],
          line: 156,
        },
        17: {
          loc: {
            start: {
              line: 160,
              column: 4,
            },
            end: {
              line: 167,
              column: 5,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 160,
                column: 4,
              },
              end: {
                line: 167,
                column: 5,
              },
            },
            {
              start: {
                line: 160,
                column: 4,
              },
              end: {
                line: 167,
                column: 5,
              },
            },
          ],
          line: 160,
        },
        18: {
          loc: {
            start: {
              line: 160,
              column: 8,
            },
            end: {
              line: 160,
              column: 62,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 160,
                column: 8,
              },
              end: {
                line: 160,
                column: 31,
              },
            },
            {
              start: {
                line: 160,
                column: 35,
              },
              end: {
                line: 160,
                column: 62,
              },
            },
          ],
          line: 160,
        },
      },
      s: {
        0: 1,
        1: 1,
        2: 76,
        3: 76,
        4: 39,
        5: 37,
        6: 37,
        7: 37,
        8: 20,
        9: 20,
        10: 0,
        11: 20,
        12: 20,
        13: 20,
        14: 17,
        15: 152,
        16: 152,
        17: 78,
        18: 74,
        19: 157,
        20: 81,
        21: 0,
        22: 81,
        23: 5,
        24: 76,
        25: 76,
        26: 76,
        27: 37,
        28: 0,
        29: 37,
        30: 0,
        31: 37,
        32: 37,
        33: 37,
        34: 0,
        35: 0,
        36: 37,
        37: 1,
      },
      f: {
        0: 76,
        1: 152,
        2: 157,
        3: 81,
      },
      b: {
        0: [39, 37],
        1: [0, 20],
        2: [20, 0],
        3: [78, 74],
        4: [157, 157, 152, 152, 152],
        5: [0, 81],
        6: [5, 76],
        7: [81, 76],
        8: [37],
        9: [76, 76],
        10: [0, 37],
        11: [37, 37],
        12: [0, 37],
        13: [37],
        14: [37, 37],
        15: [37],
        16: [37, 37],
        17: [0, 37],
        18: [37, 20],
      },
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst path = require('path');\nconst fs = require('fs');\nconst debug = require('debug')('istanbuljs');\nconst { TraceMap, sourceContentFor } = require('@jridgewell/trace-mapping');\nconst pathutils = require('./pathutils');\nconst { SourceMapTransformer } = require('./transformer');\n\n/**\n * Tracks source maps for registered files\n */\nclass MapStore {\n    /**\n     * @param {Object} opts [opts=undefined] options.\n     * @param {Boolean} opts.verbose [opts.verbose=false] verbose mode\n     * @param {String} opts.baseDir [opts.baseDir=null] alternate base directory\n     *  to resolve sourcemap files\n     * @param {Class} opts.SourceStore [opts.SourceStore=Map] class to use for\n     * SourceStore.  Must support `get`, `set` and `clear` methods.\n     * @param {Array} opts.sourceStoreOpts [opts.sourceStoreOpts=[]] arguments\n     * to use in the SourceStore constructor.\n     * @constructor\n     */\n    constructor(opts) {\n        opts = {\n            baseDir: null,\n            verbose: false,\n            SourceStore: Map,\n            sourceStoreOpts: [],\n            ...opts\n        };\n        this.baseDir = opts.baseDir;\n        this.verbose = opts.verbose;\n        this.sourceStore = new opts.SourceStore(...opts.sourceStoreOpts);\n        this.data = Object.create(null);\n        this.sourceFinder = this.sourceFinder.bind(this);\n    }\n\n    /**\n     * Registers a source map URL with this store. It makes some input sanity checks\n     * and silently fails on malformed input.\n     * @param transformedFilePath - the file path for which the source map is valid.\n     *  This must *exactly* match the path stashed for the coverage object to be\n     *  useful.\n     * @param sourceMapUrl - the source map URL, **not** a comment\n     */\n    registerURL(transformedFilePath, sourceMapUrl) {\n        const d = 'data:';\n\n        if (\n            sourceMapUrl.length > d.length &&\n            sourceMapUrl.substring(0, d.length) === d\n        ) {\n            const b64 = 'base64,';\n            const pos = sourceMapUrl.indexOf(b64);\n            if (pos > 0) {\n                this.data[transformedFilePath] = {\n                    type: 'encoded',\n                    data: sourceMapUrl.substring(pos + b64.length)\n                };\n            } else {\n                debug(`Unable to interpret source map URL: ${sourceMapUrl}`);\n            }\n\n            return;\n        }\n\n        const dir = path.dirname(path.resolve(transformedFilePath));\n        const file = path.resolve(dir, sourceMapUrl);\n        this.data[transformedFilePath] = { type: 'file', data: file };\n    }\n\n    /**\n     * Registers a source map object with this store. Makes some basic sanity checks\n     * and silently fails on malformed input.\n     * @param transformedFilePath - the file path for which the source map is valid\n     * @param sourceMap - the source map object\n     */\n    registerMap(transformedFilePath, sourceMap) {\n        if (sourceMap && sourceMap.version) {\n            this.data[transformedFilePath] = {\n                type: 'object',\n                data: sourceMap\n            };\n        } else {\n            debug(\n                'Invalid source map object: ' +\n                    JSON.stringify(sourceMap, null, 2)\n            );\n        }\n    }\n\n    /**\n     * Retrieve a source map object from this store.\n     * @param filePath - the file path for which the source map is valid\n     * @returns {Object} a parsed source map object\n     */\n    getSourceMapSync(filePath) {\n        try {\n            if (!this.data[filePath]) {\n                return;\n            }\n\n            const d = this.data[filePath];\n            if (d.type === 'file') {\n                return JSON.parse(fs.readFileSync(d.data, 'utf8'));\n            }\n\n            if (d.type === 'encoded') {\n                return JSON.parse(Buffer.from(d.data, 'base64').toString());\n            }\n\n            /* The caller might delete properties */\n            return {\n                ...d.data\n            };\n        } catch (error) {\n            debug('Error returning source map for ' + filePath);\n            debug(error.stack);\n\n            return;\n        }\n    }\n\n    /**\n     * Add inputSourceMap property to coverage data\n     * @param coverageData - the __coverage__ object\n     * @returns {Object} a parsed source map object\n     */\n    addInputSourceMapsSync(coverageData) {\n        Object.entries(coverageData).forEach(([filePath, data]) => {\n            if (data.inputSourceMap) {\n                return;\n            }\n\n            const sourceMap = this.getSourceMapSync(filePath);\n            if (sourceMap) {\n                data.inputSourceMap = sourceMap;\n                /* This huge property is not needed. */\n                delete data.inputSourceMap.sourcesContent;\n            }\n        });\n    }\n\n    sourceFinder(filePath) {\n        const content = this.sourceStore.get(filePath);\n        if (content !== undefined) {\n            return content;\n        }\n\n        if (path.isAbsolute(filePath)) {\n            return fs.readFileSync(filePath, 'utf8');\n        }\n\n        return fs.readFileSync(\n            pathutils.asAbsolute(filePath, this.baseDir),\n            'utf8'\n        );\n    }\n\n    /**\n     * Transforms the coverage map provided into one that refers to original\n     * sources when valid mappings have been registered with this store.\n     * @param {CoverageMap} coverageMap - the coverage map to transform\n     * @returns {Promise<CoverageMap>} the transformed coverage map\n     */\n    async transformCoverage(coverageMap) {\n        const hasInputSourceMaps = coverageMap\n            .files()\n            .some(\n                file => coverageMap.fileCoverageFor(file).data.inputSourceMap\n            );\n\n        if (!hasInputSourceMaps && Object.keys(this.data).length === 0) {\n            return coverageMap;\n        }\n\n        const transformer = new SourceMapTransformer(\n            async (filePath, coverage) => {\n                try {\n                    const obj =\n                        coverage.data.inputSourceMap ||\n                        this.getSourceMapSync(filePath);\n                    if (!obj) {\n                        return null;\n                    }\n\n                    const smc = new TraceMap(obj);\n                    smc.sources.forEach(s => {\n                        if (s) {\n                            const content = sourceContentFor(smc, s);\n                            if (content) {\n                                const sourceFilePath = pathutils.relativeTo(\n                                    s,\n                                    filePath\n                                );\n                                this.sourceStore.set(sourceFilePath, content);\n                            }\n                        }\n                    });\n\n                    return smc;\n                } catch (error) {\n                    debug('Error returning source map for ' + filePath);\n                    debug(error.stack);\n\n                    return null;\n                }\n            }\n        );\n\n        return await transformer.transform(coverageMap);\n    }\n\n    /**\n     * Disposes temporary resources allocated by this map store\n     */\n    dispose() {\n        this.sourceStore.clear();\n    }\n}\n\nmodule.exports = { MapStore };\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/map-store.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 13,
          },
          end: {
            line: 7,
            column: 28,
          },
        },
        1: {
          start: {
            line: 8,
            column: 11,
          },
          end: {
            line: 8,
            column: 24,
          },
        },
        2: {
          start: {
            line: 9,
            column: 14,
          },
          end: {
            line: 9,
            column: 44,
          },
        },
        3: {
          start: {
            line: 10,
            column: 39,
          },
          end: {
            line: 10,
            column: 75,
          },
        },
        4: {
          start: {
            line: 11,
            column: 18,
          },
          end: {
            line: 11,
            column: 40,
          },
        },
        5: {
          start: {
            line: 12,
            column: 33,
          },
          end: {
            line: 12,
            column: 57,
          },
        },
        6: {
          start: {
            line: 30,
            column: 8,
          },
          end: {
            line: 36,
            column: 10,
          },
        },
        7: {
          start: {
            line: 37,
            column: 8,
          },
          end: {
            line: 37,
            column: 36,
          },
        },
        8: {
          start: {
            line: 38,
            column: 8,
          },
          end: {
            line: 38,
            column: 36,
          },
        },
        9: {
          start: {
            line: 39,
            column: 8,
          },
          end: {
            line: 39,
            column: 73,
          },
        },
        10: {
          start: {
            line: 40,
            column: 8,
          },
          end: {
            line: 40,
            column: 40,
          },
        },
        11: {
          start: {
            line: 41,
            column: 8,
          },
          end: {
            line: 41,
            column: 57,
          },
        },
        12: {
          start: {
            line: 53,
            column: 18,
          },
          end: {
            line: 53,
            column: 25,
          },
        },
        13: {
          start: {
            line: 55,
            column: 8,
          },
          end: {
            line: 71,
            column: 9,
          },
        },
        14: {
          start: {
            line: 59,
            column: 24,
          },
          end: {
            line: 59,
            column: 33,
          },
        },
        15: {
          start: {
            line: 60,
            column: 24,
          },
          end: {
            line: 60,
            column: 49,
          },
        },
        16: {
          start: {
            line: 61,
            column: 12,
          },
          end: {
            line: 68,
            column: 13,
          },
        },
        17: {
          start: {
            line: 62,
            column: 16,
          },
          end: {
            line: 65,
            column: 18,
          },
        },
        18: {
          start: {
            line: 67,
            column: 16,
          },
          end: {
            line: 67,
            column: 77,
          },
        },
        19: {
          start: {
            line: 70,
            column: 12,
          },
          end: {
            line: 70,
            column: 19,
          },
        },
        20: {
          start: {
            line: 73,
            column: 20,
          },
          end: {
            line: 73,
            column: 67,
          },
        },
        21: {
          start: {
            line: 74,
            column: 21,
          },
          end: {
            line: 74,
            column: 52,
          },
        },
        22: {
          start: {
            line: 75,
            column: 8,
          },
          end: {
            line: 75,
            column: 70,
          },
        },
        23: {
          start: {
            line: 85,
            column: 8,
          },
          end: {
            line: 95,
            column: 9,
          },
        },
        24: {
          start: {
            line: 86,
            column: 12,
          },
          end: {
            line: 89,
            column: 14,
          },
        },
        25: {
          start: {
            line: 91,
            column: 12,
          },
          end: {
            line: 94,
            column: 14,
          },
        },
        26: {
          start: {
            line: 104,
            column: 8,
          },
          end: {
            line: 127,
            column: 9,
          },
        },
        27: {
          start: {
            line: 105,
            column: 12,
          },
          end: {
            line: 107,
            column: 13,
          },
        },
        28: {
          start: {
            line: 106,
            column: 16,
          },
          end: {
            line: 106,
            column: 23,
          },
        },
        29: {
          start: {
            line: 109,
            column: 22,
          },
          end: {
            line: 109,
            column: 41,
          },
        },
        30: {
          start: {
            line: 110,
            column: 12,
          },
          end: {
            line: 112,
            column: 13,
          },
        },
        31: {
          start: {
            line: 111,
            column: 16,
          },
          end: {
            line: 111,
            column: 67,
          },
        },
        32: {
          start: {
            line: 114,
            column: 12,
          },
          end: {
            line: 116,
            column: 13,
          },
        },
        33: {
          start: {
            line: 115,
            column: 16,
          },
          end: {
            line: 115,
            column: 76,
          },
        },
        34: {
          start: {
            line: 119,
            column: 12,
          },
          end: {
            line: 121,
            column: 14,
          },
        },
        35: {
          start: {
            line: 123,
            column: 12,
          },
          end: {
            line: 123,
            column: 64,
          },
        },
        36: {
          start: {
            line: 124,
            column: 12,
          },
          end: {
            line: 124,
            column: 31,
          },
        },
        37: {
          start: {
            line: 126,
            column: 12,
          },
          end: {
            line: 126,
            column: 19,
          },
        },
        38: {
          start: {
            line: 136,
            column: 8,
          },
          end: {
            line: 147,
            column: 11,
          },
        },
        39: {
          start: {
            line: 137,
            column: 12,
          },
          end: {
            line: 139,
            column: 13,
          },
        },
        40: {
          start: {
            line: 138,
            column: 16,
          },
          end: {
            line: 138,
            column: 23,
          },
        },
        41: {
          start: {
            line: 141,
            column: 30,
          },
          end: {
            line: 141,
            column: 61,
          },
        },
        42: {
          start: {
            line: 142,
            column: 12,
          },
          end: {
            line: 146,
            column: 13,
          },
        },
        43: {
          start: {
            line: 143,
            column: 16,
          },
          end: {
            line: 143,
            column: 48,
          },
        },
        44: {
          start: {
            line: 145,
            column: 16,
          },
          end: {
            line: 145,
            column: 58,
          },
        },
        45: {
          start: {
            line: 151,
            column: 24,
          },
          end: {
            line: 151,
            column: 54,
          },
        },
        46: {
          start: {
            line: 152,
            column: 8,
          },
          end: {
            line: 154,
            column: 9,
          },
        },
        47: {
          start: {
            line: 153,
            column: 12,
          },
          end: {
            line: 153,
            column: 27,
          },
        },
        48: {
          start: {
            line: 156,
            column: 8,
          },
          end: {
            line: 158,
            column: 9,
          },
        },
        49: {
          start: {
            line: 157,
            column: 12,
          },
          end: {
            line: 157,
            column: 53,
          },
        },
        50: {
          start: {
            line: 160,
            column: 8,
          },
          end: {
            line: 163,
            column: 10,
          },
        },
        51: {
          start: {
            line: 173,
            column: 35,
          },
          end: {
            line: 177,
            column: 13,
          },
        },
        52: {
          start: {
            line: 176,
            column: 24,
          },
          end: {
            line: 176,
            column: 77,
          },
        },
        53: {
          start: {
            line: 179,
            column: 8,
          },
          end: {
            line: 181,
            column: 9,
          },
        },
        54: {
          start: {
            line: 180,
            column: 12,
          },
          end: {
            line: 180,
            column: 31,
          },
        },
        55: {
          start: {
            line: 183,
            column: 28,
          },
          end: {
            line: 215,
            column: 9,
          },
        },
        56: {
          start: {
            line: 185,
            column: 16,
          },
          end: {
            line: 213,
            column: 17,
          },
        },
        57: {
          start: {
            line: 187,
            column: 24,
          },
          end: {
            line: 188,
            column: 55,
          },
        },
        58: {
          start: {
            line: 189,
            column: 20,
          },
          end: {
            line: 191,
            column: 21,
          },
        },
        59: {
          start: {
            line: 190,
            column: 24,
          },
          end: {
            line: 190,
            column: 36,
          },
        },
        60: {
          start: {
            line: 193,
            column: 32,
          },
          end: {
            line: 193,
            column: 49,
          },
        },
        61: {
          start: {
            line: 194,
            column: 20,
          },
          end: {
            line: 205,
            column: 23,
          },
        },
        62: {
          start: {
            line: 195,
            column: 24,
          },
          end: {
            line: 204,
            column: 25,
          },
        },
        63: {
          start: {
            line: 196,
            column: 44,
          },
          end: {
            line: 196,
            column: 68,
          },
        },
        64: {
          start: {
            line: 197,
            column: 28,
          },
          end: {
            line: 203,
            column: 29,
          },
        },
        65: {
          start: {
            line: 198,
            column: 55,
          },
          end: {
            line: 201,
            column: 33,
          },
        },
        66: {
          start: {
            line: 202,
            column: 32,
          },
          end: {
            line: 202,
            column: 78,
          },
        },
        67: {
          start: {
            line: 207,
            column: 20,
          },
          end: {
            line: 207,
            column: 31,
          },
        },
        68: {
          start: {
            line: 209,
            column: 20,
          },
          end: {
            line: 209,
            column: 72,
          },
        },
        69: {
          start: {
            line: 210,
            column: 20,
          },
          end: {
            line: 210,
            column: 39,
          },
        },
        70: {
          start: {
            line: 212,
            column: 20,
          },
          end: {
            line: 212,
            column: 32,
          },
        },
        71: {
          start: {
            line: 217,
            column: 8,
          },
          end: {
            line: 217,
            column: 56,
          },
        },
        72: {
          start: {
            line: 224,
            column: 8,
          },
          end: {
            line: 224,
            column: 33,
          },
        },
        73: {
          start: {
            line: 228,
            column: 0,
          },
          end: {
            line: 228,
            column: 30,
          },
        },
      },
      fnMap: {
        0: {
          name: '(anonymous_0)',
          decl: {
            start: {
              line: 29,
              column: 4,
            },
            end: {
              line: 29,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 29,
              column: 22,
            },
            end: {
              line: 42,
              column: 5,
            },
          },
          line: 29,
        },
        1: {
          name: '(anonymous_1)',
          decl: {
            start: {
              line: 52,
              column: 4,
            },
            end: {
              line: 52,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 52,
              column: 51,
            },
            end: {
              line: 76,
              column: 5,
            },
          },
          line: 52,
        },
        2: {
          name: '(anonymous_2)',
          decl: {
            start: {
              line: 84,
              column: 4,
            },
            end: {
              line: 84,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 84,
              column: 48,
            },
            end: {
              line: 96,
              column: 5,
            },
          },
          line: 84,
        },
        3: {
          name: '(anonymous_3)',
          decl: {
            start: {
              line: 103,
              column: 4,
            },
            end: {
              line: 103,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 103,
              column: 31,
            },
            end: {
              line: 128,
              column: 5,
            },
          },
          line: 103,
        },
        4: {
          name: '(anonymous_4)',
          decl: {
            start: {
              line: 135,
              column: 4,
            },
            end: {
              line: 135,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 135,
              column: 41,
            },
            end: {
              line: 148,
              column: 5,
            },
          },
          line: 135,
        },
        5: {
          name: '(anonymous_5)',
          decl: {
            start: {
              line: 136,
              column: 45,
            },
            end: {
              line: 136,
              column: 46,
            },
          },
          loc: {
            start: {
              line: 136,
              column: 67,
            },
            end: {
              line: 147,
              column: 9,
            },
          },
          line: 136,
        },
        6: {
          name: '(anonymous_6)',
          decl: {
            start: {
              line: 150,
              column: 4,
            },
            end: {
              line: 150,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 150,
              column: 27,
            },
            end: {
              line: 164,
              column: 5,
            },
          },
          line: 150,
        },
        7: {
          name: '(anonymous_7)',
          decl: {
            start: {
              line: 172,
              column: 4,
            },
            end: {
              line: 172,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 172,
              column: 41,
            },
            end: {
              line: 218,
              column: 5,
            },
          },
          line: 172,
        },
        8: {
          name: '(anonymous_8)',
          decl: {
            start: {
              line: 176,
              column: 16,
            },
            end: {
              line: 176,
              column: 17,
            },
          },
          loc: {
            start: {
              line: 176,
              column: 24,
            },
            end: {
              line: 176,
              column: 77,
            },
          },
          line: 176,
        },
        9: {
          name: '(anonymous_9)',
          decl: {
            start: {
              line: 184,
              column: 12,
            },
            end: {
              line: 184,
              column: 13,
            },
          },
          loc: {
            start: {
              line: 184,
              column: 42,
            },
            end: {
              line: 214,
              column: 13,
            },
          },
          line: 184,
        },
        10: {
          name: '(anonymous_10)',
          decl: {
            start: {
              line: 194,
              column: 40,
            },
            end: {
              line: 194,
              column: 41,
            },
          },
          loc: {
            start: {
              line: 194,
              column: 45,
            },
            end: {
              line: 205,
              column: 21,
            },
          },
          line: 194,
        },
        11: {
          name: '(anonymous_11)',
          decl: {
            start: {
              line: 223,
              column: 4,
            },
            end: {
              line: 223,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 223,
              column: 14,
            },
            end: {
              line: 225,
              column: 5,
            },
          },
          line: 223,
        },
      },
      branchMap: {
        0: {
          loc: {
            start: {
              line: 55,
              column: 8,
            },
            end: {
              line: 71,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 55,
                column: 8,
              },
              end: {
                line: 71,
                column: 9,
              },
            },
            {
              start: {
                line: 55,
                column: 8,
              },
              end: {
                line: 71,
                column: 9,
              },
            },
          ],
          line: 55,
        },
        1: {
          loc: {
            start: {
              line: 56,
              column: 12,
            },
            end: {
              line: 57,
              column: 53,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 56,
                column: 12,
              },
              end: {
                line: 56,
                column: 42,
              },
            },
            {
              start: {
                line: 57,
                column: 12,
              },
              end: {
                line: 57,
                column: 53,
              },
            },
          ],
          line: 56,
        },
        2: {
          loc: {
            start: {
              line: 61,
              column: 12,
            },
            end: {
              line: 68,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 61,
                column: 12,
              },
              end: {
                line: 68,
                column: 13,
              },
            },
            {
              start: {
                line: 61,
                column: 12,
              },
              end: {
                line: 68,
                column: 13,
              },
            },
          ],
          line: 61,
        },
        3: {
          loc: {
            start: {
              line: 85,
              column: 8,
            },
            end: {
              line: 95,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 85,
                column: 8,
              },
              end: {
                line: 95,
                column: 9,
              },
            },
            {
              start: {
                line: 85,
                column: 8,
              },
              end: {
                line: 95,
                column: 9,
              },
            },
          ],
          line: 85,
        },
        4: {
          loc: {
            start: {
              line: 85,
              column: 12,
            },
            end: {
              line: 85,
              column: 42,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 85,
                column: 12,
              },
              end: {
                line: 85,
                column: 21,
              },
            },
            {
              start: {
                line: 85,
                column: 25,
              },
              end: {
                line: 85,
                column: 42,
              },
            },
          ],
          line: 85,
        },
        5: {
          loc: {
            start: {
              line: 105,
              column: 12,
            },
            end: {
              line: 107,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 105,
                column: 12,
              },
              end: {
                line: 107,
                column: 13,
              },
            },
            {
              start: {
                line: 105,
                column: 12,
              },
              end: {
                line: 107,
                column: 13,
              },
            },
          ],
          line: 105,
        },
        6: {
          loc: {
            start: {
              line: 110,
              column: 12,
            },
            end: {
              line: 112,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 110,
                column: 12,
              },
              end: {
                line: 112,
                column: 13,
              },
            },
            {
              start: {
                line: 110,
                column: 12,
              },
              end: {
                line: 112,
                column: 13,
              },
            },
          ],
          line: 110,
        },
        7: {
          loc: {
            start: {
              line: 114,
              column: 12,
            },
            end: {
              line: 116,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 114,
                column: 12,
              },
              end: {
                line: 116,
                column: 13,
              },
            },
            {
              start: {
                line: 114,
                column: 12,
              },
              end: {
                line: 116,
                column: 13,
              },
            },
          ],
          line: 114,
        },
        8: {
          loc: {
            start: {
              line: 137,
              column: 12,
            },
            end: {
              line: 139,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 137,
                column: 12,
              },
              end: {
                line: 139,
                column: 13,
              },
            },
            {
              start: {
                line: 137,
                column: 12,
              },
              end: {
                line: 139,
                column: 13,
              },
            },
          ],
          line: 137,
        },
        9: {
          loc: {
            start: {
              line: 142,
              column: 12,
            },
            end: {
              line: 146,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 142,
                column: 12,
              },
              end: {
                line: 146,
                column: 13,
              },
            },
            {
              start: {
                line: 142,
                column: 12,
              },
              end: {
                line: 146,
                column: 13,
              },
            },
          ],
          line: 142,
        },
        10: {
          loc: {
            start: {
              line: 152,
              column: 8,
            },
            end: {
              line: 154,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 152,
                column: 8,
              },
              end: {
                line: 154,
                column: 9,
              },
            },
            {
              start: {
                line: 152,
                column: 8,
              },
              end: {
                line: 154,
                column: 9,
              },
            },
          ],
          line: 152,
        },
        11: {
          loc: {
            start: {
              line: 156,
              column: 8,
            },
            end: {
              line: 158,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 156,
                column: 8,
              },
              end: {
                line: 158,
                column: 9,
              },
            },
            {
              start: {
                line: 156,
                column: 8,
              },
              end: {
                line: 158,
                column: 9,
              },
            },
          ],
          line: 156,
        },
        12: {
          loc: {
            start: {
              line: 179,
              column: 8,
            },
            end: {
              line: 181,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 179,
                column: 8,
              },
              end: {
                line: 181,
                column: 9,
              },
            },
            {
              start: {
                line: 179,
                column: 8,
              },
              end: {
                line: 181,
                column: 9,
              },
            },
          ],
          line: 179,
        },
        13: {
          loc: {
            start: {
              line: 179,
              column: 12,
            },
            end: {
              line: 179,
              column: 70,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 179,
                column: 12,
              },
              end: {
                line: 179,
                column: 31,
              },
            },
            {
              start: {
                line: 179,
                column: 35,
              },
              end: {
                line: 179,
                column: 70,
              },
            },
          ],
          line: 179,
        },
        14: {
          loc: {
            start: {
              line: 187,
              column: 24,
            },
            end: {
              line: 188,
              column: 55,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 187,
                column: 24,
              },
              end: {
                line: 187,
                column: 52,
              },
            },
            {
              start: {
                line: 188,
                column: 24,
              },
              end: {
                line: 188,
                column: 55,
              },
            },
          ],
          line: 187,
        },
        15: {
          loc: {
            start: {
              line: 189,
              column: 20,
            },
            end: {
              line: 191,
              column: 21,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 189,
                column: 20,
              },
              end: {
                line: 191,
                column: 21,
              },
            },
            {
              start: {
                line: 189,
                column: 20,
              },
              end: {
                line: 191,
                column: 21,
              },
            },
          ],
          line: 189,
        },
        16: {
          loc: {
            start: {
              line: 195,
              column: 24,
            },
            end: {
              line: 204,
              column: 25,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 195,
                column: 24,
              },
              end: {
                line: 204,
                column: 25,
              },
            },
            {
              start: {
                line: 195,
                column: 24,
              },
              end: {
                line: 204,
                column: 25,
              },
            },
          ],
          line: 195,
        },
        17: {
          loc: {
            start: {
              line: 197,
              column: 28,
            },
            end: {
              line: 203,
              column: 29,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 197,
                column: 28,
              },
              end: {
                line: 203,
                column: 29,
              },
            },
            {
              start: {
                line: 197,
                column: 28,
              },
              end: {
                line: 203,
                column: 29,
              },
            },
          ],
          line: 197,
        },
      },
      s: {
        0: 1,
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1,
        6: 1,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 1,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,
        18: 0,
        19: 0,
        20: 0,
        21: 0,
        22: 0,
        23: 0,
        24: 0,
        25: 0,
        26: 0,
        27: 0,
        28: 0,
        29: 0,
        30: 0,
        31: 0,
        32: 0,
        33: 0,
        34: 0,
        35: 0,
        36: 0,
        37: 0,
        38: 0,
        39: 0,
        40: 0,
        41: 0,
        42: 0,
        43: 0,
        44: 0,
        45: 0,
        46: 0,
        47: 0,
        48: 0,
        49: 0,
        50: 0,
        51: 1,
        52: 1,
        53: 1,
        54: 0,
        55: 1,
        56: 1,
        57: 1,
        58: 1,
        59: 0,
        60: 1,
        61: 1,
        62: 1,
        63: 1,
        64: 1,
        65: 0,
        66: 0,
        67: 1,
        68: 0,
        69: 0,
        70: 0,
        71: 1,
        72: 0,
        73: 1,
      },
      f: {
        0: 1,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 1,
        8: 1,
        9: 1,
        10: 1,
        11: 0,
      },
      b: {
        0: [0, 0],
        1: [0, 0],
        2: [0, 0],
        3: [0, 0],
        4: [0, 0],
        5: [0, 0],
        6: [0, 0],
        7: [0, 0],
        8: [0, 0],
        9: [0, 0],
        10: [0, 0],
        11: [0, 0],
        12: [0, 1],
        13: [1, 0],
        14: [1, 0],
        15: [0, 1],
        16: [1, 0],
        17: [0, 1],
      },
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst { FileCoverage } = require('istanbul-lib-coverage').classes;\n\nfunction locString(loc) {\n    return [\n        loc.start.line,\n        loc.start.column,\n        loc.end.line,\n        loc.end.column\n    ].join(':');\n}\n\nclass MappedCoverage extends FileCoverage {\n    constructor(pathOrObj) {\n        super(pathOrObj);\n\n        this.meta = {\n            last: {\n                s: 0,\n                f: 0,\n                b: 0\n            },\n            seen: {}\n        };\n    }\n\n    addStatement(loc, hits) {\n        const key = 's:' + locString(loc);\n        const { meta } = this;\n        let index = meta.seen[key];\n\n        if (index === undefined) {\n            index = meta.last.s;\n            meta.last.s += 1;\n            meta.seen[key] = index;\n            this.statementMap[index] = this.cloneLocation(loc);\n        }\n\n        this.s[index] = this.s[index] || 0;\n        this.s[index] += hits;\n        return index;\n    }\n\n    addFunction(name, decl, loc, hits) {\n        const key = 'f:' + locString(decl);\n        const { meta } = this;\n        let index = meta.seen[key];\n\n        if (index === undefined) {\n            index = meta.last.f;\n            meta.last.f += 1;\n            meta.seen[key] = index;\n            name = name || `(unknown_${index})`;\n            this.fnMap[index] = {\n                name,\n                decl: this.cloneLocation(decl),\n                loc: this.cloneLocation(loc)\n            };\n        }\n\n        this.f[index] = this.f[index] || 0;\n        this.f[index] += hits;\n        return index;\n    }\n\n    addBranch(type, loc, branchLocations, hits) {\n        const key = ['b', ...branchLocations.map(l => locString(l))].join(':');\n        const { meta } = this;\n        let index = meta.seen[key];\n        if (index === undefined) {\n            index = meta.last.b;\n            meta.last.b += 1;\n            meta.seen[key] = index;\n            this.branchMap[index] = {\n                loc,\n                type,\n                locations: branchLocations.map(l => this.cloneLocation(l))\n            };\n        }\n\n        if (!this.b[index]) {\n            this.b[index] = branchLocations.map(() => 0);\n        }\n\n        hits.forEach((hit, i) => {\n            this.b[index][i] += hit;\n        });\n        return index;\n    }\n\n    /* Returns a clone of the location object with only the attributes of interest */\n    cloneLocation(loc) {\n        return {\n            start: {\n                line: loc.start.line,\n                column: loc.start.column\n            },\n            end: {\n                line: loc.end.line,\n                column: loc.end.column\n            }\n        };\n    }\n}\n\nmodule.exports = {\n    MappedCoverage\n};\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/mapped.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 25,
          },
          end: {
            line: 7,
            column: 65,
          },
        },
        1: {
          start: {
            line: 10,
            column: 4,
          },
          end: {
            line: 15,
            column: 16,
          },
        },
        2: {
          start: {
            line: 20,
            column: 8,
          },
          end: {
            line: 20,
            column: 25,
          },
        },
        3: {
          start: {
            line: 22,
            column: 8,
          },
          end: {
            line: 29,
            column: 10,
          },
        },
        4: {
          start: {
            line: 33,
            column: 20,
          },
          end: {
            line: 33,
            column: 41,
          },
        },
        5: {
          start: {
            line: 34,
            column: 25,
          },
          end: {
            line: 34,
            column: 29,
          },
        },
        6: {
          start: {
            line: 35,
            column: 20,
          },
          end: {
            line: 35,
            column: 34,
          },
        },
        7: {
          start: {
            line: 37,
            column: 8,
          },
          end: {
            line: 42,
            column: 9,
          },
        },
        8: {
          start: {
            line: 38,
            column: 12,
          },
          end: {
            line: 38,
            column: 32,
          },
        },
        9: {
          start: {
            line: 39,
            column: 12,
          },
          end: {
            line: 39,
            column: 29,
          },
        },
        10: {
          start: {
            line: 40,
            column: 12,
          },
          end: {
            line: 40,
            column: 35,
          },
        },
        11: {
          start: {
            line: 41,
            column: 12,
          },
          end: {
            line: 41,
            column: 63,
          },
        },
        12: {
          start: {
            line: 44,
            column: 8,
          },
          end: {
            line: 44,
            column: 43,
          },
        },
        13: {
          start: {
            line: 45,
            column: 8,
          },
          end: {
            line: 45,
            column: 30,
          },
        },
        14: {
          start: {
            line: 46,
            column: 8,
          },
          end: {
            line: 46,
            column: 21,
          },
        },
        15: {
          start: {
            line: 50,
            column: 20,
          },
          end: {
            line: 50,
            column: 42,
          },
        },
        16: {
          start: {
            line: 51,
            column: 25,
          },
          end: {
            line: 51,
            column: 29,
          },
        },
        17: {
          start: {
            line: 52,
            column: 20,
          },
          end: {
            line: 52,
            column: 34,
          },
        },
        18: {
          start: {
            line: 54,
            column: 8,
          },
          end: {
            line: 64,
            column: 9,
          },
        },
        19: {
          start: {
            line: 55,
            column: 12,
          },
          end: {
            line: 55,
            column: 32,
          },
        },
        20: {
          start: {
            line: 56,
            column: 12,
          },
          end: {
            line: 56,
            column: 29,
          },
        },
        21: {
          start: {
            line: 57,
            column: 12,
          },
          end: {
            line: 57,
            column: 35,
          },
        },
        22: {
          start: {
            line: 58,
            column: 12,
          },
          end: {
            line: 58,
            column: 48,
          },
        },
        23: {
          start: {
            line: 59,
            column: 12,
          },
          end: {
            line: 63,
            column: 14,
          },
        },
        24: {
          start: {
            line: 66,
            column: 8,
          },
          end: {
            line: 66,
            column: 43,
          },
        },
        25: {
          start: {
            line: 67,
            column: 8,
          },
          end: {
            line: 67,
            column: 30,
          },
        },
        26: {
          start: {
            line: 68,
            column: 8,
          },
          end: {
            line: 68,
            column: 21,
          },
        },
        27: {
          start: {
            line: 72,
            column: 20,
          },
          end: {
            line: 72,
            column: 78,
          },
        },
        28: {
          start: {
            line: 72,
            column: 54,
          },
          end: {
            line: 72,
            column: 66,
          },
        },
        29: {
          start: {
            line: 73,
            column: 25,
          },
          end: {
            line: 73,
            column: 29,
          },
        },
        30: {
          start: {
            line: 74,
            column: 20,
          },
          end: {
            line: 74,
            column: 34,
          },
        },
        31: {
          start: {
            line: 75,
            column: 8,
          },
          end: {
            line: 84,
            column: 9,
          },
        },
        32: {
          start: {
            line: 76,
            column: 12,
          },
          end: {
            line: 76,
            column: 32,
          },
        },
        33: {
          start: {
            line: 77,
            column: 12,
          },
          end: {
            line: 77,
            column: 29,
          },
        },
        34: {
          start: {
            line: 78,
            column: 12,
          },
          end: {
            line: 78,
            column: 35,
          },
        },
        35: {
          start: {
            line: 79,
            column: 12,
          },
          end: {
            line: 83,
            column: 14,
          },
        },
        36: {
          start: {
            line: 82,
            column: 52,
          },
          end: {
            line: 82,
            column: 73,
          },
        },
        37: {
          start: {
            line: 86,
            column: 8,
          },
          end: {
            line: 88,
            column: 9,
          },
        },
        38: {
          start: {
            line: 87,
            column: 12,
          },
          end: {
            line: 87,
            column: 57,
          },
        },
        39: {
          start: {
            line: 87,
            column: 54,
          },
          end: {
            line: 87,
            column: 55,
          },
        },
        40: {
          start: {
            line: 90,
            column: 8,
          },
          end: {
            line: 92,
            column: 11,
          },
        },
        41: {
          start: {
            line: 91,
            column: 12,
          },
          end: {
            line: 91,
            column: 36,
          },
        },
        42: {
          start: {
            line: 93,
            column: 8,
          },
          end: {
            line: 93,
            column: 21,
          },
        },
        43: {
          start: {
            line: 98,
            column: 8,
          },
          end: {
            line: 107,
            column: 10,
          },
        },
        44: {
          start: {
            line: 111,
            column: 0,
          },
          end: {
            line: 113,
            column: 2,
          },
        },
      },
      fnMap: {
        0: {
          name: 'locString',
          decl: {
            start: {
              line: 9,
              column: 9,
            },
            end: {
              line: 9,
              column: 18,
            },
          },
          loc: {
            start: {
              line: 9,
              column: 24,
            },
            end: {
              line: 16,
              column: 1,
            },
          },
          line: 9,
        },
        1: {
          name: '(anonymous_1)',
          decl: {
            start: {
              line: 19,
              column: 4,
            },
            end: {
              line: 19,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 19,
              column: 27,
            },
            end: {
              line: 30,
              column: 5,
            },
          },
          line: 19,
        },
        2: {
          name: '(anonymous_2)',
          decl: {
            start: {
              line: 32,
              column: 4,
            },
            end: {
              line: 32,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 32,
              column: 28,
            },
            end: {
              line: 47,
              column: 5,
            },
          },
          line: 32,
        },
        3: {
          name: '(anonymous_3)',
          decl: {
            start: {
              line: 49,
              column: 4,
            },
            end: {
              line: 49,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 49,
              column: 39,
            },
            end: {
              line: 69,
              column: 5,
            },
          },
          line: 49,
        },
        4: {
          name: '(anonymous_4)',
          decl: {
            start: {
              line: 71,
              column: 4,
            },
            end: {
              line: 71,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 71,
              column: 48,
            },
            end: {
              line: 94,
              column: 5,
            },
          },
          line: 71,
        },
        5: {
          name: '(anonymous_5)',
          decl: {
            start: {
              line: 72,
              column: 49,
            },
            end: {
              line: 72,
              column: 50,
            },
          },
          loc: {
            start: {
              line: 72,
              column: 54,
            },
            end: {
              line: 72,
              column: 66,
            },
          },
          line: 72,
        },
        6: {
          name: '(anonymous_6)',
          decl: {
            start: {
              line: 82,
              column: 47,
            },
            end: {
              line: 82,
              column: 48,
            },
          },
          loc: {
            start: {
              line: 82,
              column: 52,
            },
            end: {
              line: 82,
              column: 73,
            },
          },
          line: 82,
        },
        7: {
          name: '(anonymous_7)',
          decl: {
            start: {
              line: 87,
              column: 48,
            },
            end: {
              line: 87,
              column: 49,
            },
          },
          loc: {
            start: {
              line: 87,
              column: 54,
            },
            end: {
              line: 87,
              column: 55,
            },
          },
          line: 87,
        },
        8: {
          name: '(anonymous_8)',
          decl: {
            start: {
              line: 90,
              column: 21,
            },
            end: {
              line: 90,
              column: 22,
            },
          },
          loc: {
            start: {
              line: 90,
              column: 33,
            },
            end: {
              line: 92,
              column: 9,
            },
          },
          line: 90,
        },
        9: {
          name: '(anonymous_9)',
          decl: {
            start: {
              line: 97,
              column: 4,
            },
            end: {
              line: 97,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 97,
              column: 23,
            },
            end: {
              line: 108,
              column: 5,
            },
          },
          line: 97,
        },
      },
      branchMap: {
        0: {
          loc: {
            start: {
              line: 37,
              column: 8,
            },
            end: {
              line: 42,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 37,
                column: 8,
              },
              end: {
                line: 42,
                column: 9,
              },
            },
            {
              start: {
                line: 37,
                column: 8,
              },
              end: {
                line: 42,
                column: 9,
              },
            },
          ],
          line: 37,
        },
        1: {
          loc: {
            start: {
              line: 44,
              column: 24,
            },
            end: {
              line: 44,
              column: 42,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 44,
                column: 24,
              },
              end: {
                line: 44,
                column: 37,
              },
            },
            {
              start: {
                line: 44,
                column: 41,
              },
              end: {
                line: 44,
                column: 42,
              },
            },
          ],
          line: 44,
        },
        2: {
          loc: {
            start: {
              line: 54,
              column: 8,
            },
            end: {
              line: 64,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 54,
                column: 8,
              },
              end: {
                line: 64,
                column: 9,
              },
            },
            {
              start: {
                line: 54,
                column: 8,
              },
              end: {
                line: 64,
                column: 9,
              },
            },
          ],
          line: 54,
        },
        3: {
          loc: {
            start: {
              line: 58,
              column: 19,
            },
            end: {
              line: 58,
              column: 47,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 58,
                column: 19,
              },
              end: {
                line: 58,
                column: 23,
              },
            },
            {
              start: {
                line: 58,
                column: 27,
              },
              end: {
                line: 58,
                column: 47,
              },
            },
          ],
          line: 58,
        },
        4: {
          loc: {
            start: {
              line: 66,
              column: 24,
            },
            end: {
              line: 66,
              column: 42,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 66,
                column: 24,
              },
              end: {
                line: 66,
                column: 37,
              },
            },
            {
              start: {
                line: 66,
                column: 41,
              },
              end: {
                line: 66,
                column: 42,
              },
            },
          ],
          line: 66,
        },
        5: {
          loc: {
            start: {
              line: 75,
              column: 8,
            },
            end: {
              line: 84,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 75,
                column: 8,
              },
              end: {
                line: 84,
                column: 9,
              },
            },
            {
              start: {
                line: 75,
                column: 8,
              },
              end: {
                line: 84,
                column: 9,
              },
            },
          ],
          line: 75,
        },
        6: {
          loc: {
            start: {
              line: 86,
              column: 8,
            },
            end: {
              line: 88,
              column: 9,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 86,
                column: 8,
              },
              end: {
                line: 88,
                column: 9,
              },
            },
            {
              start: {
                line: 86,
                column: 8,
              },
              end: {
                line: 88,
                column: 9,
              },
            },
          ],
          line: 86,
        },
      },
      s: {
        0: 1,
        1: 66,
        2: 9,
        3: 9,
        4: 35,
        5: 35,
        6: 35,
        7: 35,
        8: 34,
        9: 34,
        10: 34,
        11: 34,
        12: 35,
        13: 35,
        14: 35,
        15: 13,
        16: 13,
        17: 13,
        18: 13,
        19: 11,
        20: 11,
        21: 11,
        22: 11,
        23: 11,
        24: 13,
        25: 13,
        26: 13,
        27: 8,
        28: 18,
        29: 8,
        30: 8,
        31: 8,
        32: 7,
        33: 7,
        34: 7,
        35: 7,
        36: 16,
        37: 8,
        38: 7,
        39: 16,
        40: 8,
        41: 18,
        42: 8,
        43: 72,
        44: 1,
      },
      f: {
        0: 66,
        1: 9,
        2: 35,
        3: 13,
        4: 8,
        5: 18,
        6: 16,
        7: 16,
        8: 18,
        9: 72,
      },
      b: {
        0: [34, 1],
        1: [35, 34],
        2: [11, 2],
        3: [11, 1],
        4: [13, 12],
        5: [7, 1],
        6: [7, 1],
      },
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst path = require('path');\n\nmodule.exports = {\n    isAbsolute: path.isAbsolute,\n    asAbsolute(file, baseDir) {\n        return path.isAbsolute(file)\n            ? file\n            : path.resolve(baseDir || process.cwd(), file);\n    },\n    relativeTo(file, origFile) {\n        return path.isAbsolute(file)\n            ? file\n            : path.resolve(path.dirname(origFile), file);\n    }\n};\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/pathutils.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 13,
          },
          end: {
            line: 7,
            column: 28,
          },
        },
        1: {
          start: {
            line: 9,
            column: 0,
          },
          end: {
            line: 21,
            column: 2,
          },
        },
        2: {
          start: {
            line: 12,
            column: 8,
          },
          end: {
            line: 14,
            column: 59,
          },
        },
        3: {
          start: {
            line: 17,
            column: 8,
          },
          end: {
            line: 19,
            column: 57,
          },
        },
      },
      fnMap: {
        0: {
          name: '(anonymous_0)',
          decl: {
            start: {
              line: 11,
              column: 4,
            },
            end: {
              line: 11,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 11,
              column: 30,
            },
            end: {
              line: 15,
              column: 5,
            },
          },
          line: 11,
        },
        1: {
          name: '(anonymous_1)',
          decl: {
            start: {
              line: 16,
              column: 4,
            },
            end: {
              line: 16,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 16,
              column: 31,
            },
            end: {
              line: 20,
              column: 5,
            },
          },
          line: 16,
        },
      },
      branchMap: {
        0: {
          loc: {
            start: {
              line: 12,
              column: 15,
            },
            end: {
              line: 14,
              column: 58,
            },
          },
          type: 'cond-expr',
          locations: [
            {
              start: {
                line: 13,
                column: 14,
              },
              end: {
                line: 13,
                column: 18,
              },
            },
            {
              start: {
                line: 14,
                column: 14,
              },
              end: {
                line: 14,
                column: 58,
              },
            },
          ],
          line: 12,
        },
        1: {
          loc: {
            start: {
              line: 14,
              column: 27,
            },
            end: {
              line: 14,
              column: 51,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 14,
                column: 27,
              },
              end: {
                line: 14,
                column: 34,
              },
            },
            {
              start: {
                line: 14,
                column: 38,
              },
              end: {
                line: 14,
                column: 51,
              },
            },
          ],
          line: 14,
        },
        2: {
          loc: {
            start: {
              line: 17,
              column: 15,
            },
            end: {
              line: 19,
              column: 56,
            },
          },
          type: 'cond-expr',
          locations: [
            {
              start: {
                line: 18,
                column: 14,
              },
              end: {
                line: 18,
                column: 18,
              },
            },
            {
              start: {
                line: 19,
                column: 14,
              },
              end: {
                line: 19,
                column: 56,
              },
            },
          ],
          line: 17,
        },
      },
      s: {
        0: 1,
        1: 1,
        2: 0,
        3: 37,
      },
      f: {
        0: 0,
        1: 37,
      },
      b: {
        0: [0, 0],
        1: [0, 0],
        2: [26, 11],
      },
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nfunction getUniqueKey(pathname) {\n    return pathname.replace(/[\\\\/]/g, '_');\n}\n\nfunction getOutput(cache) {\n    return Object.values(cache).reduce(\n        (output, { file, mappedCoverage }) => ({\n            ...output,\n            [file]: mappedCoverage\n        }),\n        {}\n    );\n}\n\nmodule.exports = { getUniqueKey, getOutput };\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/transform-utils.js',
      statementMap: {
        0: {
          start: {
            line: 8,
            column: 4,
          },
          end: {
            line: 8,
            column: 43,
          },
        },
        1: {
          start: {
            line: 12,
            column: 4,
          },
          end: {
            line: 18,
            column: 6,
          },
        },
        2: {
          start: {
            line: 13,
            column: 47,
          },
          end: {
            line: 16,
            column: 9,
          },
        },
        3: {
          start: {
            line: 21,
            column: 0,
          },
          end: {
            line: 21,
            column: 45,
          },
        },
      },
      fnMap: {
        0: {
          name: 'getUniqueKey',
          decl: {
            start: {
              line: 7,
              column: 9,
            },
            end: {
              line: 7,
              column: 21,
            },
          },
          loc: {
            start: {
              line: 7,
              column: 32,
            },
            end: {
              line: 9,
              column: 1,
            },
          },
          line: 7,
        },
        1: {
          name: 'getOutput',
          decl: {
            start: {
              line: 11,
              column: 9,
            },
            end: {
              line: 11,
              column: 18,
            },
          },
          loc: {
            start: {
              line: 11,
              column: 26,
            },
            end: {
              line: 19,
              column: 1,
            },
          },
          line: 11,
        },
        2: {
          name: '(anonymous_2)',
          decl: {
            start: {
              line: 13,
              column: 8,
            },
            end: {
              line: 13,
              column: 9,
            },
          },
          loc: {
            start: {
              line: 13,
              column: 47,
            },
            end: {
              line: 16,
              column: 9,
            },
          },
          line: 13,
        },
      },
      branchMap: {},
      s: {
        0: 49,
        1: 6,
        2: 6,
        3: 1,
      },
      f: {
        0: 49,
        1: 6,
        2: 6,
      },
      b: {},
    },
    {
      source:
        "/*\n Copyright 2015, Yahoo Inc.\n Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.\n */\n'use strict';\n\nconst debug = require('debug')('istanbuljs');\nconst libCoverage = require('istanbul-lib-coverage');\nconst { MappedCoverage } = require('./mapped');\nconst getMapping = require('./get-mapping');\nconst { getUniqueKey, getOutput } = require('./transform-utils');\n\nclass SourceMapTransformer {\n    constructor(finder, opts = {}) {\n        this.finder = finder;\n        this.baseDir = opts.baseDir || process.cwd();\n        this.resolveMapping = opts.getMapping || getMapping;\n    }\n\n    processFile(fc, sourceMap, coverageMapper) {\n        let changes = 0;\n\n        Object.entries(fc.statementMap).forEach(([s, loc]) => {\n            const hits = fc.s[s];\n            const mapping = this.resolveMapping(sourceMap, loc, fc.path);\n\n            if (mapping) {\n                changes += 1;\n                const mappedCoverage = coverageMapper(mapping.source);\n                mappedCoverage.addStatement(mapping.loc, hits);\n            }\n        });\n\n        Object.entries(fc.fnMap).forEach(([f, fnMeta]) => {\n            const hits = fc.f[f];\n            const mapping = this.resolveMapping(\n                sourceMap,\n                fnMeta.decl,\n                fc.path\n            );\n\n            const spanMapping = this.resolveMapping(\n                sourceMap,\n                fnMeta.loc,\n                fc.path\n            );\n\n            if (\n                mapping &&\n                spanMapping &&\n                mapping.source === spanMapping.source\n            ) {\n                changes += 1;\n                const mappedCoverage = coverageMapper(mapping.source);\n                mappedCoverage.addFunction(\n                    fnMeta.name,\n                    mapping.loc,\n                    spanMapping.loc,\n                    hits\n                );\n            }\n        });\n\n        Object.entries(fc.branchMap).forEach(([b, branchMeta]) => {\n            const hits = fc.b[b];\n            const locs = [];\n            const mappedHits = [];\n            let source;\n            let skip;\n\n            branchMeta.locations.forEach((loc, i) => {\n                const mapping = this.resolveMapping(sourceMap, loc, fc.path);\n                if (mapping) {\n                    if (!source) {\n                        source = mapping.source;\n                    }\n\n                    if (mapping.source !== source) {\n                        skip = true;\n                    }\n\n                    locs.push(mapping.loc);\n                    mappedHits.push(hits[i]);\n                }\n                // Check if this is an implicit else\n                else if (\n                    source &&\n                    branchMeta.type === 'if' &&\n                    i > 0 &&\n                    loc.start.line === undefined &&\n                    loc.start.end === undefined &&\n                    loc.end.line === undefined &&\n                    loc.end.end === undefined\n                ) {\n                    locs.push(loc);\n                    mappedHits.push(hits[i]);\n                }\n            });\n\n            const locMapping = branchMeta.loc\n                ? this.resolveMapping(sourceMap, branchMeta.loc, fc.path)\n                : null;\n\n            if (!skip && locs.length > 0) {\n                changes += 1;\n                const mappedCoverage = coverageMapper(source);\n                mappedCoverage.addBranch(\n                    branchMeta.type,\n                    locMapping ? locMapping.loc : locs[0],\n                    locs,\n                    mappedHits\n                );\n            }\n        });\n\n        return changes > 0;\n    }\n\n    async transform(coverageMap) {\n        const uniqueFiles = {};\n        const getMappedCoverage = file => {\n            const key = getUniqueKey(file);\n            if (!uniqueFiles[key]) {\n                uniqueFiles[key] = {\n                    file,\n                    mappedCoverage: new MappedCoverage(file)\n                };\n            }\n\n            return uniqueFiles[key].mappedCoverage;\n        };\n\n        for (const file of coverageMap.files()) {\n            const fc = coverageMap.fileCoverageFor(file);\n            const sourceMap = await this.finder(file, fc);\n\n            if (sourceMap) {\n                const changed = this.processFile(\n                    fc,\n                    sourceMap,\n                    getMappedCoverage\n                );\n                if (!changed) {\n                    debug(`File [${file}] ignored, nothing could be mapped`);\n                }\n            } else {\n                uniqueFiles[getUniqueKey(file)] = {\n                    file,\n                    mappedCoverage: new MappedCoverage(fc)\n                };\n            }\n        }\n\n        return libCoverage.createCoverageMap(getOutput(uniqueFiles));\n    }\n}\n\nmodule.exports = {\n    SourceMapTransformer\n};\n",
      path: '/Users/travzhang/github.com/istanbuljs/istanbuljs/packages/istanbul-lib-source-maps/lib/transformer.js',
      statementMap: {
        0: {
          start: {
            line: 7,
            column: 14,
          },
          end: {
            line: 7,
            column: 44,
          },
        },
        1: {
          start: {
            line: 8,
            column: 20,
          },
          end: {
            line: 8,
            column: 52,
          },
        },
        2: {
          start: {
            line: 9,
            column: 27,
          },
          end: {
            line: 9,
            column: 46,
          },
        },
        3: {
          start: {
            line: 10,
            column: 19,
          },
          end: {
            line: 10,
            column: 43,
          },
        },
        4: {
          start: {
            line: 11,
            column: 36,
          },
          end: {
            line: 11,
            column: 64,
          },
        },
        5: {
          start: {
            line: 15,
            column: 8,
          },
          end: {
            line: 15,
            column: 29,
          },
        },
        6: {
          start: {
            line: 16,
            column: 8,
          },
          end: {
            line: 16,
            column: 53,
          },
        },
        7: {
          start: {
            line: 17,
            column: 8,
          },
          end: {
            line: 17,
            column: 60,
          },
        },
        8: {
          start: {
            line: 21,
            column: 22,
          },
          end: {
            line: 21,
            column: 23,
          },
        },
        9: {
          start: {
            line: 23,
            column: 8,
          },
          end: {
            line: 32,
            column: 11,
          },
        },
        10: {
          start: {
            line: 24,
            column: 25,
          },
          end: {
            line: 24,
            column: 32,
          },
        },
        11: {
          start: {
            line: 25,
            column: 28,
          },
          end: {
            line: 25,
            column: 72,
          },
        },
        12: {
          start: {
            line: 27,
            column: 12,
          },
          end: {
            line: 31,
            column: 13,
          },
        },
        13: {
          start: {
            line: 28,
            column: 16,
          },
          end: {
            line: 28,
            column: 29,
          },
        },
        14: {
          start: {
            line: 29,
            column: 39,
          },
          end: {
            line: 29,
            column: 69,
          },
        },
        15: {
          start: {
            line: 30,
            column: 16,
          },
          end: {
            line: 30,
            column: 63,
          },
        },
        16: {
          start: {
            line: 34,
            column: 8,
          },
          end: {
            line: 62,
            column: 11,
          },
        },
        17: {
          start: {
            line: 35,
            column: 25,
          },
          end: {
            line: 35,
            column: 32,
          },
        },
        18: {
          start: {
            line: 36,
            column: 28,
          },
          end: {
            line: 40,
            column: 13,
          },
        },
        19: {
          start: {
            line: 42,
            column: 32,
          },
          end: {
            line: 46,
            column: 13,
          },
        },
        20: {
          start: {
            line: 48,
            column: 12,
          },
          end: {
            line: 61,
            column: 13,
          },
        },
        21: {
          start: {
            line: 53,
            column: 16,
          },
          end: {
            line: 53,
            column: 29,
          },
        },
        22: {
          start: {
            line: 54,
            column: 39,
          },
          end: {
            line: 54,
            column: 69,
          },
        },
        23: {
          start: {
            line: 55,
            column: 16,
          },
          end: {
            line: 60,
            column: 18,
          },
        },
        24: {
          start: {
            line: 64,
            column: 8,
          },
          end: {
            line: 114,
            column: 11,
          },
        },
        25: {
          start: {
            line: 65,
            column: 25,
          },
          end: {
            line: 65,
            column: 32,
          },
        },
        26: {
          start: {
            line: 66,
            column: 25,
          },
          end: {
            line: 66,
            column: 27,
          },
        },
        27: {
          start: {
            line: 67,
            column: 31,
          },
          end: {
            line: 67,
            column: 33,
          },
        },
        28: {
          start: {
            line: 71,
            column: 12,
          },
          end: {
            line: 98,
            column: 15,
          },
        },
        29: {
          start: {
            line: 72,
            column: 32,
          },
          end: {
            line: 72,
            column: 76,
          },
        },
        30: {
          start: {
            line: 73,
            column: 16,
          },
          end: {
            line: 97,
            column: 17,
          },
        },
        31: {
          start: {
            line: 74,
            column: 20,
          },
          end: {
            line: 76,
            column: 21,
          },
        },
        32: {
          start: {
            line: 75,
            column: 24,
          },
          end: {
            line: 75,
            column: 48,
          },
        },
        33: {
          start: {
            line: 78,
            column: 20,
          },
          end: {
            line: 80,
            column: 21,
          },
        },
        34: {
          start: {
            line: 79,
            column: 24,
          },
          end: {
            line: 79,
            column: 36,
          },
        },
        35: {
          start: {
            line: 82,
            column: 20,
          },
          end: {
            line: 82,
            column: 43,
          },
        },
        36: {
          start: {
            line: 83,
            column: 20,
          },
          end: {
            line: 83,
            column: 45,
          },
        },
        37: {
          start: {
            line: 86,
            column: 21,
          },
          end: {
            line: 97,
            column: 17,
          },
        },
        38: {
          start: {
            line: 95,
            column: 20,
          },
          end: {
            line: 95,
            column: 35,
          },
        },
        39: {
          start: {
            line: 96,
            column: 20,
          },
          end: {
            line: 96,
            column: 45,
          },
        },
        40: {
          start: {
            line: 100,
            column: 31,
          },
          end: {
            line: 102,
            column: 22,
          },
        },
        41: {
          start: {
            line: 104,
            column: 12,
          },
          end: {
            line: 113,
            column: 13,
          },
        },
        42: {
          start: {
            line: 105,
            column: 16,
          },
          end: {
            line: 105,
            column: 29,
          },
        },
        43: {
          start: {
            line: 106,
            column: 39,
          },
          end: {
            line: 106,
            column: 61,
          },
        },
        44: {
          start: {
            line: 107,
            column: 16,
          },
          end: {
            line: 112,
            column: 18,
          },
        },
        45: {
          start: {
            line: 116,
            column: 8,
          },
          end: {
            line: 116,
            column: 27,
          },
        },
        46: {
          start: {
            line: 120,
            column: 28,
          },
          end: {
            line: 120,
            column: 30,
          },
        },
        47: {
          start: {
            line: 121,
            column: 34,
          },
          end: {
            line: 131,
            column: 9,
          },
        },
        48: {
          start: {
            line: 122,
            column: 24,
          },
          end: {
            line: 122,
            column: 42,
          },
        },
        49: {
          start: {
            line: 123,
            column: 12,
          },
          end: {
            line: 128,
            column: 13,
          },
        },
        50: {
          start: {
            line: 124,
            column: 16,
          },
          end: {
            line: 127,
            column: 18,
          },
        },
        51: {
          start: {
            line: 130,
            column: 12,
          },
          end: {
            line: 130,
            column: 51,
          },
        },
        52: {
          start: {
            line: 133,
            column: 8,
          },
          end: {
            line: 152,
            column: 9,
          },
        },
        53: {
          start: {
            line: 134,
            column: 23,
          },
          end: {
            line: 134,
            column: 56,
          },
        },
        54: {
          start: {
            line: 135,
            column: 30,
          },
          end: {
            line: 135,
            column: 57,
          },
        },
        55: {
          start: {
            line: 137,
            column: 12,
          },
          end: {
            line: 151,
            column: 13,
          },
        },
        56: {
          start: {
            line: 138,
            column: 32,
          },
          end: {
            line: 142,
            column: 17,
          },
        },
        57: {
          start: {
            line: 143,
            column: 16,
          },
          end: {
            line: 145,
            column: 17,
          },
        },
        58: {
          start: {
            line: 144,
            column: 20,
          },
          end: {
            line: 144,
            column: 77,
          },
        },
        59: {
          start: {
            line: 147,
            column: 16,
          },
          end: {
            line: 150,
            column: 18,
          },
        },
        60: {
          start: {
            line: 154,
            column: 8,
          },
          end: {
            line: 154,
            column: 69,
          },
        },
        61: {
          start: {
            line: 158,
            column: 0,
          },
          end: {
            line: 160,
            column: 2,
          },
        },
      },
      fnMap: {
        0: {
          name: '(anonymous_0)',
          decl: {
            start: {
              line: 14,
              column: 4,
            },
            end: {
              line: 14,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 14,
              column: 35,
            },
            end: {
              line: 18,
              column: 5,
            },
          },
          line: 14,
        },
        1: {
          name: '(anonymous_1)',
          decl: {
            start: {
              line: 20,
              column: 4,
            },
            end: {
              line: 20,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 20,
              column: 47,
            },
            end: {
              line: 117,
              column: 5,
            },
          },
          line: 20,
        },
        2: {
          name: '(anonymous_2)',
          decl: {
            start: {
              line: 23,
              column: 48,
            },
            end: {
              line: 23,
              column: 49,
            },
          },
          loc: {
            start: {
              line: 23,
              column: 62,
            },
            end: {
              line: 32,
              column: 9,
            },
          },
          line: 23,
        },
        3: {
          name: '(anonymous_3)',
          decl: {
            start: {
              line: 34,
              column: 41,
            },
            end: {
              line: 34,
              column: 42,
            },
          },
          loc: {
            start: {
              line: 34,
              column: 58,
            },
            end: {
              line: 62,
              column: 9,
            },
          },
          line: 34,
        },
        4: {
          name: '(anonymous_4)',
          decl: {
            start: {
              line: 64,
              column: 45,
            },
            end: {
              line: 64,
              column: 46,
            },
          },
          loc: {
            start: {
              line: 64,
              column: 66,
            },
            end: {
              line: 114,
              column: 9,
            },
          },
          line: 64,
        },
        5: {
          name: '(anonymous_5)',
          decl: {
            start: {
              line: 71,
              column: 41,
            },
            end: {
              line: 71,
              column: 42,
            },
          },
          loc: {
            start: {
              line: 71,
              column: 53,
            },
            end: {
              line: 98,
              column: 13,
            },
          },
          line: 71,
        },
        6: {
          name: '(anonymous_6)',
          decl: {
            start: {
              line: 119,
              column: 4,
            },
            end: {
              line: 119,
              column: 5,
            },
          },
          loc: {
            start: {
              line: 119,
              column: 33,
            },
            end: {
              line: 155,
              column: 5,
            },
          },
          line: 119,
        },
        7: {
          name: '(anonymous_7)',
          decl: {
            start: {
              line: 121,
              column: 34,
            },
            end: {
              line: 121,
              column: 35,
            },
          },
          loc: {
            start: {
              line: 121,
              column: 42,
            },
            end: {
              line: 131,
              column: 9,
            },
          },
          line: 121,
        },
      },
      branchMap: {
        0: {
          loc: {
            start: {
              line: 14,
              column: 24,
            },
            end: {
              line: 14,
              column: 33,
            },
          },
          type: 'default-arg',
          locations: [
            {
              start: {
                line: 14,
                column: 31,
              },
              end: {
                line: 14,
                column: 33,
              },
            },
          ],
          line: 14,
        },
        1: {
          loc: {
            start: {
              line: 16,
              column: 23,
            },
            end: {
              line: 16,
              column: 52,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 16,
                column: 23,
              },
              end: {
                line: 16,
                column: 35,
              },
            },
            {
              start: {
                line: 16,
                column: 39,
              },
              end: {
                line: 16,
                column: 52,
              },
            },
          ],
          line: 16,
        },
        2: {
          loc: {
            start: {
              line: 17,
              column: 30,
            },
            end: {
              line: 17,
              column: 59,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 17,
                column: 30,
              },
              end: {
                line: 17,
                column: 45,
              },
            },
            {
              start: {
                line: 17,
                column: 49,
              },
              end: {
                line: 17,
                column: 59,
              },
            },
          ],
          line: 17,
        },
        3: {
          loc: {
            start: {
              line: 27,
              column: 12,
            },
            end: {
              line: 31,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 27,
                column: 12,
              },
              end: {
                line: 31,
                column: 13,
              },
            },
            {
              start: {
                line: 27,
                column: 12,
              },
              end: {
                line: 31,
                column: 13,
              },
            },
          ],
          line: 27,
        },
        4: {
          loc: {
            start: {
              line: 48,
              column: 12,
            },
            end: {
              line: 61,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 48,
                column: 12,
              },
              end: {
                line: 61,
                column: 13,
              },
            },
            {
              start: {
                line: 48,
                column: 12,
              },
              end: {
                line: 61,
                column: 13,
              },
            },
          ],
          line: 48,
        },
        5: {
          loc: {
            start: {
              line: 49,
              column: 16,
            },
            end: {
              line: 51,
              column: 53,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 49,
                column: 16,
              },
              end: {
                line: 49,
                column: 23,
              },
            },
            {
              start: {
                line: 50,
                column: 16,
              },
              end: {
                line: 50,
                column: 27,
              },
            },
            {
              start: {
                line: 51,
                column: 16,
              },
              end: {
                line: 51,
                column: 53,
              },
            },
          ],
          line: 49,
        },
        6: {
          loc: {
            start: {
              line: 73,
              column: 16,
            },
            end: {
              line: 97,
              column: 17,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 73,
                column: 16,
              },
              end: {
                line: 97,
                column: 17,
              },
            },
            {
              start: {
                line: 73,
                column: 16,
              },
              end: {
                line: 97,
                column: 17,
              },
            },
          ],
          line: 73,
        },
        7: {
          loc: {
            start: {
              line: 74,
              column: 20,
            },
            end: {
              line: 76,
              column: 21,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 74,
                column: 20,
              },
              end: {
                line: 76,
                column: 21,
              },
            },
            {
              start: {
                line: 74,
                column: 20,
              },
              end: {
                line: 76,
                column: 21,
              },
            },
          ],
          line: 74,
        },
        8: {
          loc: {
            start: {
              line: 78,
              column: 20,
            },
            end: {
              line: 80,
              column: 21,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 78,
                column: 20,
              },
              end: {
                line: 80,
                column: 21,
              },
            },
            {
              start: {
                line: 78,
                column: 20,
              },
              end: {
                line: 80,
                column: 21,
              },
            },
          ],
          line: 78,
        },
        9: {
          loc: {
            start: {
              line: 86,
              column: 21,
            },
            end: {
              line: 97,
              column: 17,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 86,
                column: 21,
              },
              end: {
                line: 97,
                column: 17,
              },
            },
            {
              start: {
                line: 86,
                column: 21,
              },
              end: {
                line: 97,
                column: 17,
              },
            },
          ],
          line: 86,
        },
        10: {
          loc: {
            start: {
              line: 87,
              column: 20,
            },
            end: {
              line: 93,
              column: 45,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 87,
                column: 20,
              },
              end: {
                line: 87,
                column: 26,
              },
            },
            {
              start: {
                line: 88,
                column: 20,
              },
              end: {
                line: 88,
                column: 44,
              },
            },
            {
              start: {
                line: 89,
                column: 20,
              },
              end: {
                line: 89,
                column: 25,
              },
            },
            {
              start: {
                line: 90,
                column: 20,
              },
              end: {
                line: 90,
                column: 48,
              },
            },
            {
              start: {
                line: 91,
                column: 20,
              },
              end: {
                line: 91,
                column: 47,
              },
            },
            {
              start: {
                line: 92,
                column: 20,
              },
              end: {
                line: 92,
                column: 46,
              },
            },
            {
              start: {
                line: 93,
                column: 20,
              },
              end: {
                line: 93,
                column: 45,
              },
            },
          ],
          line: 87,
        },
        11: {
          loc: {
            start: {
              line: 100,
              column: 31,
            },
            end: {
              line: 102,
              column: 22,
            },
          },
          type: 'cond-expr',
          locations: [
            {
              start: {
                line: 101,
                column: 18,
              },
              end: {
                line: 101,
                column: 73,
              },
            },
            {
              start: {
                line: 102,
                column: 18,
              },
              end: {
                line: 102,
                column: 22,
              },
            },
          ],
          line: 100,
        },
        12: {
          loc: {
            start: {
              line: 104,
              column: 12,
            },
            end: {
              line: 113,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 104,
                column: 12,
              },
              end: {
                line: 113,
                column: 13,
              },
            },
            {
              start: {
                line: 104,
                column: 12,
              },
              end: {
                line: 113,
                column: 13,
              },
            },
          ],
          line: 104,
        },
        13: {
          loc: {
            start: {
              line: 104,
              column: 16,
            },
            end: {
              line: 104,
              column: 40,
            },
          },
          type: 'binary-expr',
          locations: [
            {
              start: {
                line: 104,
                column: 16,
              },
              end: {
                line: 104,
                column: 21,
              },
            },
            {
              start: {
                line: 104,
                column: 25,
              },
              end: {
                line: 104,
                column: 40,
              },
            },
          ],
          line: 104,
        },
        14: {
          loc: {
            start: {
              line: 109,
              column: 20,
            },
            end: {
              line: 109,
              column: 57,
            },
          },
          type: 'cond-expr',
          locations: [
            {
              start: {
                line: 109,
                column: 33,
              },
              end: {
                line: 109,
                column: 47,
              },
            },
            {
              start: {
                line: 109,
                column: 50,
              },
              end: {
                line: 109,
                column: 57,
              },
            },
          ],
          line: 109,
        },
        15: {
          loc: {
            start: {
              line: 123,
              column: 12,
            },
            end: {
              line: 128,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 123,
                column: 12,
              },
              end: {
                line: 128,
                column: 13,
              },
            },
            {
              start: {
                line: 123,
                column: 12,
              },
              end: {
                line: 128,
                column: 13,
              },
            },
          ],
          line: 123,
        },
        16: {
          loc: {
            start: {
              line: 137,
              column: 12,
            },
            end: {
              line: 151,
              column: 13,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 137,
                column: 12,
              },
              end: {
                line: 151,
                column: 13,
              },
            },
            {
              start: {
                line: 137,
                column: 12,
              },
              end: {
                line: 151,
                column: 13,
              },
            },
          ],
          line: 137,
        },
        17: {
          loc: {
            start: {
              line: 143,
              column: 16,
            },
            end: {
              line: 145,
              column: 17,
            },
          },
          type: 'if',
          locations: [
            {
              start: {
                line: 143,
                column: 16,
              },
              end: {
                line: 145,
                column: 17,
              },
            },
            {
              start: {
                line: 143,
                column: 16,
              },
              end: {
                line: 145,
                column: 17,
              },
            },
          ],
          line: 143,
        },
      },
      s: {
        0: 1,
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 6,
        6: 6,
        7: 6,
        8: 6,
        9: 6,
        10: 47,
        11: 47,
        12: 47,
        13: 32,
        14: 32,
        15: 32,
        16: 6,
        17: 13,
        18: 13,
        19: 13,
        20: 13,
        21: 10,
        22: 10,
        23: 10,
        24: 6,
        25: 13,
        26: 13,
        27: 13,
        28: 13,
        29: 28,
        30: 28,
        31: 11,
        32: 6,
        33: 11,
        34: 0,
        35: 11,
        36: 11,
        37: 17,
        38: 3,
        39: 3,
        40: 13,
        41: 13,
        42: 6,
        43: 6,
        44: 6,
        45: 6,
        46: 6,
        47: 6,
        48: 48,
        49: 48,
        50: 6,
        51: 48,
        52: 6,
        53: 7,
        54: 7,
        55: 7,
        56: 6,
        57: 6,
        58: 0,
        59: 1,
        60: 6,
        61: 1,
      },
      f: {
        0: 6,
        1: 6,
        2: 47,
        3: 13,
        4: 13,
        5: 28,
        6: 6,
        7: 48,
      },
      b: {
        0: [5],
        1: [6, 6],
        2: [6, 5],
        3: [32, 15],
        4: [10, 3],
        5: [13, 10, 10],
        6: [11, 17],
        7: [6, 5],
        8: [0, 11],
        9: [3, 14],
        10: [17, 3, 3, 3, 3, 3, 3],
        11: [13, 0],
        12: [6, 7],
        13: [13, 13],
        14: [6, 0],
        15: [6, 42],
        16: [6, 1],
        17: [0, 6],
      },
    },
  ],
};
