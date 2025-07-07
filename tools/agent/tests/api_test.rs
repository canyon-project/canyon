use actix_web::{test, web, App};
use serde_json::json;
use std::fs;

// 导入要测试的处理函数
use agent::{health_check, save_json};

#[actix_web::test]
async fn test_health_check() {
    let app = test::init_service(
        App::new()
            .service(health_check)
    ).await;

    let req = test::TestRequest::get().uri("/vi/health").to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    let body = test::read_body(resp).await;
    assert_eq!(body, "OK");
}

#[actix_web::test]
async fn test_save_json() {
    // 清理测试目录
    let test_dir = ".canyon_output";
    if fs::metadata(test_dir).is_ok() {
        fs::remove_dir_all(test_dir).unwrap();
    }

    let app = test::init_service(
        App::new()
            .service(save_json)
    ).await;

    // 测试正常情况
    let test_data = json!({
        "coverage": {
            "file1.js": { "lines": [1, 2, 3] },
            "file2.js": { "lines": [4, 5, 6] }
        }
    });

    let req = test::TestRequest::post()
        .uri("/coverage/client")
        .set_json(&test_data)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());

    // 验证文件是否被创建
    assert!(fs::metadata(test_dir).is_ok());
    let files = fs::read_dir(test_dir).unwrap().count();
    assert_eq!(files, 1);

    // 测试无效JSON数据
    let invalid_data = json!({"invalid": null});
    let req = test::TestRequest::post()
        .uri("/coverage/client")
        .set_json(&invalid_data)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success()); // 当前实现总是返回成功，如果有验证逻辑，这里需要相应修改

    // 清理测试目录
    fs::remove_dir_all(test_dir).unwrap();
}