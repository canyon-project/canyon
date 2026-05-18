# Compare、快照与变更覆盖率报告

通过「创建 Compare」得到的覆盖率视图具有 **[覆盖率累积](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/core-concepts/accumulative-coverage)** 特性：在 Base → Head 这一区间内，只要某段代码在任一已上报覆盖率的 commit 对应的测试里被执行过，就会在该对比结果中计为已覆盖。下文说明在控制台中的典型操作流程。

---

## 一、创建 Compare

- **Base**：作为对比起点的历史版本 **Commit SHA**（通常选分支公共祖先或合并目标）。
- **Head**：在 Commit 列表中 **已经上报过覆盖率** 的 **Commit SHA**。

填写并创建 Compare 后，系统会基于该区间聚合覆盖率数据。

![创建 Compare：填写 Base 与 Head](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/static/docs/core-concepts/compare-workflow/create-compare.png)

---

## 二、创建快照

Compare 创建成功后，打开 **查看覆盖率报告** 即可看到基于当前区间的实时覆盖率。

当本轮测试结束后，可通过 **创建快照** 将当前视图固化为 **离线报告包**，便于归档、分享或与后续版本对照。快照概念详见 [快照（Snapshot）](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/core-concepts/snapshot)。

![创建快照：固化当前 Compare 覆盖率视图](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/static/docs/core-concepts/compare-workflow/create-snapshot.png)

---

## 三、查看覆盖率报告

在快照列表中进入 **查看快照记录**，下载并解压报告包后打开其中的报告页面。

在报告中可通过 **Change Statements** 查看当前 Compare 下 **变更语句** 的覆盖情况（哪些变更行曾被测试命中）。

![报告中通过 Change Statements 查看变更语句覆盖率](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/static/docs/core-concepts/compare-workflow/view-report.png)

---

## 四、快速定位未覆盖代码块

在报告界面中结合变更视图与未覆盖高亮，可以快速缩小 **尚未被测试触达的代码块** 范围，用于补充用例或评审风险。

![快速定位未覆盖代码块](https://cdn.jsdelivr.net/gh/canyon-project/assets/docs/static/docs/core-concepts/compare-workflow/locate-uncovered.png)
