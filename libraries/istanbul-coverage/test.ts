import {sourceMapFixer} from './src'
import c1 from './features/c1.json'
sourceMapFixer(c1 as any,'instrumentCwd')
