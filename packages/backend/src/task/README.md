# Task Service 分布式部署说明

## 概述

`TaskService` 负责处理覆盖率数据的聚合和清理任务。当前实现**仅支持单机部署**，在多集群/多实例部署时存在并发问题。

## 当前实现的问题

### 1. 进程内锁无法跨实例

当前代码使用进程内的 `isRunning` 和 `isDelRunning` 标志来防止重复执行：

```typescript
private isRunning = false;
private isDelRunning = false;
```

这些变量只在单个 Node.js 进程内有效，**无法防止多个实例同时执行相同的任务**。

### 2. 并发问题场景

#### 覆盖率聚合任务 (`pollOnce`)

- **问题**：多个实例可能同时查询到相同的 `coverageID`，并同时开始处理
- **后果**：
  - 重复处理相同的数据
  - 数据竞争导致聚合结果不准确
  - 可能导致数据不一致

#### 删除任务 (`pollDelOnce`)

- **问题**：多个实例可能同时执行删除操作
- **后果**：
  - 虽然删除操作是幂等的，但会产生不必要的数据库负载
  - 日志可能重复记录

## 解决方案

如果需要支持多集群部署，需要实现分布式锁机制。推荐方案：

### 方案 1: PostgreSQL Advisory Lock（推荐）

使用 PostgreSQL 的 advisory lock 功能，无需额外的中间件：

```typescript
// 获取锁
const locked = await prisma.$queryRaw<Array<{ locked: boolean }>>`
  SELECT pg_try_advisory_lock(hashtext(${coverageID})::bigint) AS locked
`;

// 释放锁
await prisma.$queryRaw`
  SELECT pg_advisory_unlock(hashtext(${coverageID})::bigint)
`;
```

**优点**：
- 无需额外依赖（PostgreSQL 已在使用）
- 性能好，锁在数据库层面
- 自动释放（连接断开时）

**缺点**：
- 依赖 PostgreSQL 连接
- 锁与数据库连接绑定

### 方案 2: Redis 分布式锁

使用 Redis 实现分布式锁：

```typescript
// 使用 redis 或 ioredis
const lockKey = `task:coverage:${coverageID}`;
const locked = await redis.set(lockKey, '1', 'EX', 300, 'NX');
```

**优点**：
- 独立于数据库
- 支持锁过期时间
- 性能好

**缺点**：
- 需要额外的 Redis 服务
- 需要处理锁过期和续期

### 方案 3: 数据库乐观锁

使用数据库的 `SELECT FOR UPDATE` 或版本号机制：

```typescript
// 使用事务 + SELECT FOR UPDATE
await prisma.$transaction(async (tx) => {
  const record = await tx.coverHit.findFirst({
    where: { aggregated: false, coverageID },
    orderBy: { ts: 'asc' },
    // 锁定行
  });
  // 处理逻辑
});
```

**优点**：
- 利用数据库事务
- 无需额外服务

**缺点**：
- 可能影响数据库性能
- 需要仔细设计锁粒度

## 当前部署建议

### 单机部署

当前实现完全适用于单机部署，无需修改。

### 多实例部署

如果必须多实例部署，建议：

1. **只在一个实例上启用任务**：
   - 设置环境变量 `START_DISTRIBUTED_TASK=1` 只在主实例上
   - 其他实例不设置该环境变量

2. **使用进程管理器**：
   - 使用 PM2、Kubernetes 等确保只有一个实例运行任务

3. **实现分布式锁**：
   - 按照上述方案之一实现分布式锁机制

## 环境变量

- `START_DISTRIBUTED_TASK`: 是否启动定时任务（任意值即可）
- `TASK_COVERAGE_AGG_POLL_MS`: 聚合任务轮询间隔（默认 3000ms）
- `TASK_COVERAGE_DEL_POLL_MS`: 删除任务轮询间隔（默认 30000ms）

## 相关文件

- `task.service.ts`: 任务服务实现
- `task.types.ts`: 类型定义
- `task.module.ts`: NestJS 模块配置

