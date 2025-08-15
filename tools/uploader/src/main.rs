use clap::Parser;
use uploader::{Cli, Commands, UploadConfig, CoverageUploader, Result};
use std::path::Path;
use std::fs;
use std::collections::HashMap;
use serde_json::Value;
use uploader::merge::merge_coverage_map;

const VERSION: &str = env!("CARGO_PKG_VERSION");

fn print_banner() {
    let banner = r#"
   ____                              _           _ 
  / ___|__ _ _ __  _   _  ___  _ __  | |__   ___ | |
 | |   / _` | '_ \| | | |/ _ \| '_ \ | '_ \ / _ \| |
 | |__| (_| | | | | |_| | (_) | | | || | | | (_) | |
  \____\__,_|_| |_|\__, |\___/|_| |_||_| |_|\___/|_|
                   |___/                            
"#;
    println!("{}", banner);
    println!("Canyon Coverage Uploader v{}", VERSION);
    println!("A high-performance coverage data uploader for Canyon\n");
}

#[tokio::main]
async fn main() -> Result<()> {
    let args = Cli::parse();
    
    // Initialize logger
    uploader::logger::init_logger(args.verbose);

    match args.command {
        Commands::Version => {
            print_banner();
        }
        Commands::Map {
            coverage_dir,
            dsn,
            provider,
            report_id,
            project_id,
            sha,
            branch,
            compare_target,
            instrument_cwd,
            reporter,
            dry_run,
            save_request,
        } => {
            print_banner();
            
            let config = UploadConfig {
                dsn: dsn.unwrap_or_default(),
                provider: provider.unwrap_or_else(|| "default".to_string()),
                project_id: project_id.unwrap_or_default(),
                sha: sha.unwrap_or_default(),
                branch,
                compare_target,
                instrument_cwd,
                reporter,
                report_id,
                coverage_dir: coverage_dir.unwrap_or_else(|| ".canyon_output".into()),
                dry_run,
                save_request,
            };

            run_coverage_upload(config).await?;
        }
    }

    Ok(())
}

async fn run_coverage_upload(config: UploadConfig) -> Result<()> {
    use uploader::uploader::load_config;
    
    let config = load_config(config)?;
    let uploader = CoverageUploader::new(config.clone())?;

    log::info!("Starting coverage upload process...");
    log::info!("Coverage directory: {}", config.coverage_dir.display());

    // Scan for coverage files
    let coverage_files = scan_coverage_files(&config.coverage_dir)?;
    
    if coverage_files.is_empty() {
        log::warn!("No coverage files found in {}", config.coverage_dir.display());
        return Ok(());
    }

    log::info!("Found {} coverage files to process", coverage_files.len());

    // Process and merge coverage data
    let coverage_data = process_coverage_files(coverage_files, &config)?;

    // Upload data
    let results = upload_all_coverage(uploader, coverage_data).await?;
    
    // Print summary
    print_upload_summary(&results);
    
    Ok(())
}

fn scan_coverage_files(coverage_dir: &Path) -> Result<Vec<std::path::PathBuf>> {
    use std::io;
    
    if !coverage_dir.exists() {
        return Err(uploader::UploaderError::InvalidPath(format!(
            "Coverage directory does not exist: {}",
            coverage_dir.display()
        )));
    }

    let mut files = Vec::new();
    
    for entry in fs::read_dir(coverage_dir)? {
        let entry = entry?;
        let path = entry.path();
        
        if path.is_file() {
            let file_name = path.file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("");
                
            if file_name.starts_with("coverage-final") && file_name.ends_with(".json") {
                files.push(path);
            }
        }
    }

    Ok(files)
}

fn process_coverage_files(
    files: Vec<std::path::PathBuf>,
    config: &UploadConfig
) -> Result<Vec<uploader::CoverageData>> {
    use std::collections::HashMap;
    
    let mut project_data: HashMap<String, uploader::CoverageData> = HashMap::new();

    for file_path in files {
        log::debug!("Processing file: {}", file_path.display());
        
        let content = fs::read_to_string(&file_path)?;
        let coverage_map: Value = serde_json::from_str(&content)?;

        // Extract project information from first file entry
        let first_entry = coverage_map.as_object()
            .and_then(|m| m.values().next());

        if let Some(first_value) = first_entry {
            let project_id = format!("{}-{}-auto", 
                &config.provider, 
                config.project_id
            );

            let data = uploader::CoverageData {
                coverage: coverage_map.clone(),
                project_id: project_id.clone(),
                sha: config.sha.clone(),
                instrument_cwd: config.instrument_cwd.clone(),
                dsn: Some(config.dsn.clone()),
                reporter: config.reporter.clone(),
                branch: config.branch.clone(),
                compare_target: config.compare_target.clone(),
                report_id: config.report_id.clone(),
            };

            // Merge with existing data if project already exists
            if let Some(existing) = project_data.get_mut(&project_id) {
                log::info!("Merging coverage data for project: {}", project_id);
                let merged = merge_coverage_map(&existing.coverage, &data.coverage)
                    .map_err(|e| uploader::UploaderError::CoverageData(e.to_string()))?;
                existing.coverage = merged;
            } else {
                project_data.insert(project_id.clone(), data);
            }
        }
    }

    Ok(project_data.into_values().collect())
}

async fn upload_all_coverage(
    uploader: uploader::CoverageUploader,
    coverage_data: Vec<uploader::CoverageData>
) -> Result<Vec<uploader::UploadResponse>> {
    let mut results = Vec::new();

    for data in coverage_data {
        match uploader.upload(&data).await {
            Ok(response) => {
                results.push(response);
            }
            Err(e) => {
                log::error!("Failed to upload coverage for project {}: {}", 
                    data.project_id, e);
                if !uploader.config.dry_run {
                    return Err(e);
                }
            }
        }
    }

    Ok(results)
}

fn print_upload_summary(results: &[uploader::UploadResponse]) {
    let success_count = results.iter().filter(|r| r.success).count();
    let total_count = results.len();

    println!("\n{}", "=".repeat(50));
    println!("UPLOAD SUMMARY");
    println!("{}", "=".repeat(50));
    println!("Total uploads: {}", total_count);
    println!("Successful: {}", success_count);
    println!("Failed: {}", total_count - success_count);

    for (i, result) in results.iter().enumerate() {
        println!("{}. {} - {}", 
            i + 1,
            if result.success { "✓" } else { "✗" },
            result.message
        );
        
        if let Some(url) = &result.report_url {
            println!("   Report URL: {}", url);
        }
    }
}
