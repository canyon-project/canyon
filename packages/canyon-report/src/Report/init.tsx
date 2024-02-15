import { render } from 'preact';

import IstanbulReport from './components/IstanbulReport';
import { loadCssCode } from './loadcss';
import { OnSelectFile } from './types';

const configWatermarks = {
  statements: [50, 80],
  functions: [50, 80],
  branches: [50, 80],
  lines: [50, 80],
};
const init = (
  dom: HTMLElement,
  { onSelectFile,theme,defaultPath }: { onSelectFile: OnSelectFile,theme:string,defaultPath:string },
) => {
  loadCssCode();
  render(
    <IstanbulReport
      theme={theme}
      onSelectFile={onSelectFile}
      watermarks={configWatermarks}
      defaultPath={defaultPath}
    />,
    dom!,
  );
  return {
    setOption({ summary }: { summary: any }) {
      setTimeout(() => {
        const event = new CustomEvent('setOptionEvent', { detail: summary });
        window.dispatchEvent(event);
      }, 60);
    },
  };
};
export default init;
