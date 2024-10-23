use swc_core::ecma::{
    ast::{
        Program, Module, Expr, Stmt, ModuleItem, Ident, Lit, KeyValueProp, Prop, PropName,
        ObjectLit, ExprStmt, AssignExpr, AssignOp, MemberExpr, MemberProp,
    },
    transforms::testing::test_inline,
    visit::{as_folder, FoldWith, VisitMut},
};
use swc_core::ecma::ast::{AssignTarget};
use swc_core::ecma::visit::VisitMutWith;
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;

// Add this to the top of your file or a relevant module
use serde::{Deserialize, Serialize};



// https://github.com/swc-project/plugins/blob/main/packages/react-remove-properties/transform/src/lib.rs
// 暂时方案，先一股脑把环境变量都注入，例如CI_COMMIT_BRANCH、CI_COMMIT_SHA、CI_PROJECT_ID等，
// 可配置的是compareTarget



#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub dsn: Option<String>,
    pub reporter: Option<String>,
    pub instrumentCwd: Option<String>,
    pub branch: Option<String>,
    pub sha: Option<String>,
    pub projectID: Option<String>,
    pub compareTarget: Option<String>,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            dsn: None,
            reporter: None,
            instrumentCwd: None,
            branch: None,
            sha: None,
            projectID: None,
            compareTarget: None,
        }
    }
}

pub struct TransformVisitor {
    injected: bool,
    config: Config,
}

impl TransformVisitor {
    pub fn new() -> Self {
        Self { injected: false,
            config: Config::default() }
    }
}

impl VisitMut for TransformVisitor {
    fn visit_mut_module(&mut self, module: &mut Module) {
        module.visit_mut_children_with(self);
        if !self.injected {
            let window_canyon = Expr::Member(MemberExpr {
                obj: Box::new(Expr::Ident(Ident::new("(new Function('return this')())".into(), Default::default()))),
                prop: MemberProp::Ident(Ident::from(Ident::new("__canyon__".into(), Default::default()))),
                span: Default::default(),
            });
            // let dsn = std::env::var("DSN").unwrap_or("-".to_string());
            // let reporter = std::env::var("REPORTER").unwrap_or("-".to_string());
            // let instrumentCwd = std::env::current_dir().unwrap().to_str().unwrap_or("-").to_string();
            // let branch = std::env::var("CI_COMMIT_BRANCH").unwrap_or("-".to_string());
            // let sha = std::env::var("CI_COMMIT_SHA").unwrap_or("-".to_string());
            // let projectID = std::env::var("CI_PROJECT_ID").unwrap_or("-".to_string());

            let dsn = self.config.dsn.clone().unwrap_or("-".to_string());
            let reporter = self.config.reporter.clone().unwrap_or("-".to_string());
            let instrumentCwd = self.config.instrumentCwd.clone().unwrap_or("-".to_string());
            let branch = self.config.branch.clone().unwrap_or("-".to_string());
            let sha = self.config.sha.clone().unwrap_or("-".to_string());
            let projectID = self.config.projectID.clone().unwrap_or("-".to_string());
            let compareTarget = self.config.compareTarget.clone().unwrap_or("-".to_string());

            // 打印出这些

            // println!("dsn: {}", dsn);
            // println!("reporter: {}", reporter);
            // println!("instrumentCwd: {}", instrumentCwd);
            // println!("branch: {}", branch);
            // println!("sha: {}", sha);
            // println!("projectID: {}", projectID);

            let object_lit = Expr::Object(ObjectLit {
                props: vec![
                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("dsn".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(dsn.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("reporter".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(reporter.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("instrumentCwd".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(instrumentCwd.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("branch".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(branch.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("sha".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(sha.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("projectID".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(projectID.into()))),
                }).into(),

                    Prop::KeyValue(KeyValueProp {
                        key: PropName::Ident(Ident::from(Ident::new("compareTarget".into(), Default::default()))),
                        value: Box::new(Expr::Lit(Lit::Str(compareTarget.into()))),
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

// https://github.com/swc-project/plugins/blob/main/packages/react-remove-properties/transform/src/lib.rs
// 暂时方案，先一股脑把环境变量都注入，例如CI_COMMIT_BRANCH、CI_COMMIT_SHA、CI_PROJECT_ID等，
// 可配置的是compareTarget



#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {

    // 定义react_remove_properties



    let config = serde_json::from_str::<Option<Config>>(
        &metadata
            .get_transform_plugin_config()
            .expect("failed to get plugin config for react-remove-properties"),
    )
        .expect("invalid config for react-remove-properties")
        .unwrap_or_default(); // Use default if config is None

    // 打印config
    // println!("config: {:?}", config);

    // 使用TransformPluginProgramMetadata获取环境变量
    let env = metadata.get_context(&TransformPluginMetadataContextKind::Env).unwrap_or("-".to_string());
    let filename = metadata.get_context(&TransformPluginMetadataContextKind::Filename).unwrap_or("-".to_string());
    let cwd = metadata.get_context(&TransformPluginMetadataContextKind::Cwd).unwrap_or("-".to_string());
    // println!("env: {}", env);
    // println!("filename: {}", filename);
    // println!("cwd: {}", cwd);
    program.fold_with(&mut as_folder(TransformVisitor { injected: false, config }))
}

test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    boo,
    // 输入代码
    r#"console.log("transform");"#,
    // 经插件转换后的输出代码
    r#"console.log("transform");
(new Function('return this')()).__canyon__ = {
    dsn: "-",
    reporter: "-",
    instrumentCwd: "/",
    branch: "-",
    sha: "-",
    projectID: "-"
};
"#
);
