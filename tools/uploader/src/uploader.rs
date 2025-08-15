use crate::config::UploadConfig;
use crate::error::{UploaderError, Result};
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::Path;
use std::time::Duration;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CoverageData {
    pub coverage: Value,
    pub project_id: String,
    pub sha: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compare_target: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub instrument_cwd: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub branch: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub dsn: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reporter: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub report_id: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UploadResponse {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub report_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub report_id: Option<String>,
}

pub struct CoverageUploader {
    client: Client,
    config: UploadConfig,
}

impl CoverageUploader {
    pub fn new(config: UploadConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .gzip(true)
            .brotli(true)
            .user_agent("canyon-uploader/1.3.0")
            .build()
            .map_err(|e| UploaderError::Http(e))?;

        Ok(Self { client, config })
    }

    pub async fn upload(&self, data: &CoverageData) -> Result<UploadResponse> {
        if self.config.dry_run {
            log::info!("DRY RUN: Would upload coverage data for project {}", data.project_id);
            if self.config.save_request {
                self.save_request_body(data)?;
            }
            return Ok(UploadResponse {
                success: true,
                message: "Dry run completed".to_string(),
                report_url: None,
                report_id: None,
            });
        }

        let dsn = data.dsn.as_ref()
            .ok_or_else(|| UploaderError::Config("DSN endpoint not provided".into()))?;

        let bearer_token = match data.reporter.as_ref() {
            Some(token) => format!("Bearer {}", token),
            None => "Bearer".to_string(),
        };

        log::info!("Uploading coverage data for project: {}", data.project_id);
        log::debug!("DSN: {}", dsn);
        log::debug!("Project ID: {}", data.project_id);
        log::debug!("SHA: {}", data.sha);
        log::debug!("Branch: {:?}", data.branch);

        if self.config.save_request {
            self.save_request_body(data)?;
        }

        let response = self.client
            .post(dsn)
            .json(data)
            .header("Authorization", bearer_token)
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .send()
            .await
            .map_err(|e| UploaderError::Http(e))?;

        let status = response.status();
        let response_text = response.text().await
            .map_err(|e| UploaderError::Http(e))?;

        log::debug!("Response status: {}", status);
        log::debug!("Response body: {}", response_text);

        match status {
            StatusCode::OK | StatusCode::CREATED => {
                let response_data: UploadResponse = serde_json::from_str(&response_text)
                    .map_err(|e| UploaderError::Json(e))?;
                
                if response_data.success {
                    log::info!("Successfully uploaded coverage data");
                    if let Some(url) = &response_data.report_url {
                        log::info!("Report URL: {}", url);
                    }
                    if let Some(id) = &response_data.report_id {
                        log::info!("Report ID: {}", id);
                    }
                } else {
                    log::warn!("Upload completed but server reported: {}", response_data.message);
                }
                
                Ok(response_data)
            }
            _ => {
                let error_msg = format!("Upload failed with status {}: {}", status, response_text);
                log::error!("{}", error_msg);
                Err(UploaderError::Upload(error_msg))
            }
        }
    }

    fn save_request_body(&self, data: &CoverageData) -> Result<()> {
        let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
        let filename = format!("request_body_{}.json", timestamp);
        
        let json = serde_json::to_string_pretty(data)
            .map_err(|e| UploaderError::Json(e))?;
        
        fs::write(&filename, json)
            .map_err(|e| UploaderError::Io(e))?;
        
        log::info!("Request body saved to: {}", filename);
        Ok(())
    }
}

/// Loads and validates configuration from environment and CLI
pub fn load_config(config: UploadConfig) -> Result<UploadConfig> {
    let mut final_config = config;

    // Validate required fields
    if final_config.dsn.is_empty() {
        return Err(UploaderError::Config("DSN endpoint is required".into()));
    }

    if final_config.project_id.is_empty() {
        return Err(UploaderError::Config("Project ID is required".into()));
    }

    if final_config.sha.is_empty() {
        return Err(UploaderError::Config("SHA is required".into()));
    }

    // Ensure coverage directory exists
    if !final_config.coverage_dir.exists() {
        return Err(UploaderError::InvalidPath(format!(
            "Coverage directory does not exist: {}",
            final_config.coverage_dir.display()
        )));
    }

    Ok(final_config)
}