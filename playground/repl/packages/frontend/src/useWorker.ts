import { loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';

const UNPKG_URL = 'https://unpkg.com';
console.log(UNPKG_URL, 'UNPKG_URL');
await loader.config({
  paths: { vs: `${UNPKG_URL}/monaco-editor@0.52.2/min/vs` },
});

await loader.init().then((monaco) => {
  import('monaco-themes/themes/Night Owl.json').then((mod) => {
    const theme = (mod as { default: unknown })
      .default as Monaco.editor.IStandaloneThemeData;
    monaco.editor.defineTheme('nightOwl', theme);
  });
});
