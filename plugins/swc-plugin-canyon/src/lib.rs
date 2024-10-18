#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::Program;
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    // 获取文件路径并打印
    if let Some(file_name) = metadata.get_context().filename.as_deref() {
        println!("当前文件的路径: {}", file_name);
    } else {
        println!("无法获取文件路径");
    }
    program
}
