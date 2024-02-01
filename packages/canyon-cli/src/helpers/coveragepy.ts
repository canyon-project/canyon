import glob from 'fast-glob'

import { isProgramInstalled, runExternalProgram } from "./util"
import { info } from './logger'

export async function generateCoveragePyFile(projectRoot: string, overrideFiles: string[]): Promise<string> {
    if (!isProgramInstalled('coverage')) {
        return 'coveragepy is not installed'
    }

    if (overrideFiles.length > 0) {
        return `Skipping coveragepy, files already specified`
    }

    const dotCoverage = await glob(
        ['.coverage', '.coverage.*'],
        {cwd: projectRoot, dot: true, onlyFiles: true},
    )
    if (dotCoverage.length == 0) {
        return 'Skipping coveragepy, no .coverage file found.'
    }

    info('Running coverage xml...')
    return runExternalProgram('coverage', ['xml']);
}
