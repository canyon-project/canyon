use clap::{Parser, Subcommand};

#[derive(Subcommand)]
enum Commands {
    /// 输出版本信息
    Version,
}

#[derive(Parser)]
#[command(name = "canyon-uploader")]
#[command(about = "一个用于上传覆盖率数据的工具")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[tokio::main]
async fn main() {
    let args = Cli::parse();

    match args.command {
        Some(Commands::Version) => {
            println!("canyon-uploader 版本 1.2.10");
        }
        None => {
            eprintln!("请指定一个子命令");
        }
    }
}