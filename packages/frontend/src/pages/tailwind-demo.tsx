import React, { useState } from 'react';

const TailwindDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const cards = [
    {
      id: 1,
      title: '响应式设计',
      description: '使用 Tailwind 的响应式工具类创建适配各种设备的界面',
      color: 'bg-blue-500',
      icon: '📱'
    },
    {
      id: 2,
      title: '动画效果',
      description: '利用 Tailwind 的动画类创建流畅的用户体验',
      color: 'bg-green-500',
      icon: '✨'
    },
    {
      id: 3,
      title: '组件样式',
      description: '快速构建美观的组件和布局',
      color: 'bg-purple-500',
      icon: '🎨'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Tailwind CSS 示例
            </h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                首页
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                关于
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                联系
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            欢迎使用 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tailwind CSS
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            快速构建现代化的用户界面，使用实用优先的 CSS 框架
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            开始探索
          </button>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            特色功能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card.id)}
                className={`${card.color} rounded-xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl ${
                  selectedCard === card.id ? 'ring-4 ring-white ring-opacity-50' : ''
                }`}
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h4 className="text-xl font-bold mb-3">{card.title}</h4>
                <p className="text-white text-opacity-90">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
            联系表单
          </h3>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入您的姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="请输入您的邮箱"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                消息
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="请输入您的消息"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              发送消息
            </button>
          </form>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full transform animate-pulse">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 欢迎探索！
            </h4>
            <p className="text-gray-600 mb-6">
              这是一个使用 Tailwind CSS 创建的模态框示例，展示了各种实用的样式类。
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Tailwind CSS 示例. 使用 Tailwind CSS 构建.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TailwindDemo;