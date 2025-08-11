import express from 'express';
import history from 'connect-history-api-fallback';

const app = express();

// 健康检查与接口代理应在 history 回退之前，避免被回退中间件拦截
app.get('/vi/health', (req, res) => {
    res.send('ok');
});

// SPA 历史路由回退，必须在 static 之前；关闭 dot 规则使带点路径也能回退到入口
app.use(
    history({
        // 导航请求（Accept 含 text/html）才回退，避免 .js/.css 等静态资源被改写
        htmlAcceptHeaders: ['text/html'],
        // 允许带点路径（如 .tsx）进行回退
        disableDotRule: true,
    }),
); // 这里千万要注意，要在static静态资源上面

// 托管静态文件
app.use(express.static('static'));


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
