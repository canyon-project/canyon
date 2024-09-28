window["packages/canyon-platform/src/pages/index/projects/[id]/configure/helper/TagTable.tsx"] = {"content":"import { PlusOutlined, TagOutlined } from \"@ant-design/icons\";\nimport { useMutation } from \"@apollo/client\";\nimport { useParams } from \"react-router-dom\";\n\nimport { UpdateProjectDocument } from \"../../../../../../helpers/backend/gen/graphql.ts\";\ntype FieldType = {\n  id?: string;\n  name?: string;\n  link?: string;\n  color?: string;\n};\n\nconst gridStyle: any = {\n  width: \"100%\",\n};\nfunction setDByeky(key, item, list) {\n  const newList = JSON.parse(JSON.stringify(list));\n\n  const f = newList.findIndex((i) => i.id === key);\n  if (f > -1) {\n    newList[f] = {\n      ...item,\n    };\n  } else {\n    console.log(\"什么也不做\");\n  }\n  return newList;\n}\n\nconst CanyonColorPicker = ({ value, onChange }) => {\n  return (\n    <div>\n      <ColorPicker\n        showText\n        disabledAlpha\n        value={value}\n        onChange={(color, hex) => {\n          onChange(hex);\n        }}\n      />\n    </div>\n  );\n};\n\nconst TagTable = ({ tags }) => {\n  const [activeID, setActiveID] = useState(\"\");\n  const [dataSource, setDataSource] = useState([]);\n  const [open, setOpen] = useState(false);\n  const { t } = useTranslation();\n  useEffect(() => {\n    if (tags !== undefined) {\n      setDataSource(\n        tags.map(({ id, name, link, color }) => ({\n          id,\n          name,\n          link,\n          color,\n        })),\n      );\n    }\n  }, [tags]);\n  const columns = [\n    {\n      title: \"ID\",\n      dataIndex: \"id\",\n      key: \"id\",\n      render(text) {\n        return <span className={\"block w-[100px]\"}>{text}</span>;\n      },\n    },\n    {\n      title: t(\"projects.config.name\"),\n      dataIndex: \"name\",\n      key: \"name\",\n    },\n    {\n      title: t(\"projects.config.link\"),\n      dataIndex: \"link\",\n      key: \"link\",\n      width: \"300px\",\n      render(text) {\n        return (\n          <a\n            href={text}\n            target=\"_blank\"\n            className={\"w-[200px] block\"}\n            style={{ textWrap: \"wrap\" }}\n            rel=\"noreferrer\"\n          >\n            {text}\n          </a>\n        );\n      },\n    },\n    {\n      title: t(\"projects.config.color\"),\n      dataIndex: \"color\",\n      key: \"color\",\n      render(text, record) {\n        return <Tag color={text}>{record.name}</Tag>;\n      },\n    },\n    {\n      title: t(\"common.option\"),\n      render(text, record) {\n        return (\n          <>\n            <a\n              onClick={() => {\n                setActiveID(record.id);\n                setOpen(true);\n              }}\n            >\n              {t(\"common.edit\")}\n            </a>\n\n            <Divider type={\"vertical\"} />\n            <a\n              className={\"text-red-500 hover:text-red-500\"}\n              onClick={() => {\n                setDataSource(dataSource.filter((i) => i.id !== record.id));\n              }}\n            >\n              {t(\"common.delete\")}\n            </a>\n          </>\n        );\n      },\n    },\n  ];\n\n  function onFinish(values) {\n    console.log(values);\n    setDataSource(setDByeky(activeID, values, dataSource));\n  }\n\n  const [form] = Form.useForm();\n  const [updateProject] = useMutation(UpdateProjectDocument);\n  const prm = useParams();\n\n  useEffect(() => {\n    form.setFieldsValue(dataSource.find((i) => i.id === activeID));\n  }, [activeID]);\n\n  return (\n    <div>\n      <Card\n        title={\n          <div className={\"flex items-center\"}>\n            <TagOutlined className={\"text-[#687076] mr-2 text-[16px]\"} />\n            <span>{t(\"projects.config.tag\")}</span>\n          </div>\n        }\n      >\n        <Card.Grid hoverable={false} style={gridStyle}>\n          <Table\n            dataSource={dataSource}\n            columns={columns}\n            bordered={true}\n            pagination={false}\n            size={\"small\"}\n          />\n          <div className={\"h-5\"}></div>\n          <Space>\n            <Button\n              type={\"primary\"}\n              onClick={() => {\n                updateProject({\n                  variables: {\n                    projectID: prm.id as string,\n                    coverage: \"__null__\",\n                    description: \"__null__\",\n                    defaultBranch: \"__null__\",\n                    tags: dataSource,\n                  },\n                }).then(() => {\n                  message.success(\"保存成功\");\n                });\n              }}\n            >\n              {t(\"projects.config.save.changes\")}\n            </Button>\n            <Button\n              icon={<PlusOutlined />}\n              onClick={() => {\n                setDataSource(\n                  dataSource.concat({\n                    id: String(Math.random()),\n                    name: \"tagname\",\n                    link: \"\",\n                    color: \"#0071c2\",\n                  }),\n                );\n              }}\n            >\n              {t(\"common.add\")}\n            </Button>\n          </Space>\n        </Card.Grid>\n      </Card>\n\n      <Drawer\n        title={t(\"projects.config.edit.tag\")}\n        destroyOnClose={true}\n        width={\"35%\"}\n        open={open}\n        onClose={() => {\n          setOpen(false);\n          form.submit();\n        }}\n      >\n        <Form form={form} name=\"basic\" layout={\"vertical\"} onFinish={onFinish}>\n          <Form.Item<FieldType> label=\"ID\" name=\"id\">\n            <Input disabled />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.name\")} name=\"name\">\n            <Input />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.link\")} name=\"link\">\n            <Input placeholder={t(\"projects.config.link.placeholder\")} />\n          </Form.Item>\n\n          <Form.Item<FieldType> label={t(\"projects.config.color\")} name=\"color\">\n            <CanyonColorPicker />\n          </Form.Item>\n        </Form>\n      </Drawer>\n    </div>\n  );\n};\n\nexport default TagTable;\n","coverage":{"name":"zt"}}