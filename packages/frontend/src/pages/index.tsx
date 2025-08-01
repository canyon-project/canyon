import React from 'react';
import { Link } from 'react-router-dom';

const IndexPage: React.FC = () => {
  const demos = [
    {
      id: 'echarts',
      title: 'ECharts 图表示例',
      description: '展示各种类型的图表，包括柱状图、饼图和折线图',
      icon: '📊',
      path: '/echarts-demo',
      color: 'from-blue-500 to-blue-600',
      features: ['柱状图', '饼图', '折线图', '响应式设计']
    },
    {
      id: 'tailwind',
      title: 'Tailwind CSS 示例',
      description: '展示 Tailwind CSS 的各种功能和组件样式',
      icon: '🎨',
      path: '/tailwind-demo',
      color: 'from-green-500 to-green-600',
      features: ['响应式布局', '动画效果', '组件样式', '交互设计']
    },
    {
      id: 'monaco',
      title: 'Monaco Editor 示例',
      description: '功能完整的代码编辑器，支持多种编程语言',
      icon: '💻',
      path: '/monaco-editor-demo',
      color: 'from-purple-500 to-purple-600',
      features: ['语法高亮', '代码补全', '多主题', '格式化']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🚀 前端组件示例集合
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              探索现代前端开发中常用的组件和库，包括数据可视化、样式框架和代码编辑器
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              to={demo.path}
              className="group block transform hover:scale-105 transition-all duration-300"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
                {/* Card Header */}
                <div className={`bg-gradient-to-r ${demo.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{demo.icon}</div>
                    <div className="text-right">
                      <div className="text-sm opacity-75">点击查看</div>
                      <div className="text-2xl">→</div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {demo.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {demo.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">主要功能:</h4>
                    <div className="flex flex-wrap gap-2">
                      {demo.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            技术栈概览
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">⚛️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">React 19</h3>
              <p className="text-gray-600">现代化的用户界面库</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">TypeScript</h3>
              <p className="text-gray-600">类型安全的开发体验</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Vite</h3>
              <p className="text-gray-600">快速的构建工具</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              开始探索
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              点击上方的任意卡片开始探索相应的示例。每个示例都包含了完整的功能演示和代码实现。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                响应式设计
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                交互功能
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                现代化样式
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>© 2024 前端组件示例集合. 使用 React + TypeScript + Vite 构建.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IndexPage;