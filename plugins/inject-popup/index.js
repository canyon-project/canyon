// 入口函数
// 直接引入使用
//es5

// 功能
// 1. 点击页面5次弹出弹窗
// 2. 点击关闭按钮关闭弹窗
// 3. 弹窗内容是一个表单，展示项目信息，和覆盖率信息
// 4. 表单提交后，发送请求，将表单数据发送到后端

//创建style标签，插入css

// 创建一个style标签
const styleTag = document.createElement('style');
styleTag.textContent = `
     body {
       background-color: lightblue;
       color: darkblue;
     }
   `;
// 将style标签添加到head元素中
document.head.appendChild(styleTag);
