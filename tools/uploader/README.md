# Canyon Coverage Uploader

A high-performance, modular coverage data uploader for the Canyon ecosystem. This tool efficiently collects, processes, and uploads code coverage data from various testing frameworks to the Canyon platform.

## Features

- 🚀 **High Performance**: Built with Rust for maximum speed and reliability
- 📊 **Multi-format Support**: Handles various coverage formats (Istanbul, Jest, etc.)
- 🔄 **Smart Merging**: Automatically merges coverage data from multiple sources
- 🛡️ **Robust Error Handling**: Comprehensive error handling with detailed logging
- ⚙️ **Configurable**: Extensive configuration options via CLI, environment variables, and config files
- 🧪 **Dry Run Mode**: Test configurations without actual uploads
- 📁 **Request Logging**: Save request bodies for debugging and auditing
- 🎨 **Beautiful CLI**: Colorful, informative terminal output

## Installation

### From Source

```bash
git clone https://github.com/canyon-project/canyon.git
cd canyon/tools/uploader
cargo build --release
```

The binary will be available at `target/release/canyon-uploader`.

### Via Cargo

```bash
cargo install canyon-uploader
```

## Usage

### Basic Usage

Upload coverage data from the default directory:

```bash
canyon-uploader map
```

### Advanced Usage

Upload with custom configuration:

```bash
canyon-uploader map \
  --coverage-dir ./coverage \
  --dsn https://canyon.example.com/api/upload \
  --provider github \
  --project-id my-project \
  --sha $CI_COMMIT_SHA \
  --branch $CI_COMMIT_BRANCH \
  --reporter $CANYON_TOKEN
```

### Dry Run Mode

Test your configuration without uploading:

```bash
canyon-uploader map --dry-run
```

### Save Request for Debugging

Save the request body to a file for inspection:

```bash
canyon-uploader map --save-request ./debug-request.json
```

## CLI Reference

### Commands

#### `version`
Display version information and banner.

```bash
canyon-uploader version
```

#### `map`
Scan and upload coverage data.

**Options:**

| Option | Environment Variable | Description | Default |
|--------|---------------------|-------------|---------|
| `--coverage-dir` | `CANYON_COVERAGE_DIR` | Directory containing coverage files | `.canyon_output` |
| `--dsn` | `CANYON_DSN` | Upload endpoint URL | Required |
| `--provider` | `CANYON_PROVIDER` | Provider identifier (github, gitlab, etc.) | `default` |
| `--project-id` | `CANYON_PROJECT_ID` | Project identifier | Required |
| `--sha` | `CI_COMMIT_SHA` | Git commit SHA | Required |
| `--branch` | `CI_COMMIT_BRANCH` | Git branch name | Optional |
| `--compare-target` | `CANYON_COMPARE_TARGET` | Target branch for comparison | Optional |
| `--instrument-cwd` | `CANYON_INSTRUMENT_CWD` | Instrumentation working directory | Optional |
| `--reporter` | `CANYON_REPORTER` | Reporter token for authentication | Required |
| `--report-id` | `CANYON_REPORT_ID` | Custom report identifier | Optional |
| `--dry-run` | `CANYON_DRY_RUN` | Test without uploading | `false` |
| `--save-request` | `CANYON_SAVE_REQUEST` | Save request to file | Optional |
| `--verbose` | `CANYON_VERBOSE` | Enable verbose logging | `false` |

## Configuration

### Environment Variables

The uploader supports comprehensive configuration via environment variables:

```bash
# Required
export CANYON_DSN=https://canyon.example.com/api/upload
export CANYON_PROJECT_ID=my-awesome-project
export CANYON_REPORTER=your-secret-token

# Optional
export CANYON_PROVIDER=github
export CANYON_COVERAGE_DIR=./custom-coverage
export CI_COMMIT_SHA=$(git rev-parse HEAD)
export CI_COMMIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
```

### Configuration File

Create a `.canyon-uploader.toml` file in your project root:

```toml
[upload]
dsn = "https://canyon.example.com/api/upload"
provider = "github"
project_id = "my-project"

[logging]
level = "info"
format = "pretty"

[coverage]
directory = "./coverage"
pattern = "coverage-final-*.json"
```

## Coverage File Format

The uploader expects JSON files matching the pattern `coverage-final-*.json`. These files should contain Istanbul-compatible coverage data:

```json
{
  "/path/to/file.js": {
    "path": "/path/to/file.js",
    "statementMap": {...},
    "fnMap": {...},
    "branchMap": {...},
    "s": {...},
    "f": {...},
    "b": {...}
  }
}
```

## Examples

### GitHub Actions Integration

Create `.github/workflows/coverage.yml`:

```yaml
name: Upload Coverage
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --coverage
      - name: Upload to Canyon
        run: |
          canyon-uploader map \
            --dsn ${{ secrets.CANYON_DSN }} \
            --project-id ${{ github.repository }} \
            --sha ${{ github.sha }} \
            --branch ${{ github.ref_name }} \
            --reporter ${{ secrets.CANYON_TOKEN }}
```

### GitLab CI Integration

Add to `.gitlab-ci.yml`:

```yaml
coverage:
  stage: test
  script:
    - npm ci
    - npm run test -- --coverage
    - canyon-uploader map \
        --dsn $CANYON_DSN \
        --project-id $CI_PROJECT_PATH \
        --sha $CI_COMMIT_SHA \
        --branch $CI_COMMIT_REF_NAME \
        --reporter $CANYON_TOKEN
```

### Local Development

For local testing:

```bash
# Install
cargo install --path .

# Run with custom config
canyon-uploader map \
  --coverage-dir ./coverage \
  --dsn http://localhost:3000/api/upload \
  --project-id local-test \
  --sha $(git rev-parse HEAD) \
  --branch $(git rev-parse --abbrev-ref HEAD) \
  --reporter dev-token \
  --verbose
```

## Error Handling

The uploader provides detailed error messages for common issues:

- **File Not Found**: Coverage directory or files missing
- **Invalid JSON**: Malformed coverage data
- **Network Errors**: Connection issues with upload endpoint
- **Authentication**: Invalid reporter token
- **Configuration**: Missing required parameters

### Troubleshooting

Enable verbose logging for debugging:

```bash
RUST_LOG=debug canyon-uploader map --verbose
```

Common solutions:

1. **Coverage files not found**: Check `--coverage-dir` path
2. **Upload fails**: Verify `--dsn` and `--reporter` values
3. **Invalid data**: Ensure coverage files are valid JSON
4. **Permission denied**: Check file and directory permissions

## Architecture

The uploader is built with a modular architecture:

- **`config.rs`**: Configuration management and CLI parsing
- **`error.rs`**: Comprehensive error handling with `thiserror`
- **`logger.rs`**: Structured logging with color support
- **`merge.rs`**: Coverage data merging algorithms
- **`uploader.rs`**: Core upload functionality
- **`main.rs`**: CLI interface and orchestration

## Development

### Building from Source

```bash
# Clone repository
git clone https://github.com/canyon-project/canyon.git
cd canyon/tools/uploader

# Development build
cargo build

# Release build
cargo build --release

# Run tests
cargo test

# Run with debug output
RUST_LOG=debug cargo run -- map --dry-run
```

### Running Tests

```bash
# Unit tests
cargo test

# Integration tests
cargo test --test integration

# Test coverage
cargo tarpaulin --out Html
```

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `cargo test`
5. Format code: `cargo fmt`
6. Lint code: `cargo clippy`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/canyon-project/canyon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/canyon-project/canyon/discussions)
- **Documentation**: [Canyon Docs](https://canyon.dev/docs)

## Changelog

### v1.3.0
- Complete rewrite with modular architecture
- Enhanced error handling and logging
- Added dry-run mode
- Improved CLI interface
- Added comprehensive configuration options
- Better CI/CD integration

### v1.2.11
- Initial stable release
- Basic coverage upload functionality
- GitHub Actions integration