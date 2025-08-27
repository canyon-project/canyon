import { loader } from '@monaco-editor/react'

const UNPKG_URL = 'https://unpkg.com'
console.log(UNPKG_URL, 'UNPKG_URL')
loader.config({
  paths: { vs: `${UNPKG_URL}/monaco-editor@0.52.2/min/vs` },
})

loader.init().then((monaco) => {
  import('monaco-themes/themes/Night Owl.json').then((data: any) => {
    monaco.editor.defineTheme('nightOwl', data)
  })
})
