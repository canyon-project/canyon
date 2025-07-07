use actix_web::{App, HttpServer};

use crate::handlers::{health_check, save_json};

mod handlers;

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