const About = () => {
  return (
    <div className="page">
      <h1>关于我们</h1>
      <p>这是一个懒加载的关于页面组件</p>
      <div className="content">
        <h2>项目特点</h2>
        <ul>
          <li>React 19 + TypeScript</li>
          <li>Vite 构建工具</li>
          <li>React Router 懒加载</li>
          <li>现代化开发体验</li>
        </ul>
      </div>
    </div>
  )
}

export default About