// custom-reporter.cjs
const { ReportBase } = require('istanbul-lib-report')
const CCR = require('canyon-report')
const fs = require('fs')
module.exports = class CustomReporter extends ReportBase {
    constructor(opts) {
        super()
        console.log(opts,'opts')
        // Options passed from configuration are available here
        this.coverage = {}
    }

    onStart(root, context) {

    }

    onDetail(node, context) {
        // console.log(root,context)
        const fileCoverage = node.getFileCoverage().toJSON()
        console.log(fileCoverage)
        this.coverage[fileCoverage.path] = fileCoverage
    }

    async onEnd() {
        fs.writeFileSync('./coverage/coverage-final.json', JSON.stringify(this.coverage))
        const ccr = CCR({
            name: 'My Coverage Report - 2024-02-28',
            outputDir: './coverage-reports',
            reports: ["v8", "console-details"],
            cleanCache: true
        });
        await ccr.add({});
        await ccr.generate();
    }
}
