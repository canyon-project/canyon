// import dayjs from 'dayjs';

export function percent(covered, total) {
    let tmp;
    if (total > 0) {
        tmp = (1000 * 100 * covered) / total;
        return Math.floor(tmp / 10) / 100;
    } else {
        return 100.0;
    }
}

export function removeNullKeys(obj) {
    const newObj = {};
    for (const key in obj) {
        if (obj[key] !== null) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
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
