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
    return `${projectID.split("-")[0]}-${projectID.split("-")[1]}-auto`;
}
