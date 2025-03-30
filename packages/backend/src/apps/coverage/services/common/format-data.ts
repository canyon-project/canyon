// 1. 初始化覆盖率数据，一般有hit，先不管
// 2. 未分离的
// 3. 已分离的，只有hit。

// 如果是1，直接进map插入
// 如果是2，先进map，再进hit
// 如果是3，不处理

// 只需要注意一点，以branch的end可能是没有的，要删除一下
// 实验一下swc、istanbul是怎么处理的，准备初试话数据的时候写在源码里
export const formatData = (coverage) => {
  return coverage
}
