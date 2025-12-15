# 覆盖率报告导出功能

## 功能概述

该功能允许用户导出指定 commit 的覆盖率报告，支持多种格式，并自动从 GitLab 获取源代码文件。

## API 端点

```
GET /api/coverage/export
```

## 请求参数

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| provider | string | 是 | 代码托管平台 (如 'gitlab') |
| repoID | string | 是 | 仓库 ID |
| sha | string | 是 | Git commit SHA |
| buildTarget | string | 否 | 构建目标 |
| reportProvider | string | 否 | 报告提供者 |
| reportID | string | 否 | 报告 ID |
| format | string | 否 | 导出格式 (html/json/lcov/cobertura)，默认 html |

## 支持的导出格式

- **HTML**: 交互式 HTML 报告 (默认)
- **JSON**: JSON 格式的覆盖率数据
- **LCOV**: LCOV 格式，兼容多种工具
- **COBERTURA**: Cobertura XML 格式

## 使用示例

### 基本用法 (使用覆盖率数据中的源码)

```bash
curl "http://localhost:3000/api/coverage/export?provider=gitlab&repoID=project-id&sha=abc123def456&format=html" \
  --output coverage-report.zip
```

### 使用配置的 GitLab 获取源码

```bash
curl "http://localhost:3000/api/coverage/export?provider=gitlab&repoID=project-id&sha=abc123def456&format=html" \
  --output coverage-report.zip
```

### 导出不同格式

```bash
# 导出 LCOV 格式
curl "http://localhost:3000/api/coverage/export?provider=gitlab&repoID=project-id&sha=abc123def456&format=lcov" \
  --output coverage-lcov.zip

# 导出 JSON 格式  
curl "http://localhost:3000/api/coverage/export?provider=gitlab&repoID=project-id&sha=abc123def456&format=json" \
  --output coverage-json.zip
```

## 前端集成示例

```javascript
// 方法1：直接下载链接（推荐）
function downloadCoverageReport(params) {
  const queryParams = new URLSearchParams(params).toString();
  const downloadUrl = `/api/coverage/export?${queryParams}`;
  
  // 创建隐藏的下载链接
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `coverage-report-${params.sha.substring(0, 8)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// 方法2：使用 fetch 下载
async function exportCoverageReport(params) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`/api/coverage/export?${queryParams}`);

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // 下载文件
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coverage-report-${params.sha.substring(0, 8)}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export failed:', error);
  }
}

// 使用示例
downloadCoverageReport({
  provider: 'gitlab',
  repoID: 'my-project',
  sha: 'abc123def456',
  format: 'html'
});
```

### React 组件示例

```jsx
function ExportButton({ provider, repoID, sha }) {
  const handleExport = (format) => {
    const params = {
      provider,
      repoID,
      sha,
      format
    };
    
    const queryParams = new URLSearchParams(params).toString();
    const downloadUrl = `/api/coverage/export?${queryParams}`;
    
    // 直接跳转下载
    window.location.href = downloadUrl;
  };

  return (
    <div>
      <button onClick={() => handleExport('html')}>
        下载 HTML 报告
      </button>
      <button onClick={() => handleExport('lcov')}>
        下载 LCOV 报告
      </button>
      <button onClick={() => handleExport('json')}>
        下载 JSON 报告
      </button>
    </div>
  );
}
```

## 错误处理

API 会返回以下错误状态：

- `400 Bad Request`: 参数错误或覆盖率数据不存在
- `401 Unauthorized`: GitLab 令牌无效
- `404 Not Found`: 仓库或 commit 不存在
- `500 Internal Server Error`: 服务器内部错误

## 注意事项

1. **GitLab 令牌权限**: 需要 `read_repository` 权限
2. **文件大小限制**: 大型项目可能需要较长时间处理
3. **临时文件**: 系统会自动清理生成的临时文件
4. **并发限制**: GitLab API 调用有并发限制，大量文件会分批处理
5. **源码获取**: 如果没有提供 GitLab 配置，会尝试使用覆盖率数据中的源码

## 配置环境变量

需要在环境变量中配置 GitLab 信息：

```bash
INFRA.GITLAB_BASE_URL=https://git.dev.sh.ctripcorp.com
INFRA.GITLAB_PRIVATE_TOKEN=your-gitlab-token
```

这些配置会通过 ConfigService 自动获取，无需在 API 请求中传递。