pub mod error;
pub mod config;
pub mod logger;
pub mod merge;
pub mod uploader;

pub use error::{UploaderError, Result};
pub use config::{Cli, Commands, UploadConfig};
pub use uploader::{CoverageUploader, CoverageData, UploadResponse};
pub use merge::{merge_coverage_map, merge_file_coverage};