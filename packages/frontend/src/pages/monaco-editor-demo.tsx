import React, { useState, useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

const MonacoEditorDemo: React.FC = () => {
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [theme, setTheme] = useState<string>('vs-dark');
  const [language, setLanguage] = useState<string>('typescript');
  const [output, setOutput] = useState<string>('');
  const editorRef = useRef<HTMLDivElement>(null);

  // 示例代码
  const sampleCodes = {
    typescript: `// TypeScript 示例
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

class UserManager {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(\`用户 \${user.name} 已添加\`);
  }

  findUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive);
  }
}

// 使用示例
const userManager = new UserManager();
userManager.addUser({
  id: 1,
  name: "张三",
  email: "zhangsan@example.com",
  isActive: true
});

const activeUsers = userManager.getActiveUsers();
console.log("活跃用户:", activeUsers);`,

    javascript: `// JavaScript 示例
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用 Promise 的异步函数
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    throw error;
  }
}

// 数组操作示例
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log('原数组:', numbers);
console.log('翻倍后:', doubled);
console.log('总和:', sum);
console.log('斐波那契数列第10项:', fibonacci(10));`,

    python: `# Python 示例
import json
from typing import List, Dict, Optional

class DataProcessor:
    def __init__(self):
        self.data: List[Dict] = []
    
    def load_data(self, file_path: str) -> None:
        """从文件加载数据"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                self.data = json.load(file)
            print(f"成功加载 {len(self.data)} 条数据")
        except FileNotFoundError:
            print(f"文件 {file_path} 不存在")
        except json.JSONDecodeError:
            print("JSON 格式错误")
    
    def filter_data(self, key: str, value: any) -> List[Dict]:
        """根据条件过滤数据"""
        return [item for item in self.data if item.get(key) == value]
    
    def get_statistics(self) -> Dict[str, int]:
        """获取数据统计信息"""
        return {
            'total_count': len(self.data),
            'unique_keys': len(set().union(*(d.keys() for d in self.data)))
        }

# 使用示例
processor = DataProcessor()
# processor.load_data('data.json')

# 列表推导式示例
squares = [x**2 for x in range(10)]
even_squares = [x for x in squares if x % 2 == 0]

print("平方数:", squares)
print("偶数平方:", even_squares)`,

    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML 示例页面</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { color: #2c3e50; text-align: center; }
        .highlight { background-color: #f39c12; padding: 2px 5px; border-radius: 3px; }
        .card {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            background: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>欢迎来到我的网站</h1>
        
        <nav>
            <ul>
                <li><a href="#home">首页</a></li>
                <li><a href="#about">关于</a></li>
                <li><a href="#contact">联系</a></li>
            </ul>
        </nav>
        
        <main>
            <section id="home">
                <h2>主页内容</h2>
                <p>这是一个 <span class="highlight">HTML 示例</span> 页面，展示了基本的 HTML 结构和样式。</p>
                
                <div class="card">
                    <h3>特色功能</h3>
                    <ul>
                        <li>响应式设计</li>
                        <li>现代化样式</li>
                        <li>语义化标签</li>
                    </ul>
                </div>
            </section>
            
            <section id="about">
                <h2>关于我们</h2>
                <p>我们致力于创建优秀的网页体验。</p>
            </section>
        </main>
        
        <footer>
            <p>&copy; 2024 示例网站. 保留所有权利.</p>
        </footer>
    </div>
    
    <script>
        console.log('页面加载完成!');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM 内容加载完成');
        });
    </script>
</body>
</html>`
  };

  useEffect(() => {
    if (editorRef.current) {
      // 创建编辑器实例
      const editorInstance = monaco.editor.create(editorRef.current, {
        value: sampleCodes[language as keyof typeof sampleCodes],
        language: language,
        theme: theme,
        fontSize: 14,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        selectOnLineNumbers: true,
        matchBrackets: 'always',
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true,
      });

      setEditor(editorInstance);

      // 监听内容变化
      editorInstance.onDidChangeModelContent(() => {
        const value = editorInstance.getValue();
        setOutput(`代码长度: ${value.length} 字符\n行数: ${value.split('\n').length}`);
      });

      return () => {
        editorInstance.dispose();
      };
    }
  }, []);

  // 切换主题
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    monaco.editor.setTheme(newTheme);
  };

  // 切换语言
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
        editor.setValue(sampleCodes[newLanguage as keyof typeof sampleCodes]);
      }
    }
  };

  // 格式化代码
  const formatCode = () => {
    if (editor) {
      editor.getAction('editor.action.formatDocument')?.run();
    }
  };

  // 获取代码内容
  const getCode = () => {
    if (editor) {
      const code = editor.getValue();
      setOutput(`当前代码:\n${code}`);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* 工具栏 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Monaco Editor 示例</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* 主题选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">主题:</label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="vs">Light</option>
                <option value="vs-dark">Dark</option>
                <option value="hc-black">High Contrast</option>
              </select>
            </div>

            {/* 语言选择 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">语言:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
              </select>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button
                onClick={formatCode}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                格式化
              </button>
              <button
                onClick={getCode}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                获取代码
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 flex">
        {/* 编辑器 */}
        <div className="flex-1 border-r border-gray-300">
          <div ref={editorRef} className="h-full" />
        </div>

        {/* 输出面板 */}
        <div className="w-80 bg-gray-50 p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">输出信息</h3>
          <div className="bg-white border border-gray-300 rounded-md p-3 h-32 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{output}</pre>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2">编辑器功能</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 语法高亮</li>
              <li>• 代码补全</li>
              <li>• 错误检测</li>
              <li>• 代码折叠</li>
              <li>• 多光标编辑</li>
              <li>• 查找替换</li>
              <li>• 代码格式化</li>
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 mb-2">快捷键</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ctrl+S: 保存</li>
              <li>• Ctrl+F: 查找</li>
              <li>• Ctrl+H: 替换</li>
              <li>• Ctrl+/: 注释</li>
              <li>• Alt+Shift+F: 格式化</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditorDemo;