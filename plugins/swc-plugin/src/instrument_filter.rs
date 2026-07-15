use regex::Regex;
use std::path::{Path, PathBuf};

const DEFAULT_EXTENSIONS: &[&str] = &[".js", ".cjs", ".mjs", ".ts", ".tsx", ".jsx", ".vue"];

fn normalize_extensions(extensions: &[String]) -> Vec<String> {
    extensions
        .iter()
        .map(|ext| {
            if ext.starts_with('.') {
                ext.clone()
            } else {
                format!(".{ext}")
            }
        })
        .collect()
}

/// Mirrors test-exclude's `prepGlobPatterns`.
fn prep_glob_patterns(patterns: Vec<String>) -> Vec<String> {
    let mut result = Vec::new();
    for pattern in patterns {
        if !pattern.ends_with("/**") {
            let base = pattern.trim_end_matches('/');
            result.push(format!("{base}/**"));
        }
        if let Some(stripped) = pattern.strip_prefix("**/") {
            result.push(stripped.to_string());
        }
        result.push(pattern);
    }
    result
}

fn split_negated_patterns(patterns: Vec<String>) -> (Vec<String>, Vec<String>) {
    let mut positive = Vec::new();
    let mut negated = Vec::new();
    for pattern in patterns {
        if let Some(stripped) = pattern.strip_prefix('!') {
            negated.push(stripped.to_string());
        } else {
            positive.push(pattern);
        }
    }
    (positive, negated)
}

fn expand_braces(input: &str) -> Vec<String> {
    let Some(start) = input.find('{') else {
        return vec![input.to_string()];
    };
    let Some(end) = input[start..].find('}') else {
        return vec![input.to_string()];
    };

    let prefix = &input[..start];
    let suffix = &input[start + end + 1..];
    let alternatives = &input[start + 1..start + end];
    let mut expanded = Vec::new();
    for alt in alternatives.split(',') {
        expanded.extend(expand_braces(&format!("{prefix}{alt}{suffix}")));
    }
    expanded
}

fn glob_to_regex(pattern: &str) -> String {
    let mut regex = String::from("^");
    let bytes = pattern.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        match bytes[i] as char {
            '*' => {
                if i + 1 < bytes.len() && bytes[i + 1] as char == '*' {
                    if i + 2 < bytes.len() && bytes[i + 2] as char == '/' {
                        regex.push_str("(?:.*/)?");
                        i += 3;
                    } else {
                        regex.push_str(".*");
                        i += 2;
                    }
                } else {
                    regex.push_str("[^/]*");
                    i += 1;
                }
            }
            '?' => {
                regex.push_str("[^/]");
                i += 1;
            }
            '.' | '+' | '^' | '$' | '{' | '}' | '(' | ')' | '|' | '[' | ']' | '\\' => {
                regex.push('\\');
                regex.push(bytes[i] as char);
                i += 1;
            }
            ch => {
                regex.push(ch);
                i += 1;
            }
        }
    }

    regex.push('$');
    regex
}

fn build_regex_set(patterns: &[String]) -> Vec<Regex> {
    let mut compiled = Vec::new();
    for pattern in prep_glob_patterns(patterns.to_vec()) {
        for expanded in expand_braces(&pattern) {
            if let Ok(regex) = Regex::new(&glob_to_regex(&expanded)) {
                compiled.push(regex);
            }
        }
    }
    compiled
}

fn matches_any(patterns: &[Regex], path: &str) -> bool {
    patterns.iter().any(|pattern| pattern.is_match(path))
}

fn is_outside_dir(dir: &Path, filename: &Path) -> bool {
    filename
        .strip_prefix(dir)
        .map(|rel| {
            rel.components().next().map_or(false, |c| {
                matches!(c, std::path::Component::ParentDir)
            })
        })
        .unwrap_or(true)
}

fn normalize_relative_path(path: &Path) -> String {
    let mut normalized = path.to_string_lossy().replace('\\', "/");
    if let Some(stripped) = normalized.strip_prefix("./") {
        normalized = stripped.to_string();
    }
    normalized
}

pub struct InstrumentFilter {
    cwd: PathBuf,
    include: Vec<Regex>,
    exclude: Vec<Regex>,
    exclude_negated: Vec<Regex>,
    extensions: Option<Vec<String>>,
}

impl InstrumentFilter {
    pub fn new(
        cwd: impl AsRef<Path>,
        include: Option<Vec<String>>,
        exclude: Option<Vec<String>>,
        extension: Option<Vec<String>>,
        exclude_node_modules: bool,
    ) -> Self {
        let cwd = cwd.as_ref().to_path_buf();

        let mut include_patterns = include.unwrap_or_default();
        let mut exclude_patterns = exclude.unwrap_or_default();

        if exclude_node_modules && !exclude_patterns.iter().any(|p| p == "**/node_modules/**") {
            exclude_patterns.push("**/node_modules/**".to_string());
        }

        let (include_positive, include_negated) = split_negated_patterns(include_patterns);
        include_patterns = include_positive;
        exclude_patterns.extend(include_negated);

        let (exclude_positive, exclude_negated) = split_negated_patterns(exclude_patterns);

        Self {
            cwd,
            include: build_regex_set(&include_patterns),
            exclude: build_regex_set(&exclude_positive),
            exclude_negated: build_regex_set(&exclude_negated),
            extensions: match extension {
                None => Some(
                    DEFAULT_EXTENSIONS
                        .iter()
                        .map(|ext| (*ext).to_string())
                        .collect(),
                ),
                Some(exts) if exts.is_empty() => None,
                Some(exts) => Some(normalize_extensions(&exts)),
            },
        }
    }

    pub fn should_instrument(&self, filename: &str) -> bool {
        if let Some(extensions) = &self.extensions {
            if !extensions.iter().any(|ext| filename.ends_with(ext)) {
                return false;
            }
        }

        let filename_path = Path::new(filename);
        if is_outside_dir(&self.cwd, filename_path) {
            return false;
        }

        let path_to_check = normalize_relative_path(
            filename_path
                .strip_prefix(&self.cwd)
                .unwrap_or(filename_path),
        );

        if !self.include.is_empty() && !matches_any(&self.include, &path_to_check) {
            return false;
        }

        let excluded = matches_any(&self.exclude, &path_to_check);
        let excluded_negated = matches_any(&self.exclude_negated, &path_to_check);

        !excluded || excluded_negated
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn skips_node_modules_by_default() {
        let filter = InstrumentFilter::new("/project", None, None, None, true);
        assert!(!filter.should_instrument("/project/node_modules/pkg/index.js"));
        assert!(filter.should_instrument("/project/src/index.ts"));
    }

    #[test]
    fn respects_include_and_extension() {
        let filter = InstrumentFilter::new(
            "/project",
            Some(vec!["src/**/*.ts".to_string()]),
            None,
            Some(vec![".ts".to_string()]),
            true,
        );
        assert!(filter.should_instrument("/project/src/foo.ts"));
        assert!(!filter.should_instrument("/project/src/foo.tsx"));
        assert!(!filter.should_instrument("/project/lib/foo.ts"));
    }

    #[test]
    fn respects_exclude() {
        let filter = InstrumentFilter::new(
            "/project",
            None,
            Some(vec!["**/*.test.ts".to_string()]),
            Some(vec![".ts".to_string()]),
            false,
        );
        assert!(filter.should_instrument("/project/src/foo.ts"));
        assert!(!filter.should_instrument("/project/src/foo.test.ts"));
    }
}
