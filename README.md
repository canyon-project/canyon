npm run lint:fix
git add .
git commit -m "feat: update" --no-verify

本地消费策略
1. 本地sqlite消息队列，存磁盘，根据pid分进程
2. 每个实例开轮询问，根据coverageID纬度获取锁
3. 本地不断合并，等获取到锁以后更新
5. 放弃本地实时remap，通过主动生成快照的方式提高
6. 生成快照记录！！！
