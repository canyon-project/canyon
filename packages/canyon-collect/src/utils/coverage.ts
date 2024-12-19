import { decompressedData } from "./zstd";

function parseInstrumentCwd(instrumentCwd) {
    if (instrumentCwd.includes("=>")) {
        const instrumentCwdSplit = instrumentCwd.split("=>");
        return [instrumentCwdSplit[0], instrumentCwdSplit[1]];
    } else {
        return [instrumentCwd, ""];
    }
}
function convertInstrumentCwd({ path, instrumentCwd, projectInstrumentCwd }) {
    if (!projectInstrumentCwd) {
        return path.replace(instrumentCwd, "");
    } else {
        // 这里需要解析一下instrumentCwd，如果包含"=>"，则需要替换。
        const [leftInstrumentCwd, rightInstrumentCwd] =
            parseInstrumentCwd(projectInstrumentCwd);
        return path
            .replace(instrumentCwd, "")
            .replace(leftInstrumentCwd, rightInstrumentCwd);
    }
}
// 格式化上报的覆盖率对象
export function formatReportObject(c: any) {
    // 去除斜杠\\
    const removeSlash = (x: any) =>
        JSON.parse(JSON.stringify(x).replace(/\\\\/g, "/"));
    // 暂时解决方案，需要解决sourceMap问题
    const coverage = removeSlash(c.coverage);
    const instrumentCwd = removeSlash(c.instrumentCwd);
    const projectInstrumentCwd = removeSlash(c.projectInstrumentCwd || "");
    const reversePath = (p: string) => {
        const a = convertInstrumentCwd({
            path: p,
            instrumentCwd,
            projectInstrumentCwd,
        });
        let b = "";
        // 从第二个字符开始
        for (let i = 1; i < a.length; i++) {
            b += a[i];
        }
        return "" + b;
    };
    const obj: any = {};
    for (const coverageKey in coverage) {
        obj[reversePath(coverageKey)] = {
            ...coverage[coverageKey],
            path: reversePath(coverageKey),
        };
    }

    // 确保修改成istanbul格式，去掉start、end为空的情况

    return {
        coverage: obj,
        instrumentCwd,
    };
}

export function resetCoverageData(coverageData) {
    return Object.entries(coverageData).reduce((acc, [key, value]: any) => {
        acc[key] = {
            ...value,
            s: Object.entries(value.s).reduce((accInside, [keyInside]) => {
                accInside[keyInside] = 0;
                return accInside;
            }, {}),
            f: Object.entries(value.f).reduce((accInside, [keyInside]) => {
                accInside[keyInside] = 0;
                return accInside;
            }, {}),
            b: Object.entries(value.b).reduce(
                (accInside, [keyInside, valueInside]: any) => {
                    accInside[keyInside] = Array(valueInside.length).fill(0);
                    return accInside;
                },
                {},
            ),
        };
        return acc;
    }, {});
}

export const convertDataFromCoverageMapDatabase = async (
    coverageMaps: {
        projectID: string;
        sha: string;
        // path: string;
        instrumentCwd: string;
        map: Buffer;
    }[],
): Promise<{
    map: any;
    instrumentCwd: string;
}> => {
    const decompressedCoverageMaps = await Promise.all(
        coverageMaps.map((coverageMap) => {
            return decompressedData(coverageMap.map).then((map) => {
                return map;
            });
        }),
    );
    return {
        map: decompressedCoverageMaps.reduce((acc, cur) => {
            return {
                ...acc,
                // @ts-ignore
                [cur.path]: cur,
            };
        }, {}),
        instrumentCwd: coverageMaps[0].instrumentCwd,
    };
};
