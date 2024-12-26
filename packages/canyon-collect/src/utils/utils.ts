export function percent(covered, total) {
    let tmp;
    if (total > 0) {
        tmp = (1000 * 100 * covered) / total;
        return Math.floor(tmp / 10) / 100;
    } else {
        return 100.0;
    }
}

export const summaryToDbSummary = (summary) => {
    return {
        statementsCovered: summary.statements.covered,
        statementsTotal: summary.statements.total,
        branchesCovered: summary.branches.covered,
        branchesTotal: summary.branches.total,
        functionsCovered: summary.functions.covered,
        functionsTotal: summary.functions.total,
        linesCovered: summary.lines.covered,
        linesTotal: summary.lines.total,
        newlinesCovered: summary.newlines.covered,
        newlinesTotal: summary.newlines.total,
    };
};

export function resolveProjectID(projectID) {
    return projectID.split("-")[1] || projectID;
}
