-- 创建 simple_git_provider 表
CREATE TABLE simple_git_provider (
                                   id VARCHAR PRIMARY KEY,
                                   url VARCHAR NOT NULL,
                                   type VARCHAR NOT NULL,
                                   name VARCHAR NOT NULL,
                                   disabled BOOLEAN NOT NULL,
                                   private_token VARCHAR NOT NULL
);

-- 创建 simple_coverage 表
CREATE TABLE simple_coverage (
                               id VARCHAR PRIMARY KEY,
                               sha VARCHAR NOT NULL,
                               branch VARCHAR NOT NULL,
                               provider VARCHAR NOT NULL,
                               repo_id VARCHAR NOT NULL,
                               build_provider VARCHAR NOT NULL,
                               build_id VARCHAR NOT NULL,
                               branches_total INTEGER NOT NULL,
                               branches_covered INTEGER NOT NULL,
                               functions_total INTEGER NOT NULL,
                               functions_covered INTEGER NOT NULL,
                               lines_total INTEGER NOT NULL,
                               lines_covered INTEGER NOT NULL,
                               statements_total INTEGER NOT NULL,
                               statements_covered INTEGER NOT NULL,
                               newlines_total INTEGER NOT NULL,
                               newlines_covered INTEGER NOT NULL,
                               summary VARCHAR NOT NULL,
                               hit VARCHAR NOT NULL,
                               instrument_cwd VARCHAR NOT NULL,
                               created_at TIMESTAMP NOT NULL
);
