use thiserror::Error;

#[derive(Error, Debug)]
pub enum UploaderError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("JSON parsing error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("HTTP request error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("Invalid path: {0}")]
    InvalidPath(String),
    
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Upload failed: {0}")]
    Upload(String),
    
    #[error("Coverage data error: {0}")]
    CoverageData(String),
}

pub type Result<T> = std::result::Result<T, UploaderError>;