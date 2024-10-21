use swc_core::ecma::{
    ast::{
        Program, Module, Expr, Stmt, ModuleItem, Ident, Lit, KeyValueProp, Prop, PropName,
        ObjectLit, ExprStmt, AssignExpr, AssignOp, MemberExpr, MemberProp,
    },
    transforms::testing::test_inline,
    visit::{as_folder, FoldWith, VisitMut},
};
use swc_core::ecma::ast::{AssignTarget, IdentName};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};

pub struct TransformVisitor {
    injected: bool, // 用于确保只注入一次
}

impl TransformVisitor {
    pub fn new() -> Self {
        Self { injected: false }
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_module(&mut self, module: &mut Module) {
        // 先调用父类的 visit_mut_module 方法
        module.visit_mut_children_with(self);

        // 在最后一行注入 window.canyon = {name: "zt"};
        if !self.injected {
            // 创建 window.canyon 的 MemberExpr
            let window_canyon = Expr::Member(MemberExpr {
                obj: Box::new(Expr::Ident(Ident::new("(new Function('return this')())".into(), Default::default(), Default::default()))),
                prop: MemberProp::Ident(IdentName::from(Ident::new("__canyon__".into(), Default::default(), Default::default()))),
                span: Default::default(),
            });

            // {
            //     "projectID": "118075",
            //     "sha": "989c7626d130068cf51c0f2b16d70c0424db275e",
            //     "branch": "main",

            //     "dsn": "https:/.fat3.qa.nt.com/coverage/client",
            //     "instrumentCwd": "/builds/canyon-project/canyon",
            //     "reporter": ".8P2NIRv_skZvboci8TbRgiPesjlopA1cZXtG-ybhuiE",
            // }


            // 默认为"-"，如果没有设置环境变量，则会报错
            let dsn = std::env::var("DSN").unwrap_or("-".to_string());
            let reporter = std::env::var("REPORTER").unwrap_or("-".to_string());
            // instrumentCwd是当前程序运行路径
            let instrumentCwd = std::env::current_dir().unwrap().to_str().unwrap_or("-").to_string();
            let branch = std::env::var("CI_COMMIT_BRANCH").unwrap_or("-".to_string());
            let sha = std::env::var("CI_COMMIT_SHA").unwrap_or("-".to_string());
            let projectID = std::env::var("CI_PROJECT_ID").unwrap_or("-".to_string());

            let object_lit = Expr::Object(ObjectLit {
                props: vec![
                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("dsn".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(dsn.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("reporter".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(reporter.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("instrumentCwd".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(instrumentCwd.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("branch".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(branch.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("sha".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(sha.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(IdentName::from(Ident::new("projectID".into(), Default::default(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(projectID.into()))),
                }).into(),
                ],
                span: Default::default(),
            });

            // 读取当前环境变量，把环境变量的dsn赋值给window.__canyon__.dsn
            // 创建 window.canyon = {name: "zt"} 的赋值表达式
            let assign_expr = AssignExpr {
                left: AssignTarget::try_from(Box::new(window_canyon)).unwrap(), // 直接使用 Box<Expr>
                op: AssignOp::Assign,
                right: Box::new(object_lit),
                span: Default::default(),
            };

            // 创建表达式语句
            let assign_stmt = Stmt::Expr(ExprStmt {
                expr: Box::new(Expr::Assign(assign_expr)),
                span: Default::default(),
            });

            // 将新的语句添加到模块体中
            module.body.push(ModuleItem::Stmt(assign_stmt));
            self.injected = true; // 标记为已注入
        }
    }
}

/// SWC 插件的主函数
#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(TransformVisitor::new()))
}

// 测试插件变换
test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    boo,
    // 输入代码
    r#"console.log("transform");"#,
    // 经插件转换后的输出代码
    r#"console.log("transform"); window.__canyon__ = {dsn: "-",reporter:"-"};"#
);
