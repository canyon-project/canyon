npm run lint:fix
git add .
git commit -m "feat: add ui" --no-verify

本地消费策略
1. 本地sqlite消息队列，存磁盘，根据pid分进程
2. 每个实例开轮询问，根据coverageID纬度获取锁
3. 本地不断合并，等获取到锁以后更新
4. 查询的时候再remap，只能说查询的时候快一些
5. 开启两个策略，实时remap。获取的时候remap？
