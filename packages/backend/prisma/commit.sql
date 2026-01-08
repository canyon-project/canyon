CREATE TABLE commits (
                       id                BIGSERIAL PRIMARY KEY,

  -- 外部唯一标识
                       repo_id           BIGINT NOT NULL,
                       commit_sha        VARCHAR(40) NOT NULL,

  -- 基础信息
                       author_name       TEXT,
                       author_email      TEXT,
                       authored_at       TIMESTAMPTZ,

                       committer_name    TEXT,
                       committer_email  TEXT,
                       committed_at     TIMESTAMPTZ,

                       title             TEXT,
                       message           TEXT,

  -- 分支信息（冗余字段，极其有用）
                       branch            TEXT,

  -- 外部数据快照
                       raw_payload       JSONB,

  -- 同步信息
                       fetched_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

                       UNIQUE (repo_id, commit_sha)
);
