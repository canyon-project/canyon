// src/types/global.d.ts

// 扩展 Window 接口以包含 monaco 属性
interface Window {
    monaco: typeof import('monaco-editor');
}