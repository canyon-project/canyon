use std::fs;
use std::fs::write;
use std::path::Path;
use rand::Rng;
use swc_core::ecma::ast::{
    ArrayLit, Callee, CallExpr, IdentName, Lit, MemberExpr, MemberProp,
    ModuleDecl, ModuleItem, ObjectLit, Program, Prop, PropName, PropOrSpread,
    Stmt, Str,
};
use swc_core::ecma::ast::{Expr, ExprStmt, KeyValueProp};
use swc_core::ecma::{
    transforms::testing::test_inline,
    visit::{visit_mut_pass, VisitMut},
};
use swc_core::plugin::{plugin_transform, proxies::TransformPluginProgramMetadata};
use swc_core::plugin::metadata::TransformPluginMetadataContextKind;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub instrumentCwd: Option<String>,
    pub sha: Option<String>,
    pub keepMap: Option<bool>,
    pub ci: Option<bool>
}

impl Default for Config {
    fn default() -> Self {
        Self {
            instrumentCwd: None,
            sha: None,
            keepMap: Some(false),
            ci: Some(false)
        }
    }
}

fn array_lit_to_json(arr: &ArrayLit) -> Value {
    let mut arr_json = Vec::new();
    for expr in &arr.elems {
        match expr {
            Some(expr) => {
                arr_json.push(expr_to_json(expr.expr.as_ref()));
            }
            None => {
                arr_json.push(json!(null));
            }
        }
    }
    Value::Array(arr_json)
}

fn expr_to_json(expr: &Expr) -> Value {
    match expr {
        Expr::Lit(lit) => lit_to_json(lit),  // 处理字面量
        Expr::Object(obj) => object_lit_to_json(obj),  // 处理对象字面量
        Expr::Array(arr) => array_lit_to_json(arr),  // 处理数组字面量（如果需要）
        _ => json!(null)  // 其他类型的值默认为 null
    }
}

// 将 Lit 转换为 JSON
fn lit_to_json(lit: &Lit) -> Value {
    match lit {
        Lit::Str(str_) => json!(str_.value),
        Lit::Num(num_) => json!(num_.value as i64),
        Lit::Bool(bool_) => json!(bool_.value),
        _ => json!(null)  // 其他字面量转换为 null
    }
}

fn object_lit_to_json(obj: &ObjectLit) -> Value {
    let mut map = serde_json::Map::new();

    // 遍历对象字面量中的每个属性
    for prop in &obj.props {
        if let PropOrSpread::Prop(ref prop) = prop {
            if let Prop::KeyValue(KeyValueProp { key, value }) = &**prop {
                match key {
                    PropName::Str(Str { value: key_str, .. }) => {
                        map.insert(key_str.as_str().unwrap_or("").to_string(), expr_to_json(value));  // 递归处理 value
                    }
                    PropName::Ident(IdentName { sym, .. }) => {
                        map.insert(sym.to_string(), expr_to_json(value));
                    }
                    _ => {
                    }
                }
            }
        }
    }

    Value::Object(map)
}

/// 检查 ObjectLit 是否包含 Turbopack 的 import 标记（import with { "__turbopack-helper__": "true", ... }）
fn object_has_turbopack_import_attrs(obj: &ObjectLit) -> bool {
    let markers = ["__turbopack-helper__", "turbopack-transition"];
    for prop in &obj.props {
        if let PropOrSpread::Prop(ref prop) = prop {
            if let Prop::KeyValue(KeyValueProp { key, .. }) = &**prop {
                let key_str = match key {
                    PropName::Str(Str { value, .. }) => value.as_str(),
                    PropName::Ident(IdentName { sym, .. }) => Some(sym.as_ref()),
                    _ => continue,
                };
                if let Some(s) = key_str {
                    if markers.contains(&s) {
                        return true;
                    }
                }
            }
        }
    }
    false
}

/// 检查是否为 __turbopack_context__.n(...) 调用
fn is_turbopack_context_call(expr: &Expr) -> bool {
    let Expr::Call(CallExpr { callee, .. }) = expr else { return false };
    let Callee::Expr(callee_expr) = callee else { return false };
    let Expr::Member(MemberExpr { obj, prop, .. }) = &**callee_expr else { return false };
    let MemberProp::Ident(prop_ident) = prop else { return false };
    if prop_ident.sym.as_ref() != "n" {
        return false;
    }
    let Expr::Ident(obj_ident) = &**obj else { return false };
    obj_ident.sym.as_ref() == "__turbopack_context__"
}

/// 识别 Next.js/Turbopack 生成的“import with + __turbopack_context__.n”包装模块，这类应跳过处理
fn is_turbopack_helper_module(program: &Program) -> bool {
    let Program::Module(module) = program else { return false };
    let mut has_turbopack_import = false;
    let mut has_turbopack_context_call = false;
    for item in &module.body {
        match item {
            ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) => {
                if let Some(with_obj) = &import_decl.with {
                    if object_has_turbopack_import_attrs(with_obj) {
                        has_turbopack_import = true;
                        break;
                    }
                }
            }
            ModuleItem::Stmt(Stmt::Expr(ExprStmt { expr, .. })) => {
                if is_turbopack_context_call(expr.as_ref()) {
                    has_turbopack_context_call = true;
                    break;
                }
            }
            _ => {}
        }
    }
    has_turbopack_import || has_turbopack_context_call
}

/// 识别 React Compiler 编译产物：含有从 "react/compiler-runtime" 的 import，应跳过处理
fn is_react_compiler_runtime_module(program: &Program) -> bool {
    let Program::Module(module) = program else { return false };
    for item in &module.body {
        if let ModuleItem::ModuleDecl(ModuleDecl::Import(import_decl)) = item {
            if import_decl.src.value == "react/compiler-runtime" {
                return true;
            }
        }
    }
    false
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

        let ci = self.config.ci.unwrap_or(false); // 只有 ci 为 true 时才生成 .canyon_output
        let keep_map = self.config.keepMap.unwrap_or(false); // 只有 false 时才执行过滤

        if ci {
            // 定一个map
            let mut map = std::collections::HashMap::new();
            // 遍历对象的属性
            for prop in &obj.props {
                if let PropOrSpread::Prop(ref prop) = prop {
                    if let Prop::KeyValue(KeyValueProp { key: PropName::Ident(IdentName { sym, .. }), value }) = &**prop {
                        // 解引用 value，处理其中的表达式
                        let value1 = match &**value {
                            Expr::Lit(lit) => {
                                lit_to_json(lit)
                            }
                            Expr::Object(ref obj) => {
                                // 如果是对象字面量，递归转换为 JSON
                                object_lit_to_json(obj)
                            }
                            _ => {
                                json!(null)  // 如果不是字面量或对象字面量，返回 null
                            }
                        };
                        map.insert(sym.clone(), value1);

                    }
                }
            }
            
            // 打印当前处理的文件路径
            if let Some((_path_key, path_val)) = map.iter().find(|(k, _)| &**k == "path") {
                if let Some(path_str) = path_val.as_str() {
                    println!("Processing coverage data for file: {}", path_str);
                }
            }
            // 目录/cwd/.canyon_output 没有就创建
            // 创建一个随机数生成器
            let mut rng = rand::thread_rng();

            // 生成一个随机的 u64 数字
            let random_number: u64 = rng.gen();

            // 将数字转换为字符串
            let random_string = random_number.to_string();

            // 构建文件名
            let file_path = format!("/cwd/.canyon_output/coverage-final-{}.json", random_string);

            // 获取文件的父目录路径
            let parent_dir = Path::new(&file_path).parent().unwrap();

            // 创建父目录及其所有缺失的父目录
            fs::create_dir_all(parent_dir).expect("Unable to create directories");

            // 创建一个新的map，使用原map的path作为key
            let mut final_map = serde_json::Map::new();
            
            // 将 HashMap<Atom, Value> 转换为 Map<String, Value>
            let converted_map: serde_json::Map<String, Value> = map.iter()
                .map(|(k, v)| (k.to_string(), v.clone()))
                .collect();

            // 获取path值
            if let Some((_path_key, path_val)) = map.iter().find(|(k, _)| &**k == "path") {
                if let Some(path_str) = path_val.as_str() {
                    final_map.insert(path_str.to_string(), Value::Object(converted_map));
                }
            }

            // 使用 `write` 方法进行同步写入
            write(file_path, serde_json::to_string(&final_map).expect("Unable to serialize JSON"))
                .expect("Unable to write file");
        }




        // 只有 keepMap 为 false 时才过滤属性
        if !keep_map {
            let excluded_keys = ["statementMap", "fnMap", "branchMap", "inputSourceMap"];
            obj.props.retain(|prop| {
                match prop {
                    PropOrSpread::Prop(prop) => {
                        if let Prop::KeyValue(KeyValueProp {
                                                  key: PropName::Ident(IdentName { sym, .. }),
                                                  ..
                                              }) = &**prop {
                            !excluded_keys.contains(&sym.as_ref())
                        } else {
                            true
                        }
                    }
                    _ => true,
                }
            });
        }

        let instrumentCwd = self.config.instrumentCwd.clone().unwrap_or("".to_string());
        let sha = self.config.sha.clone().unwrap_or("".to_string());

        // Add new properties from config
        let mut new_props = vec![];
        if !instrumentCwd.is_empty() {
            new_props.push(self.create_string_prop("instrumentCwd", instrumentCwd));
        }
        if !sha.is_empty() {
            new_props.push(self.create_string_prop("sha", sha));
        }

        // Extend the object with new properties
        obj.props.extend(new_props);
    }

    // Helper function to create a KeyValueProp with string value
    fn create_string_prop(&self, key: &str, value: String) -> PropOrSpread {
        PropOrSpread::Prop(Box::new(Prop::KeyValue(KeyValueProp {
            key: PropName::Ident(IdentName {
                sym: key.into(),
                span: Default::default(),
                // optional: false,
            }),
            value: Box::new(Expr::Lit(swc_core::ecma::ast::Lit::Str(swc_core::ecma::ast::Str {
                value: value.into(),
                span: Default::default(),
                raw: None,
            }))),
        })))
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
        let _excluded_keys = ["statementMap", "fnMap", "branchMap","inputSourceMap"];
        let _required_keys = ["statementMap", "fnMap", "branchMap"];

        // 定义需要同时包含的属性
        let required_keys = ["statementMap", "fnMap", "branchMap"];


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
    let config = serde_json::from_str::<Option<Config>>(
        &metadata
            .get_transform_plugin_config()
            .expect("failed to get plugin config for react-remove-properties"),
    )
        .expect("invalid config for react-remove-properties")
        .unwrap_or_default(); // Use default if config is None

    // 使用TransformPluginProgramMetadata获取环境变量
    let _env = metadata.get_context(&TransformPluginMetadataContextKind::Env).unwrap_or("-".to_string());
    let filename = metadata.get_context(&TransformPluginMetadataContextKind::Filename).unwrap_or("-".to_string());
    let _cwd = metadata.get_context(&TransformPluginMetadataContextKind::Cwd).unwrap_or("-".to_string());

    // Skip: node_modules、Turbopack 包装模块、或 React Compiler 编译产物
    if filename.contains("node_modules") {
        return program;
    }
    if is_turbopack_helper_module(&program) {
        // 打印路径
        println!("Turbopack 包装模块: {}", filename);
        return program;
    }
    if is_react_compiler_runtime_module(&program) {
        println!("React Compiler 编译产物: {}", filename);
        return program;
    }
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
