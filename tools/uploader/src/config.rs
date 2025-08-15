use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(
    name = "canyon-uploader",
    version = "1.3.0",
    about = "A high-performance coverage data uploader for Canyon",
    long_about = "A robust and efficient tool for uploading coverage data to Canyon platform with support for merging multiple coverage files and flexible configuration options."
)]
#[command(propagate_version = true)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
    
    /// Enable verbose logging
    #[arg(short, long, global = true)]
    pub verbose: bool,
    
    /// Configuration file path
    #[arg(short, long, global = true)]
    pub config: Option<PathBuf>,
}

#[derive(Subcommand, Debug)]
pub enum Commands {
    /// Display version information
    Version,
    
    /// Scan directory and upload coverage data
    Map {
        /// Directory containing coverage files [default: .canyon_output]
        #[arg(short, long, env = "CANYON_COVERAGE_DIR")]
        coverage_dir: Option<PathBuf>,
        
        /// DSN endpoint for uploading data [env: DSN]
        #[arg(short, long, env = "DSN")]
        dsn: Option<String>,
        
        /// Provider identifier [env: CANYON_PROVIDER]
        #[arg(short, long, env = "CANYON_PROVIDER")]
        provider: Option<String>,
        
        /// Report ID [env: CANYON_REPORT_ID]
        #[arg(short, long, env = "CANYON_REPORT_ID")]
        report_id: Option<String>,
        
        /// Project ID [env: CI_PROJECT_ID]
        #[arg(long, env = "CI_PROJECT_ID")]
        project_id: Option<String>,
        
        /// Git commit SHA [env: CI_COMMIT_SHA]
        #[arg(long, env = "CI_COMMIT_SHA")]
        sha: Option<String>,
        
        /// Git branch name [env: CI_COMMIT_BRANCH]
        #[arg(long, env = "CI_COMMIT_BRANCH")]
        branch: Option<String>,
        
        /// Compare target branch [env: CANYON_COMPARE_TARGET]
        #[arg(long, env = "CANYON_COMPARE_TARGET")]
        compare_target: Option<String>,
        
        /// Instrumentation working directory [env: CANYON_INSTRUMENT_CWD]
        #[arg(long, env = "CANYON_INSTRUMENT_CWD")]
        instrument_cwd: Option<String>,
        
        /// Reporter token [env: CANYON_REPORTER]
        #[arg(long, env = "CANYON_REPORTER")]
        reporter: Option<String>,
        
        /// Skip upload, only merge coverage files
        #[arg(long)]
        dry_run: bool,
        
        /// Save request body to file for debugging
        #[arg(long)]
        save_request: bool,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UploadConfig {
    pub dsn: String,
    pub provider: String,
    pub project_id: String,
    pub sha: String,
    pub branch: Option<String>,
    pub compare_target: Option<String>,
    pub instrument_cwd: Option<String>,
    pub reporter: Option<String>,
    pub report_id: Option<String>,
    pub coverage_dir: PathBuf,
    pub dry_run: bool,
    pub save_request: bool,
}

impl Default for UploadConfig {
    fn default() -> Self {
        Self {
            dsn: String::new(),
            provider: "default".to_string(),
            project_id: String::new(),
            sha: String::new(),
            branch: None,
            compare_target: None,
            instrument_cwd: None,
            reporter: None,
            report_id: None,
            coverage_dir: PathBuf::from(".canyon_output"),
            dry_run: false,
            save_request: false,
        }
    }
}