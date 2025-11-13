# 代办

- 上报，分hit、map、未分离的
- 分布式锁消费hit表导agg表
- 查询，查询的时候分version id、coverage id，只需要分reportID、build_target就行了，如果build_target为空，但是存在多个的情况下用空字符串
- /coverage/map /coverage/summary/map 单个覆盖率
- 暂时不管diff、硬合并
- cli
- canyonjs/plugin-babel
