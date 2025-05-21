function vuehandler(file:string,data:any,instrumentCwd:string) {
  const {inputSourceMap} = data
  // console.log(inputSourceMap,'inputSourceMap')
  const newInputSourceMap = {
    ...inputSourceMap,
    sourceRoot: instrumentCwd+'/'+inputSourceMap.sourceRoot,
  }
  // console.log(newInputSourceMap,'newInputSourceMap')
  return {
    [file]: {
      ...data,
      inputSourceMap:newInputSourceMap
    }
  }
}
export function sourceMapFixer(coverage:[string, any][],instrumentCwd:string) {
  return Object.entries(coverage).map(([file, data]) => {
    if (file.includes('.vue')){
      return vuehandler(file, data,instrumentCwd)
    } else {
      return {
        [file]: data
      }
    }
  })
}
