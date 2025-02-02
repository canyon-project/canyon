import { FC } from "react";
import { Tag, Typography, theme } from "antd";
// import { getColor } from "../../helpers";
import { CoverageSummaryData } from "istanbul-lib-coverage";
import { getColor } from "../helpers";
import { css } from "@emotion/react";
const { Text } = Typography;
function convertFirstLetterToUpper(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
const { useToken } = theme;
const SummaryNav: FC<{
  reportName: string;
  value: string;
  onClick: (value: string) => void;
}> = ({ value, onClick, reportName }) => {
  // const {theme}
  const { token } = useToken();

  // console.log(token.colorPrimary,'token')
  return (
    <div
      css={css`
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bold;
      `}
    >
      {(reportName + "/" + value).split("/").map((item, index) => {
        return (
          <div
            key={index}
            css={css`
              display: flex;
              gap: 10px;
            `}
          >
            <a
              css={css`
                color: ${token.colorPrimary};
                cursor: pointer;
                &:hover {
                  text-decoration: underline;
                }
              `}
              key={index}
              onClick={() => {
                onClick(value.split("/").slice(0, index).join("/"));
              }}
            >
              {item}
            </a>
            {index === value.split("/").length || !value ? null : (
              <span>/</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SummaryMetric: FC<{
  data: CoverageSummaryData & { path: string };
}> = ({ data }) => {
  const t = (key: string) => key;
  const summaryTreeItem = {
    summary: data,
  };

  return (
    <div>
      <div
        css={css`
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        `}
      >
        {Object.entries(summaryTreeItem.summary)
          .sort(([key1], [key2]) => {
            const order = [
              "statements",
              "branches",
              "functions",
              "lines",
              "newlines",
            ];

            return order.indexOf(key1) - order.indexOf(key2);
          })
          .filter(([key]) =>
            [
              "statements",
              "branches",
              "functions",
              "lines",
              "newlines",
            ].includes(key),
          )
          .map(([key, value]) => {
            return (
              <div
                css={css`
                  display: flex;
                  gap: 3px;
                  align-items: center;
                `}
                key={key}
              >
                <span style={{ fontWeight: "600", fontSize: "14px" }}>
                  {value.pct}%
                </span>
                <Text style={{ fontSize: "14px" }} type={"secondary"}>
                  {convertFirstLetterToUpper(key)}:
                </Text>
                <Tag bordered={false}>
                  {value.covered}/{value.total}
                </Tag>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const SummaryBar: FC<{ pct: number }> = ({ pct }) => {
  return (
    <div
      css={css`
        height: 10px;
        width: 100%;
        margin-bottom: 10px;
        background-color: ${getColor(pct)};
      `}
    />
  );
};

const SummaryHeader: FC<{
  value: string;
  onSelect: (value: string) => void;
  data: CoverageSummaryData & { path: string };
  reportName: string;
}> = ({ value, onSelect, data, reportName }) => {
  return (
    <div>
      <SummaryNav reportName={reportName} value={value} onClick={onSelect} />
      <SummaryMetric data={data} />
      <SummaryBar pct={data.statements.pct} />
    </div>
  );
};

export default SummaryHeader;
