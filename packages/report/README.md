# Canyon Report

A modern, high-performance code coverage report viewer built with React and TypeScript. Canyon Report provides beautiful, interactive visualizations for code coverage data with support for multiple languages and themes.

## Features

- 🎨 **Beautiful UI**: Modern, responsive design with Ant Design components
- 🌓 **Theme Support**: Light and dark themes with seamless switching
- 🌍 **Multi-language**: Support for English, Chinese, and Japanese
- 📊 **Interactive Visualizations**: Dynamic coverage charts and file browsers
- 🔍 **File Viewer**: Syntax highlighting with coverage overlays
- ⚡ **High Performance**: Lazy loading and caching for large codebases
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔧 **Customizable**: Extensive configuration options

## Installation

### Via npm

```bash
npm install canyon-report
```

### Via yarn

```bash
yarn add canyon-report
```

### Via pnpm

```bash
pnpm add canyon-report
```

## Quick Start

### Basic Usage

```tsx
import CanyonReport from 'canyon-report';

function App() {
  const coverageData = [
    {
      path: '/src/components/Button.tsx',
      coverage: { statements: 85, branches: 70, functions: 90, lines: 88 }
    },
    // ... more files
  ];

  return (
    <CanyonReport
      name="My Project Coverage"
      dataSource={coverageData}
      theme="light"
      language="en"
    />
  );
}
```

### Advanced Configuration

```tsx
import CanyonReport from 'canyon-report';

function AdvancedReport() {
  return (
    <CanyonReport
      name="Advanced Coverage Report"
      dataSource={coverageData}
      theme="dark"
      language="cn"
      defaultOnlyShowChanged={true}
      onSelect={async (filePath) => {
        // Custom file selection handler
        const data = await loadFileData(filePath);
        return {
          fileContent: data.content,
          fileCoverage: data.coverage,
          fileCodeChange: data.changes
        };
      }}
    />
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `"untitled"` | Report title |
| `dataSource` | `Record<string, any>` | `{}` | Coverage data object |
| `theme` | `"light" \| "dark"` | `"light"` | UI theme |
| `language` | `"en" \| "cn" \| "ja"` | `"en"` | UI language |
| `defaultOnlyShowChanged` | `boolean` | `false` | Show only changed files |
| `value` | `string` | `""` | Currently selected file |
| `onSelect` | `function` | - | File selection handler |

### Data Format

The `dataSource` prop expects an object where keys are file paths and values contain coverage information:

```typescript
interface CoverageData {
  [filePath: string]: {
    path: string;
    statements: number;
    branches: number;
    functions: number;
    lines: number;
    statementMap: Record<string, any>;
    branchMap: Record<string, any>;
    fnMap: Record<string, any>;
    // ... other coverage data
  };
}
```

## Dynamic Data Loading

For large projects, you can implement dynamic file loading:

```tsx
import CanyonReport from 'canyon-report';

function DynamicReport() {
  const handleFileSelect = async (filePath: string) => {
    // Load file data dynamically
    const response = await fetch(`/api/coverage/${filePath}`);
    const data = await response.json();
    
    return {
      fileContent: data.content,
      fileCoverage: data.coverage,
      fileCodeChange: data.changes || []
    };
  };

  return (
    <CanyonReport
      name="Dynamic Coverage Report"
      dataSource={initialData}
      onSelect={handleFileSelect}
    />
  );
}
```

## Integration Examples

### With Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'CanyonReport',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
```

### With Webpack

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
```

## Styling and Theming

### Custom Theme

```tsx
import { ConfigProvider } from 'antd';
import CanyonReport from 'canyon-report';

function CustomThemedReport() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 4,
        },
      }}
    >
      <CanyonReport
        name="Custom Themed Report"
        dataSource={coverageData}
      />
    </ConfigProvider>
  );
}
```

### CSS Customization

```css
/* Custom styles */
.canyon-report {
  --canyon-primary: #0071c2;
  --canyon-success: #52c41a;
  --canyon-error: #ff4d4f;
}

.canyon-report .file-browser {
  font-family: 'Monaco', 'Consolas', monospace;
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/canyon-project/canyon.git
cd canyon/packages/report

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build Commands

```bash
# Development build
pnpm build

# Production build with analysis
pnpm build:analyze

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format
```

### Publishing

The package supports multiple React versions:

```bash
# Publish for React 19 (default)
pnpm publish

# Publish for React 18
pnpm publish-18
```

## TypeScript Support

Full TypeScript support is included:

```typescript
import CanyonReport, { ReportProps } from 'canyon-report';

interface MyReportProps extends ReportProps {
  customProp?: string;
}

const MyReport: React.FC<MyReportProps> = (props) => {
  return <CanyonReport {...props} />;
};
```

## Performance Optimization

### Lazy Loading

Components are automatically lazy-loaded for optimal performance:

```tsx
import { lazy, Suspense } from 'react';

const CanyonReport = lazy(() => import('canyon-report'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CanyonReport dataSource={coverageData} />
    </Suspense>
  );
}
```

### Caching

File data is automatically cached to prevent redundant loads:

```typescript
// Cache configuration
const cache = new Map();

// Custom cache implementation
const handleFileSelect = async (filePath: string) => {
  if (cache.has(filePath)) {
    return cache.get(filePath);
  }
  
  const data = await loadFileData(filePath);
  cache.set(filePath, data);
  return data;
};
```

## Troubleshooting

### Common Issues

**Q: Report not displaying data**
A: Ensure your data source matches the expected format and file paths are correct.

**Q: Styles not loading**
A: Check that Ant Design CSS is properly imported in your project.

**Q: Performance issues with large datasets**
A: Implement pagination or use dynamic loading with the `onSelect` prop.

### Debug Mode

Enable debug logging:

```typescript
// Enable debug mode
window.CANYON_DEBUG = true;

// Check loaded data
console.log('Report data:', window.data);
console.log('Report name:', window.reportName);
```

## Examples

### Basic HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Coverage Report</title>
  <link rel="stylesheet" href="https://unpkg.com/antd/dist/antd.css">
</head>
<body>
  <div id="root"></div>
  
  <script>
    // Global data
    window.data = [/* your coverage data */];
    window.reportName = "My Coverage Report";
    window.date = new Date().toISOString();
  </script>
  
  <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/canyon-report/dist/canyon-report.umd.cjs"></script>
  
  <script>
    ReactDOM.render(
      React.createElement(CanyonReport),
      document.getElementById('root')
    );
  </script>
</body>
</html>
```

### Next.js Integration

```tsx
// pages/coverage.tsx
import dynamic from 'next/dynamic';

const CanyonReport = dynamic(
  () => import('canyon-report'),
  { ssr: false }
);

export default function CoveragePage() {
  return (
    <div>
      <h1>Code Coverage Report</h1>
      <CanyonReport dataSource={coverageData} />
    </div>
  );
}
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](../../CONTRIBUTING.md) for details.

### Development Scripts

```bash
# Start development
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Check types
pnpm typecheck
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Changelog

### 3.0.0-beta.2
- React 19 support
- Improved performance with lazy loading
- Enhanced TypeScript support
- Better mobile responsiveness

### 3.0.0-beta.1
- Initial beta release
- Multi-language support
- Theme system
- Dynamic data loading

---

For more information, visit the [Canyon Documentation](https://canyon.dev/docs).