import * as dayjs from "dayjs";

export function percent(covered, total) {
    let tmp;
    if (total > 0) {
        tmp = (1000 * 100 * covered) / total;
        return Math.floor(tmp / 10) / 100;
    } else {
        return 100.0;
    }
}


export function deleteID(obj) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...rest } = obj;
    return rest;
}

export function mapToLowerCamelCase(coverage): any {
    return {
        id: coverage.id,
        sha: coverage.sha,
        reportID: coverage.report_id,
        relationID: coverage.relation_id,
        covType: coverage.cov_type,
        consumer: coverage.consumer,
        branch: coverage.branch,
        device: coverage.device,
        ip: coverage.ip,
        compareTarget: coverage.compare_target,
        projectID: coverage.project_id,
        instrumentCwd: coverage.instrument_cwd,
        reporter: coverage.reporter,
    };
}

export const within30days = (time) => {
    // 获取当前日期
    const currentDate = dayjs();
    // 获取item的更新日期
    const updatedAt = dayjs(time);
    // 计算当前日期和更新日期之间的天数差
    const differenceInDays = currentDate.diff(updatedAt, "day");
    // 判断是否在30天以内
    return differenceInDays <= 30;
};

export function resolveProjectID(projectID) {
    return projectID.split("-")[1] || projectID;
}
