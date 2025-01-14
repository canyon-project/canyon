import Highlighter from "react-highlight-words";
import { percent } from "canyon-data";
import { getCOlor } from "@/helpers/utils/common.ts";
const CanyonReportListTable = ({
  dataSource,
  loading,
  keywords,
  onSelect,
  onlyChange,
}) => {
  const { t } = useTranslation();
  const newlinesColumns = onlyChange
    ? [
        {
          title: t("projects.newlines"),
          width: "240px",
          sorter: (a, b) => {
            return (
              percent(a.newlines.covered, a.newlines.total) -
              percent(b.newlines.covered, b.newlines.total)
            );
          },
          // key: 'total',
          dataIndex: ["newlines", "total"],
          render(text, record) {
            return (
              <Space>
                <Progress
                  percent={percent(
                    record.newlines.covered,
                    record.newlines.total,
                  )}
                  strokeLinecap="butt"
                  size={"small"}
                  style={{ width: "100px" }}
                  strokeColor={getCOlor(
                    percent(record.newlines.covered, record.newlines.total),
                  )}
                  className={"pr-5"}
                  status={"normal"}
                />
                <span style={{ fontSize: "10px" }}>
                  ({record.newlines.covered}/{record.newlines.total})
                </span>
              </Space>
            );
          },
        },
        // {
        //   title: 'covered',
        //   key: 'covered',
        //   dataIndex: ['summary', 'newlines', 'covered'],
        // },
      ]
    : [];
  return (
    <div>
      <ConfigProvider
        theme={{
          token: {
            borderRadius: 0,
          },
        }}
      >
        {" "}
        <Table
          bordered={true}
          pagination={{
            defaultPageSize: 15,
          }}
          // pagination={false}
          size={"small"}
          dataSource={dataSource}
          loading={loading}
          columns={[
            {
              title: t("projects.detail.files"),
              key: "path",
              dataIndex: "path",
              // width: '200px',
              render(text) {
                return (
                  <a
                    className={"block break-words w-[420px]"}
                    onClick={() => {
                      onSelect({
                        path: text,
                      });
                    }}
                  >
                    <Highlighter
                      highlightClassName="YourHighlightClass"
                      searchWords={[keywords]}
                      autoEscape={true}
                      textToHighlight={text}
                    />
                  </a>
                );
              },
            },
            {
              title: t("common.total"),
              key: "total",
              dataIndex: ["statements", "total"],
              sorter(a, b) {
                return a.statements.total - b.statements.total;
              },
            },
            {
              title: t("common.covered"),
              key: "covered",
              dataIndex: ["statements", "covered"],
              sorter(a, b) {
                return a.statements.covered - b.statements.covered;
              },
            },
          ]
            .concat(newlinesColumns)
            .concat([
              {
                title: t("projects.config.coverage") + " %",
                width: "300px",
                key: "c",
                sorter: (a, b) => {
                  return a.statements.pct - b.statements.pct;
                },
                dataIndex: ["statements", "pct"],
                render(text) {
                  return (
                    <Progress
                      percent={text}
                      strokeLinecap="butt"
                      size={"small"}
                      strokeColor={getCOlor(text)}
                      className={"pr-5"}
                      status={"normal"}
                    />
                  );
                },
              },
            ])}
        />
      </ConfigProvider>
    </div>
  );
};

export default CanyonReportListTable;
