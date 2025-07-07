use actix_web::{App, HttpResponse, HttpServer, Responder, post,get, web};
use serde_json::Value;
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;
use anyhow::Result;

// 创建保存目录
fn create_output_directory() -> Result<()> {
    let dir_path = PathBuf::from(".canyon_output");
    if !dir_path.exists() {
        fs::create_dir_all(&dir_path)?;
    }
    Ok(())
}

// 健康检查处理函数
#[get("/vi/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

// 处理 POST 请求的处理函数
#[post("/coverage/client")]
async fn save_json(data: web::Json<Value>) -> impl Responder {
    // 创建输出目录
    if let Err(e) = create_output_directory() {
        return HttpResponse::InternalServerError().body(format!("创建目录失败: {}", e));
    }

    // 生成文件名（使用时间戳确保唯一性）
    let timestamp = chrono::Utc::now().format("%Y%m%d%H%M%S%.3f");
    let filename = format!("{}.json", timestamp);
    let file_path = PathBuf::from(".canyon_output").join(filename);

    // 将 JSON 数据写入文件
    match File::create(&file_path) {
        Ok(mut file) => {
            if let Err(e) = file.write_all(serde_json::to_string_pretty(&data).unwrap().as_bytes()) {
                return HttpResponse::InternalServerError().body(format!("写入文件失败: {}", e));
            }
            HttpResponse::Ok().body("数据已成功保存")
        }
        Err(e) => {
            HttpResponse::InternalServerError().body(format!("创建文件失败: {}", e))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("服务器启动中，监听地址: 127.0.0.1:8080");

    HttpServer::new(|| {
        App::new()
            .service(save_json)
            .service(health_check)
    })
        .bind("127.0.0.1:8080")?
        .run()
        .await
}