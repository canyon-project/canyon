#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::{Program, Module, ModuleItem, Script, Expr, ExprStmt, Stmt, Lit, Str};
use swc_ecma_visit::{Fold, FoldWith};
use swc_plugin_macro::plugin_transform;

#[plugin_transform]
fn plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    // 打印文件路径
    if let Some(context) = metadata.get_context(&swc_core::plugin::metadata::TransformPluginMetadataContextKind::Filename) {
        println!("当前文件的路径: {}", context);
    } else {
        println!("无法获取文件路径");
    }

    // 直接在每个文件末尾插入指定的代码
    program.fold_with(&mut AddSimpleCode)
}

struct AddSimpleCode;

impl Fold for AddSimpleCode {
    fn fold_script(&mut self, mut script: Script) -> Script {
        let new_code = Expr::Lit(Lit::Str(Str {
            value: "window.__canyon__={tizhong:\"123\"};".into(),
            span: Default::default(),
            raw: None,
        }));

        println!("gogogo");

        let new_item = Stmt::Expr(ExprStmt {
            expr: Box::new(new_code),
            span: Default::default(),
        });

        script.body.push(new_item);
        script
    }
}
