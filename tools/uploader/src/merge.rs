use serde_json::{Value, Map, Number};
use crate::error::{UploaderError, Result};

/// Merges coverage data for a single file
pub fn merge_file_coverage(first: &Value, second: &Value) -> Result<Value> {
    let first_obj = first.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Invalid coverage format: expected object".into()))?;
    let second_obj = second.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Invalid coverage format: expected object".into()))?;

    let first_path = first_obj.get("path")
        .and_then(|v| v.as_str())
        .ok_or_else(|| UploaderError::CoverageData("Missing or invalid 'path' field".into()))?;

    let mut result = Map::new();

    // Merge statement coverage (s)
    if let (Some(first_s), Some(second_s)) = (first_obj.get("s"), second_obj.get("s")) {
        let merged_s = merge_coverage_object(first_s, second_s)?;
        result.insert("s".to_string(), merged_s);
    }

    // Merge function coverage (f)
    if let (Some(first_f), Some(second_f)) = (first_obj.get("f"), second_obj.get("f")) {
        let merged_f = merge_coverage_object(first_f, second_f)?;
        result.insert("f".to_string(), merged_f);
    }

    // Merge branch coverage (b)
    if let (Some(first_b), Some(second_b)) = (first_obj.get("b"), second_obj.get("b")) {
        let merged_b = merge_branch_coverage(first_b, second_b)?;
        result.insert("b".to_string(), merged_b);
    }

    result.insert("path".to_string(), Value::String(first_path.to_string()));

    // Copy all other fields from first object
    for (key, value) in first_obj {
        if !matches!(key.as_str(), "s" | "f" | "b" | "path") && !value.is_null() {
            result.insert(key.clone(), value.clone());
        }
    }

    // Copy/overwrite fields from second object
    for (key, value) in second_obj {
        if !matches!(key.as_str(), "s" | "f" | "b" | "path") && !value.is_null() {
            result.insert(key.clone(), value.clone());
        }
    }

    Ok(Value::Object(result))
}

/// Merges coverage map for multiple files
pub fn merge_coverage_map(first: &Value, second: &Value) -> Result<Value> {
    let first_map = first.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Invalid coverage map format".into()))?;
    let second_map = second.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Invalid coverage map format".into()))?;

    let mut result = first_map.clone();

    for (file_path, second_coverage) in second_map {
        if let Some(first_coverage) = result.get(file_path) {
            let merged = merge_file_coverage(first_coverage, second_coverage)?;
            result.insert(file_path.clone(), merged);
        } else {
            result.insert(file_path.clone(), second_coverage.clone());
        }
    }

    Ok(Value::Object(result))
}

/// Helper function to merge coverage objects (s and f fields)
fn merge_coverage_object(first: &Value, second: &Value) -> Result<Value> {
    let first_obj = first.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Expected object for coverage data".into()))?;
    let second_obj = second.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Expected object for coverage data".into()))?;

    let mut merged = first_obj.clone();

    for (key, second_value) in second_obj {
        let first_value = merged.entry(key.clone()).or_insert(Value::Number(Number::from(0)));
        
        let first_num = first_value.as_u64().unwrap_or(0);
        let second_num = second_value.as_u64().unwrap_or(0);
        
        *first_value = Value::Number(Number::from(first_num + second_num));
    }

    Ok(Value::Object(merged))
}

/// Helper function to merge branch coverage (b field)
fn merge_branch_coverage(first: &Value, second: &Value) -> Result<Value> {
    let first_obj = first.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Expected object for branch coverage".into()))?;
    let second_obj = second.as_object()
        .ok_or_else(|| UploaderError::CoverageData("Expected object for branch coverage".into()))?;

    let mut merged = first_obj.clone();

    for (key, second_value) in second_obj {
        let first_value = merged.entry(key.clone()).or_insert(Value::Array(vec![]));
        
        let first_array = first_value.as_array_mut()
            .ok_or_else(|| UploaderError::CoverageData("Expected array for branch data".into()))?;
        let second_array = second_value.as_array()
            .ok_or_else(|| UploaderError::CoverageData("Expected array for branch data".into()))?;

        // Ensure first_array has enough elements
        while first_array.len() < second_array.len() {
            first_array.push(Value::Number(Number::from(0)));
        }

        // Merge arrays
        for (i, second_item) in second_array.iter().enumerate() {
            if i < first_array.len() {
                let first_num = first_array[i].as_u64().unwrap_or(0);
                let second_num = second_item.as_u64().unwrap_or(0);
                first_array[i] = Value::Number(Number::from(first_num + second_num));
            } else {
                first_array.push(second_item.clone());
            }
        }
    }

    Ok(Value::Object(merged))
}