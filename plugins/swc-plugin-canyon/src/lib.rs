#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::{Program, Script, Expr, ExprStmt, Stmt, Lit, Str, BinExpr};
use swc_ecma_visit::{as_folder, Fold, FoldWith, VisitMut};
use swc_plugin_macro::plugin_transform;
use swc_core::{
    ecma::{
        transforms::testing::test,
    }
};

#[plugin_transform]
fn plugin(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    // 确认插件被调用
    println!("SWC 插件被调用");

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
        // 调试信息
        println!("准备插入代码到脚本末尾");

        // 插入的字符串代码
        let new_code = Expr::Lit(Lit::Str(Str {
            value: "window.__canyon__={tizhong:\"123\"};".into(),
            span: Default::default(),
            raw: None,
        }));

        println!("gogogo 插入代码");

        // 构建表达式语句并插入
        let new_item = Stmt::Expr(ExprStmt {
            expr: Box::new(new_code),
            span: Default::default(),
        });

        // 在脚本的末尾追加语句
        script.body.push(new_item);

        script
    }
}


pub struct TransformVisitor;

impl VisitMut for TransformVisitor {
    fn visit_mut_bin_expr(&mut self, e: &mut BinExpr) {
        e.visit_mut_children_with(self);

        if e.op == op!("===") {
            e.left = Box::new(Ident::new("kdy1".into(), e.left.span()).into());
        }
    }
}

test!(
    Default::default(),
    |_| as_folder(TransformVisitor),
    boo,
    r#"foo === bar;"#
);