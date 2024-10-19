#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::{Program, Module, ModuleItem, Script};
use swc_ecma_visit::{Fold, FoldWith};
use swc_plugin_macro::plugin_transform;
use swc_core::ecma::utils::quote_str;

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
    fn fold_module(&mut self, mut module: Module) -> Module {
        let new_code = "(new Function('this')).__canyon__={tizhong:\"123\"};";
        let new_item = ModuleItem::Stmt(swc_ecma_ast::Stmt::Expr(swc_ecma_ast::ExprStmt {
            expr: Box::new(swc_ecma_ast::Expr::Lit(swc_ecma_ast::Lit::Str(quote_str(new_code)))),
            span: Default::default(),
        }));
        module.body.push(new_item);
        module
    }

    fn fold_script(&mut self, mut script: Script) -> Script {
        let new_code = "(new Function('this')).__canyon__={tizhong:\"123\"};";
        let new_item = swc_ecma_ast::Stmt::Expr(swc_ecma_ast::ExprStmt {
            expr: Box::new(swc_ecma_ast::Expr::Lit(swc_ecma_ast::Lit::Str(quote_str(new_code)))),
            span: Default::default(),
        });
        script.body.push(new_item);
        script
    }
}
