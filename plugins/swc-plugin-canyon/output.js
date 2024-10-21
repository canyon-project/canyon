function add(a, b) {
    cov_7203494311566745303().f[0]++;
    cov_7203494311566745303().s[0]++;
    return a + b;
}
function cov_7203494311566745303() {
    var path = "file.js";
    var hash = "8840706931272611216";
    var global = new ((function(){}).constructor)("return this")();
    var gcv = "__coverage__";
    var coverageData = {
        all: false,
        path: "file.js",
        statementMap: {
            "0": {
                start: {
                    line: 2,
                    column: 4
                },
                end: {
                    line: 2,
                    column: 14
                }
            }
        },
        fnMap: {
            "0": {
                name: "add",
                decl: {
                    start: {
                        line: 1,
                        column: 9
                    },
                    end: {
                        line: 1,
                        column: 12
                    }
                },
                loc: {
                    start: {
                        line: 1,
                        column: 18
                    },
                    end: {
                        line: 3,
                        column: 1
                    }
                },
                line: 1
            }
        },
        branchMap: {},
        s: {
            "0": 0
        },
        f: {
            "0": 0
        },
        b: {},
        _coverageSchema: "11020577277169172593",
        hash: "8840706931272611216"
    };
    var coverage = global[gcv] || (global[gcv] = {});
    if (!coverage[path] || coverage[path].hash !== hash) {
        coverage[path] = coverageData;
    }
    var actualCoverage = coverage[path];
    {
        cov_7203494311566745303 = function cov_7203494311566745303() {
            return actualCoverage;
        };
    }
    return actualCoverage;
}
cov_7203494311566745303();

