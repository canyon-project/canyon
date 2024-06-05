import { Button, theme } from 'antd';
import { useMemo, useState } from 'react';

// import { Spin } from 'antd';
import JacocoControl from './control.jsx';
import JacocoFiledetail from './filedetail.jsx';
import JacocoOverview from './overview.jsx';
import JacocoTable from './table.jsx';

const { useToken } = theme;
function gen(path, line) {
  return line ? path + '#L' + line : path;
}
const JacocoReport = ({ summary, selectedKey, onSelect, selectedLine,title }) => {
  const { token } = useToken();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const [sourcecode, setSourcecode] = useState('');

  const dataSource = useMemo(() => {
    // TODO ??? 不要将内部数据放在外部
    onSelect(gen(selectedKey,selectedLine)).then((res) => {
      console.log(res,'!!!!!')
      setSourcecode(res.sourcecode);
    });

    // 这里的逻辑是，按照路径长度排序，含有“/”多的先匹配
    const finPpackage = summary.report.package
      .sort((a, b) => -a.name.split('/').length + b.name.split('/').length)
      .find((item) => {
        return selectedKey.includes(item.name);
      });
    const findClass = finPpackage
      ? finPpackage.class.find((item) => {
          return selectedKey.includes(item.name);
        })
      : null;

    // setIsClass(false);

    if (finPpackage && finPpackage.name === selectedKey) {
      setBreadcrumbs([
        {
          name: finPpackage.name.replaceAll('/', '.'),
          path: finPpackage.name,
          type: 'package',
        },
      ]);
      return finPpackage.class;
    }
    if (findClass && findClass.name === selectedKey) {
      setBreadcrumbs([
        {
          name: finPpackage.name.replaceAll('/', '.'),
          path: finPpackage.name,
          type: 'package',
        },
        {
          name: findClass.name.replace(finPpackage.name, '').replaceAll('/', ''),
          path: findClass.name,
          type: 'class',
        },
      ]);

      // 这里需要重制

      // 如果全匹配，就是个class，返回methods

      // console.log(findClass.method instanceof Array,'sss')

      // TODO: 这里要注意，可能是接口
      return findClass.method;
    }
    // setActiveFileLine(0)
    setBreadcrumbs([]);
    return summary.report.package;
    // return data;
  }, [selectedKey, summary,selectedLine]);

  const onSelectControl = (path) => {
    onSelect(path);
  };

  const onSelectTable = (path) => {
    onSelect(path);
  };

  const filecoverage = summary.report.package[4].sourcefile[0];

  return (
    <div
      // className='p-2 rounded-md bg-white dark:bg-[#151718]'
      // style={{
      //   // border: `1px solid ${token.colorBorder}`,
      //   boxShadow: `${token.boxShadowTertiary}`,
      // }}
    >
      {/*Line: {selectedLine}*/}
      <JacocoControl name={title} items={breadcrumbs} onSelect={onSelectControl} />

      <JacocoOverview />

      {selectedLine > 0 ? (
        <JacocoFiledetail sourcecode={sourcecode} filecoverage={filecoverage} />
      ) : (
        <JacocoTable
          dataSource={dataSource}
          selectedKey={selectedKey}
          onSelect={onSelectTable}
          items={breadcrumbs}
        />
      )}
    </div>
  );
};

export default JacocoReport;
