import libCoverage from "istanbul-lib-coverage";
import libSourceMaps from "istanbul-lib-source-maps";
import { mergeCoverageMap as mergeCoverageMapOfCanyonData } from "canyon-data";
import { decompressedData } from "./zstd";
// import { merge_coverage_json_str } from 'canyon-data';
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
export async function formatReportObject(c: any) {
    // 去除斜杠\\
    const removeSlash = (x: any) =>
        JSON.parse(JSON.stringify(x).replace(/\\\\/g, "/"));
    const coverage = removeSlash(await remapCoverage(c.coverage));
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
    return {
        coverage: removeStartEndNull(obj),
        instrumentCwd,
    };
}
// 覆盖率回溯，在覆盖率存储之前转换
async function remapCoverage(obj: any) {
    const res = await libSourceMaps
        .createSourceMapStore()
        .transformCoverage(libCoverage.createCoverageMap(obj));
    const { data: data_1 } = res;
    const obj_1: any = {};
    for (const dataKey in data_1) {
        const x = data_1[dataKey]["data"];
        obj_1[x.path] = x;
    }
    return obj_1;
}

function getJsonSize(jsonObj) {
    // 创建一个 TextEncoder 实例
    const encoder = new TextEncoder();

    // 将 JSON 对象转换为字符串
    const jsonString = JSON.stringify(jsonObj);

    // 将 JSON 字符串转换为字节数组
    const encodedJson = encoder.encode(jsonString);

    // 返回字节数组的长度
    return encodedJson.length / 1024 / 1024;
}

export const mergeCoverageMap = (cov1: any, cov2: any) => {
    // 超过2M的数据用js合并
    const size = getJsonSize(cov1);
    if (size > 0) {
        // console.log(`size of cov1: ${size}M`);
        return mergeCoverageMapOfCanyonData(cov1, cov2);
    } else {
        return mergeCoverageMapOfCanyonData(cov1, cov2);
        // return JSON.parse(
        //   merge_coverage_json_str(JSON.stringify(cov1), JSON.stringify(cov2)),
        // );
    }
};

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

// TODO：在覆盖率map数据上来的时候，有必要做一次过滤，去掉start和end为空的情况。然后再交由zod进行校验，这里需要非常严格的校验。
const removeStartEndNull = (coverage) => {
    const obj = {};
    Object.keys(coverage).forEach((key) => {
        const item = coverage[key];

        // 创建一个新的branchMap，用于存储处理后的结果
        const newBranchMap = {};

        Object.keys(item.branchMap).forEach((statementKey) => {
            const locations = item.branchMap[statementKey].locations;
            const newLocations = [];

            for (let i = 0; i < locations.length; i++) {
                const location = locations[i];

                // 如果start和end都不为空对象，则保留该位置信息
                if (
                    Object.keys(location.start).length !== 0 ||
                    Object.keys(location.end).length !== 0
                ) {
                    newLocations.push(location);
                }
            }

            // 将处理后的新位置信息存入新的branchMap
            if (newLocations.length > 0) {
                newBranchMap[statementKey] = {
                    ...item.branchMap[statementKey],
                    locations: newLocations,
                };
            }
        });

        // 如果新的branchMap有数据，则将其存入处理后的对象
        if (Object.keys(newBranchMap).length > 0) {
            obj[key] = {
                ...item,
                branchMap: newBranchMap,
            };
        } else {
            obj[key] = item;
        }
    });
    // fs.writeFileSync('./coverage.json', JSON.stringify(obj));
    return obj;
};

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
