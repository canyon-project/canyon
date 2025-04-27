import { Drawer } from 'antd'
const CoverageDetail = ({ open, onClose }) => {
  return (
    <Drawer
      width={'75%'}
      open={open}
      onClose={onClose}
      title={'xtaro-hotel-search be99188 手工测试 API响应测试'}
    ></Drawer>
  );
};

export default CoverageDetail;
