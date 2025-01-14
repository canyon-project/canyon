import { Divider, Drawer, Form } from "antd";
import { Editor } from "@monaco-editor/react";
import {
  FileAddOutlined,
  FolderAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const AutoInstrumentForm = ({ onChange, defaultDataSource }) => {
  // console.log(defaultDataSource)
  const [open, setOpen] = useState(false);
  const [activeContent, setActiveContent] = useState("");
  const [activeFilepath, setActiveFilepath] = useState("");
  const [dataSource, setDataSource] = useState(defaultDataSource);
  const [mode, setMode] = useState("create");

  useEffect(() => {
    onChange(defaultDataSource);
  }, []);

  const columns = [
    {
      title: "文件路径",
      dataIndex: "filepath",
      key: "filepath",
    },
    {
      title: "操作",
      width: 200,
      render: (_, record) => (
        <div>
          <a
            type="link"
            onClick={() => {
              setOpen(true);
              setMode("update");
              setActiveFilepath(record.filepath);
              setActiveContent(record.content);
            }}
          >
            编辑
          </a>
          <Divider type={"vertical"} />
          <a
            type="link"
            style={{ color: "red" }}
            onClick={() => {
              let newDataSource = dataSource.filter(
                (item) => item.filepath !== record.filepath,
              );
              setDataSource(newDataSource);
              onChange(newDataSource);
            }}
          >
            删除
          </a>
        </div>
      ),
    },
  ];

  function onClose() {
    let newDataSource = [];
    if (mode === "create") {
      // newDataSource = [
      //     ...dataSource,
      //     {
      //         filepath: activeFilepath,
      //         content: activeContent,
      //     }
      // ]

      // 去重，根据filepath，新的代替老的

      let exist = false;
      newDataSource = dataSource.map((item) => {
        if (item.filepath === activeFilepath) {
          exist = true;
          return {
            filepath: activeFilepath,
            content: activeContent,
          };
        }
        return item;
      });

      if (!exist) {
        newDataSource.push({
          filepath: activeFilepath,
          content: activeContent,
        });
      }
    } else {
      newDataSource = dataSource.map((item) => {
        if (item.filepath === activeFilepath) {
          return {
            filepath: activeFilepath,
            content: activeContent,
          };
        }
        return item;
      });
    }
    setDataSource(newDataSource);
    setOpen(false);
    onChange(newDataSource);
  }

  function handleAdd() {
    setOpen(true);
    setMode("create");
    setActiveFilepath("");
    setActiveContent("");
  }

  return (
    <div>
      <Button
        onClick={handleAdd}
        size={"small"}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        添加文件
      </Button>
      <Table
        key={"filepath"}
        pagination={false}
        bordered={true}
        size={"small"}
        dataSource={dataSource}
        columns={columns}
      />
      <Drawer
        title={`${mode === "create" ? "添加" : "编辑"} ${activeFilepath}`}
        width={"45%"}
        open={open}
        onClose={onClose}
      >
        <Form>
          <Form.Item label={"文件路径"}>
            <Input
              disabled={mode === "update"}
              value={activeFilepath}
              onChange={(e) => {
                setActiveFilepath(e.target.value);
              }}
            />
          </Form.Item>

          <Form.Item label={"文件内容"}>
            <div
              style={{
                border: "1px solid #d9d9d9",
              }}
            >
              <Editor
                language={"javascript"}
                options={{
                  minimap: {
                    enabled: false,
                  },
                  fontSize: 12,
                  wordWrap: "wordWrapColumn",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
                value={activeContent}
                height={"70vh"}
                onChange={(v) => {
                  setActiveContent(v || "");
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AutoInstrumentForm;
