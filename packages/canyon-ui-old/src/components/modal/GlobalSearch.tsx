// import { CanyonCardPrimary } from './index.ts';
import { StockOutlined } from '@ant-design/icons';
import { Button, Col, Divider, Modal, Row, Space, Statistic, theme, Typography,Input } from 'antd';
import { forwardRef, useImperativeHandle, useState } from 'react';
const { useToken } = theme;
const { Title } = Typography;
const { Search } = Input;
const CanyonModalGlobalSearch = (props, ref) => {
  // useRef
  // const { token } = useToken();
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    report: () => {
      setOpen(true);
    },
  }));

  return (
    <Modal
      closeIcon={false}
      width={770}
      open={open}
      onCancel={() => {
        setOpen(false);
      }}
      onOk={() => {
        setOpen(false);
      }}
      footer={false}
    >
      <Search></Search>
    </Modal>
  );
};

export default forwardRef(CanyonModalGlobalSearch);
