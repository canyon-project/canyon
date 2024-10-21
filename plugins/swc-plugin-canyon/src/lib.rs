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
    injected: bool,
}

impl TransformVisitor {
    pub fn new() -> Self {
        Self { injected: false }
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_module(&mut self, module: &mut Module) {
        module.visit_mut_children_with(self);
        if !self.injected {
            let window_canyon = Expr::Member(MemberExpr {
                obj: Box::new(Expr::Ident(Ident::new("(new Function('return this')())".into(), Default::default(), Default::default()))),
                prop: MemberProp::Ident(IdentName::from(Ident::new("__canyon__".into(), Default::default(), Default::default()))),
                span: Default::default(),
            });
            let dsn = std::env::var("DSN").unwrap_or("-".to_string());
            let reporter = std::env::var("REPORTER").unwrap_or("-".to_string());
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

            let assign_expr = AssignExpr {
                left: AssignTarget::try_from(Box::new(window_canyon)).unwrap(), // 直接使用 Box<Expr>
                op: AssignOp::Assign,
                right: Box::new(object_lit),
                span: Default::default(),
            };

            let assign_stmt = Stmt::Expr(ExprStmt {
                expr: Box::new(Expr::Assign(assign_expr)),
                span: Default::default(),
            });

            module.body.push(ModuleItem::Stmt(assign_stmt));
            self.injected = true;
        }
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, _metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(TransformVisitor::new()))
}

test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    boo,
    // 输入代码
    r#"console.log("transform");"#,
    // 经插件转换后的输出代码
    r#"console.log("transform"); window.__canyon__ = {dsn: "-",reporter:"-"};"#
);
