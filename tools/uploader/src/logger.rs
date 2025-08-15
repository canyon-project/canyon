use chrono::Local;
use log::{Level, LevelFilter, Metadata, Record};
use std::env;
use std::io::{self, Write};

pub struct SimpleLogger;

impl log::Log for SimpleLogger {
    fn enabled(&self, metadata: &Metadata) -> bool {
        metadata.level() <= Level::Trace
    }

    fn log(&self, record: &Record) {
        if self.enabled(record.metadata()) {
            let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
            let level = record.level();
            let target = record.target();
            let message = record.args();
            
            let color = match level {
                Level::Error => "\x1b[31m", // Red
                Level::Warn => "\x1b[33m",  // Yellow
                Level::Info => "\x1b[32m",  // Green
                Level::Debug => "\x1b[36m", // Cyan
                Level::Trace => "\x1b[90m", // Bright black
            };
            
            let reset = "\x1b[0m";
            
            println!(
                "{} {}[{}]{} [{}] => {}",
                timestamp, color, level, reset, target, message
            );
        }
    }

    fn flush(&self) {
        io::stdout().flush().unwrap();
    }
}

pub fn init_logger(verbose: bool) {
    let level = if verbose {
        LevelFilter::Debug
    } else {
        env::var("CANYON_LOG")
            .ok()
            .and_then(|s| match s.to_lowercase().as_str() {
                "trace" => Some(LevelFilter::Trace),
                "debug" => Some(LevelFilter::Debug),
                "info" => Some(LevelFilter::Info),
                "warn" => Some(LevelFilter::Warn),
                "error" => Some(LevelFilter::Error),
                _ => None,
            })
            .unwrap_or(LevelFilter::Info)
    };

    log::set_logger(&SimpleLogger)
        .map(|()| log::set_max_level(level))
        .expect("Failed to initialize logger");
}