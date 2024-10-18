#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::Program;
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    // 需要提供 `TransformPluginMetadataContextKind` 参数给 `get_context` 方法
    if let Some(context) = metadata.get_context(&swc_core::plugin::metadata::TransformPluginMetadataContextKind::Filename) {
        // 处理返回的 `Option<String>`
        println!("当前文件的路径: {}", context);
    } else {
        println!("无法获取文件路径");
    }
    program
}
