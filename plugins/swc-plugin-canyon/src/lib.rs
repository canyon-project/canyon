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


use serde::Deserialize;

pub struct TransformVisitor {
}
impl TransformVisitor {
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

        obj.props.retain(|prop| {
            match prop {
                PropOrSpread::Prop(prop) => {
                    // 解引用 Box<Prop>，并匹配 KeyValueProp
                    if let Prop::KeyValue(KeyValueProp {
                                              key: PropName::Ident(IdentName { sym, .. }), // 使用 Ident 类型
                                              ..
                                          }) = &**prop
                    {
                        // 使用 as_ref() 将 JsWord 转换为 &str 进行比较
                        return !excluded_keys.contains(&sym.as_ref());
                    }
                    // 对于其他类型的属性，保留它们
                    true
                }
                _ => true, // 对于其他类型的属性，保留
            }
        });
    }
}

#[plugin_transform]
pub fn process_transform(program: Program, metadata: TransformPluginProgramMetadata) -> Program {
    program.fold_with(&mut as_folder(TransformVisitor { }))
}

test_inline!(
    Default::default(),
    |_| as_folder(TransformVisitor { }),
    boo,
    // 输入代码
    r#"const coverageData={fnMap:"nihao"};"#,
    // 经插件转换后的输出代码
    r#"const coverageData={};"#
);
