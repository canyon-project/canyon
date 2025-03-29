1. 插桩路径需不需要还原？
如果buildID来区分，就不需要还原，因为不插桩路径肯定一样

2. sourceMap按需还原

3. 行覆盖率还需要一个sMapStart的字段

4. 数据格式化，暂时不支持window，取出null和undefined 用zod 格式化一下，很重要！！！

5. 通过率不存，通过接口
