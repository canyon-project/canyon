import {decompressedData} from "./compress.ts";

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
                // @ts-ignore
                ...acc,
                // @ts-ignore
                [cur.path]: cur,
            };
        }, {}),
        instrumentCwd: coverageMaps[0].instrumentCwd,
    };
};
