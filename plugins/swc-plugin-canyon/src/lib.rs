use std::fs::File;
use std::sync::Arc;
use swc_core::ecma::ast::{ArrayLit, IdentName, Lit, PropOrSpread, Str};
use swc_core::ecma::{
    ast::{
        Expr, KeyValueProp, ObjectLit, Program,
        Prop,
        PropName
    },
    transforms::testing::test_inline,
    visit::{visit_mut_pass, FoldWith, VisitMut},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};


use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use swc_core::atoms::Atom;
use swc_core::common::SourceMap;
use swc_core::ecma::visit::swc_ecma_ast;
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;

use swc_ecma_codegen::{Emitter, Config as EmitConfig, text_writer::JsWriter};
// use swc_core::ecma::ast::ObjectLit;

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


// 辅助函数：将 Expr 转换为 JavaScript 代码字符串
// fn expr_to_code(expr: &Expr) -> String {
//     let cm = SourceMap::default();
//     let mut buf = Vec::new();
//     let config = EmitConfig {
//         ..Default::default()
//     };
//     let mut emitter = Emitter {
//         cfg: config,
//         // cm: &cm,
//         wr: Box::new(JsWriter::new(Arc::from(cm), "\n", &mut buf, None)),
//         comments: None,
//         cm: Arc::new(()),
//     };
//     emitter.comments(expr);
//     String::from_utf8_lossy(&buf).to_string()
// }



// 将表达式转换为 JSON
fn expr_to_json(expr: &Expr) -> Value {
    match expr {
        Expr::Lit(lit) => lit_to_json(lit),  // 处理字面量
        Expr::Object(obj) => object_lit_to_json(obj),  // 处理对象字面量
        // Expr::Array(arr) => array_lit_to_json(arr),  // 处理数组字面量（如果需要）
        _ => json!(null)  // 其他类型的值默认为 null
    }
}

// 将 Lit 转换为 JSON
fn lit_to_json(lit: &Lit) -> Value {
    match lit {
        Lit::Str(str_) => json!(str_.value),
        Lit::Num(num_) => json!(num_.value),
        Lit::Bool(bool_) => json!(bool_.value),
        // Lit::Null => json!(null),
        _ => json!(null)  // 其他字面量转换为 null
    }
}

// 将对象字面量转换为 JSON 对象
fn object_lit_to_json(obj: &ObjectLit) -> Value {
    let mut map = serde_json::Map::new();

    // 遍历对象字面量中的每个属性
    for prop in &obj.props {
        if let PropOrSpread::Prop(ref prop) = prop {



            println!("xxxxxxxxxxxx:{:?}", prop);
            if let Prop::KeyValue(KeyValueProp { key, value }) = &**prop {
                match key {
                    PropName::Ident(IdentName { sym, .. }) => {
                        // 处理标识符类型的键
                        println!("键为标识符: {:?}, 值: {:?}", sym, value);
                    }
                    PropName::Str(Str { value: key_str, .. }) => {
                        // 处理字符串字面量类型的键
                        println!("键为字符串字面量: {:?}, 值: {:?}", key_str, value);

                        map.insert(key_str.to_string(), expr_to_json(value));  // 递归处理 value
                    }
                    _ => {
                        // 处理其他类型的键
                        println!("键为其他类型");
                    }
                }
            }


            // if let Prop::KeyValue(KeyValueProp { key: PropName::Ident(IdentName { sym, .. }), value }) = &**prop {
            //     // 将 value 转换为 JSON
            //     map.insert(sym.to_string(), expr_to_json(value));  // 递归处理 value
            // }
        }
    }

    Value::Object(map)
}

// 将数组字面量转换为 JSON 数组（如果需要）
// fn array_lit_to_json(arr: &ArrayLit) -> Value {
//     let mut arr_json = Vec::new();
//
//     for expr in arr {
//         arr_json.push(expr_to_json(expr));  // 递归处理数组中的元素
//     }
//
//     Value::Array(arr_json)
// }


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


        // 生成处理后的对象代码
        // let expr = Expr::Object(obj.clone());
        // let code = expr_to_code(&expr);
        // println!("Processed object: {}", code);

        // 定一个map
        let mut map = std::collections::HashMap::new();

        // 遍历对象的属性
        for prop in &obj.props {
            if let PropOrSpread::Prop(ref prop) = prop {
                if let Prop::KeyValue(KeyValueProp { key: PropName::Ident(IdentName { sym, .. }), value }) = &**prop {



                    // 解引用 value，处理其中的表达式
                    let value1 = match &**value {
                        Expr::Lit(lit) => {
                            // 将 lit 转换为 JSON
                            lit_to_json(lit)
                        }
                        Expr::Object(ref obj) => {
                            println!("xxxxxx:{:?}",obj);
                            // 如果是对象字面量，递归转换为 JSON
                            object_lit_to_json(obj)
                        }
                        _ => {
                            json!(null)  // 如果不是字面量或对象字面量，返回 null
                        }
                    };


                    map.insert(sym.clone(), value1);

                //     保存成json文件
                //     let mut file = File::create("coverageData.json").unwrap();
                //     serde_json::to_writer(&file, &value1).unwrap();

                }
            }
        }

        // 保存成json文件

        let mut file = File::create("coverageData.json").unwrap();
        serde_json::to_writer(&file, &map).unwrap();

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


    // 使用TransformPluginProgramMetadata获取环境变量
    let env = metadata.get_context(&TransformPluginMetadataContextKind::Env).unwrap_or("-".to_string());
    let filename = metadata.get_context(&TransformPluginMetadataContextKind::Filename).unwrap_or("-".to_string());
    let cwd = metadata.get_context(&TransformPluginMetadataContextKind::Cwd).unwrap_or("-".to_string());

    // Check if the file is of a specific type (e.g., .js or .ts)
    if filename.contains("node_modules") {
        return program; // Skip transformation for non-JS/TS files
    }

    // program.fold_with(&mut visit_mut_pass(TransformVisitor { config }))

    program.apply(&mut visit_mut_pass(TransformVisitor { config }))
}

test_inline!(
    Default::default(),
    |_| visit_mut_pass(TransformVisitor::new()),
    boo,
    // 输入代码
    r#"const coverageData={fnMap:"nihao",statementMap:{"name":123},branchMap:"sss"};"#,
    // 经插件转换后的输出代码
    r#"const coverageData={};"#
);
