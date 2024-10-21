#![allow(clippy::not_unsafe_ptr_arg_deref)]

use swc_common::{Spanned, SyntaxContext};
use swc_core::plugin::proxies::TransformPluginProgramMetadata;
use swc_ecma_ast::{Program, Script, Expr, ExprStmt, Stmt, Lit, Str, BinExpr, op, Ident};
use swc_ecma_visit::{as_folder, Fold, FoldWith, VisitMut, VisitMutWith};
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
        // 插入的代码是 console.log('hi');
        let new_code = Expr::Call(swc_ecma_ast::CallExpr {
            callee: swc_ecma_ast::Callee::Expr(Box::new(Expr::Member(swc_ecma_ast::MemberExpr {
                obj: Box::new(Expr::Ident(Ident::new("console".into(), Default::default(), SyntaxContext::empty()))),
                // prop: Box::new(Expr::Ident(Ident::new("log".into(), Default::default(), SyntaxContext::empty()))),
                span: Default::default(),
                prop: Default::default(),
            }))),
            args: vec![swc_ecma_ast::ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(Lit::Str(Str {
                    value: "hi".into(),
                    span: Default::default(),
                    raw: None,
                }))),
            }],
            span: Default::default(),
            type_args: None,
            ctxt: Default::default(),
        });

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
