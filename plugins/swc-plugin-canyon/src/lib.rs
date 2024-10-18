#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::Program;
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    if let Some(file_name) = metadata.get_file_name() {
        println!("Processing file: {}", file_name);
    }
    program
}
