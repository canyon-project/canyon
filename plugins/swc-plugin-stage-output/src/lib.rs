//! 仅做一件事：拿到 AST 后 to_code 还原成源码，写入 .swc-plugin-stage-output，
//! 保持原目录结构、后缀 .txt、文件名加随机数防覆盖。

use std::fs;
use std::fs::write;
use std::path::Path;
use rand::Rng;
use swc_core::ecma::ast::Program;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;
use swc_ecma_codegen::to_code;

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    let filename = metadata
        .get_context(&TransformPluginMetadataContextKind::Filename)
        .unwrap_or_else(|| "-".to_string());
    let cwd = metadata
        .get_context(&TransformPluginMetadataContextKind::Cwd)
        .unwrap_or_else(|| ".".to_string());

    if filename.contains("node_modules") {
        return program;
    }

    let source_code = to_code(&program);
    let relative_path = filename
        .strip_prefix(&format!("{}/", cwd.trim_end_matches('/')))
        .or_else(|| filename.strip_prefix(cwd.as_str()))
        .unwrap_or(&filename);
    let path = Path::new(relative_path);
    let parent = path.parent().unwrap_or(Path::new("."));
    let stem = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("file");
    let random_number: u64 = rand::thread_rng().gen();
    let out_path = Path::new("/cwd")
        .join(".swc-plugin-stage-output")
        .join(parent)
        .join(format!("{}-{}.txt", stem, random_number));
    if let Some(parent_dir) = out_path.parent() {
        let _ = fs::create_dir_all(parent_dir);
    }
    let _ = write(&out_path, source_code);

    program
}
