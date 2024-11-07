(function () {
    var globalObj = undefined;
    try {
        globalObj = new Function('return this')();
    } catch (e) {
        if (typeof window !== "undefined") {
            globalObj = window;
        } else if (typeof global !== "undefined") {
            globalObj = global;
        } else {
            //   do nothing
        }
    }
    if (globalObj){

        //   ***start***

        globalObj.__canyon__ = {
            projectID: 'PROJECT_ID',
            buildID:'BUILD_ID',
            dsn: 'DSN',
            instrumentCwd: 'INSTRUMENT_CWD',
            reporter: 'REPORTER',
            commitSha: 'COMMIT_SHA',
            sha: 'COMMIT_SHA',
            reportID: 'REPORT_ID',
            compareTarget: 'COMPARE_TARGET',
            branch: 'BRANCH',
            version: 'VERSION',
            intervalTime: 'INTERVAL_TIME'
        }


        // **end***
    }
})()
