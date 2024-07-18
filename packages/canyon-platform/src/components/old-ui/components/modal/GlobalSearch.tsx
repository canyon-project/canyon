import { forwardRef, useImperativeHandle, useState } from 'react';

const { Search } = Input;
const CanyonModalGlobalSearch = (props, ref) => {
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
