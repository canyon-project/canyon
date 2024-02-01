import { FC } from 'preact/compat';

import { Dims, TrProps, Watermarks } from '../types';

const classForPercent = (
  type: Dims,
  value: number,
  _watermarks: Watermarks,
) => {
  const watermarks = _watermarks[type] as any;
  if (!watermarks) {
    return 'unknown';
  }
  if (value < watermarks[0]) {
    return 'low';
  }
  if (value >= watermarks[1]) {
    return 'high';
  }
  return 'medium';
};

const Tr: FC<TrProps> = ({ path, item, watermarks, setActivePath }) => {
  return (
    <tr>
      <td
        className={`file ${classForPercent(
          Dims.statements,
          item.statements.pct,
          watermarks,
        )}`}
        data-value={path}
      >
        <a
          onClick={() => {
            setActivePath(path);
          }}
        >
          {path.split('/').at(-1)}
        </a>
      </td>

      <td
        data-value={item.statements.pct}
        className={`pic ${classForPercent(
          Dims.statements,
          item.statements.pct,
          watermarks,
        )}`}
      >
        <div className="chart">
          <div
            className="cover-fill cover-full"
            style={`width: ${item.statements.pct}%`}
          />
          <div className="cover-empty" style="width: 0%" />
        </div>
      </td>

      {Object.values(Dims).map((value) => {
        return (
          <>
            <td
              data-value="100"
              className={`pct ${classForPercent(
                value,
                item[value].pct,
                watermarks,
              )}`}
            >
              {item[value].pct}%
            </td>
            <td
              data-value="3"
              className={`abs ${classForPercent(
                value,
                item[value].pct,
                watermarks,
              )}`}
            >
              {item[value].covered}/{item[value].total}
            </td>
          </>
        );
      })}
    </tr>
  );
};

export default Tr;
