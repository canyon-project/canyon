use swc_core::ecma::ast::{IdentName, PropOrSpread};
use swc_core::ecma::{
    ast::{
        Expr, KeyValueProp, ObjectLit, Program,
        Prop,
        PropName
    },
    transforms::testing::test_inline,
    visit::{as_folder, FoldWith, VisitMut},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};


use serde::{Deserialize, Serialize};
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;

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
    config: Config,
}
impl TransformVisitor {
    pub fn new() -> Self {
        Self { config: Config::default() }
    }
    // 处理对象字面量属性的函数
    fn process_coverage_data_object(&mut self, obj: &mut ObjectLit) {
        let excluded_keys = ["statementMap", "fnMap", "branchMap", "inputSourceMap"];

        // 过滤掉指定的属性
        obj.props.retain(|prop| {
            match prop {
                PropOrSpread::Prop(prop) => {
                    if let Prop::KeyValue(KeyValueProp {
                                              key: PropName::Ident(IdentName { sym, .. }),
                                              ..
                                          }) = &**prop {
                        // 排除指定的属性名
                        !excluded_keys.contains(&sym.as_ref())
                    } else {
                        true
                    }
                }
                _ => true,
            }
        });
    }
}

impl VisitMut for TransformVisitor {
    // 遍历每个表达式时，修改表达式
    fn visit_mut_expr(&mut self, expr: &mut Expr) {
        match expr {
            // 当表达式是对象字面量时
            Expr::Object(ref mut obj) => {
                // 调用 visit_mut_object_lit 来处理对象字面量的属性
                self.visit_mut_object_lit(obj);
            }
            _ => {}
        }
    }

    fn visit_mut_object_lit(&mut self, obj: &mut ObjectLit) {
        // 定义一个字符串数组，包含需要排除的属性名
        let excluded_keys = ["statementMap", "fnMap", "branchMap","inputSourceMap"];
        let required_keys = ["statementMap", "fnMap", "branchMap"];

        // 定义需要同时包含的属性
        let required_keys = ["statementMap", "fnMap", "branchMap"];

        let dsn = self.config.dsn.clone().unwrap_or("-".to_string());
        let reporter = self.config.reporter.clone().unwrap_or("-".to_string());
        let instrumentCwd = self.config.instrumentCwd.clone().unwrap_or("-".to_string());
        let branch = self.config.branch.clone().unwrap_or("-".to_string());
        let sha = self.config.sha.clone().unwrap_or("-".to_string());
        let projectID = self.config.projectID.clone().unwrap_or("-".to_string());
        let compareTarget = self.config.compareTarget.clone().unwrap_or("-".to_string());

        // 打印出这些

        println!("dsn: {}", dsn);
        println!("reporter: {}", reporter);
        println!("instrumentCwd: {}", instrumentCwd);
        println!("branch: {}", branch);
        println!("sha: {}", sha);
        println!("projectID: {}", projectID);

        // 检查对象字面量是否同时包含这些属性
        let contains_required_keys = required_keys.iter().all(|&key| {
            obj.props.iter().any(|prop| {
                if let PropOrSpread::Prop(ref prop) = prop {
                    if let Prop::KeyValue(KeyValueProp {
                                              key: PropName::Ident(IdentName { sym, .. }),
                                              ..
                                          }) = &**prop {
                        return sym.as_ref() == key;
                    }
                }
                false
            })
        });

        // 只有在同时包含所有指定属性时才进行处理
        if contains_required_keys {
            self.process_coverage_data_object(obj);
        }
    }
}

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
    println!("env: {}", env);
    println!("filename: {}", filename);
    println!("cwd: {}", cwd);
    program.fold_with(&mut as_folder(TransformVisitor { config }))
}

test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor::new()),
    boo,
    // 输入代码
    r#"const coverageData={fnMap:"nihao",statementMap:"",branchMap:"sss"};"#,
    // 经插件转换后的输出代码
    r#"const coverageData={};"#
);
