-- CreateTable
CREATE TABLE "public"."canyonjs_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_repo" (
    "id" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "config" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_coverage" (
                                            "id" TEXT NOT NULL,
                                            "version_id" TEXT NOT NULL,
                                            "instrument_cwd" TEXT NOT NULL,
                                            "sha" TEXT NOT NULL,
                                            "branch" TEXT NOT NULL,
                                            "compare_target" TEXT NOT NULL,
                                            "provider" TEXT NOT NULL,
                                            "build_provider" TEXT NOT NULL,
                                            "build_target" TEXT NOT NULL,
                                            "build_id" TEXT NOT NULL,
                                            "repo_id" TEXT NOT NULL,
                                            "reporter" TEXT NOT NULL,
                                            "report_provider" TEXT NOT NULL,
                                            "report_id" TEXT NOT NULL,
                                            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                            CONSTRAINT "canyonjs_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_coverage_map_relation" (
                                                         "id" TEXT NOT NULL,
                                                         "full_file_path" TEXT NOT NULL,
                                                         "file_path" TEXT NOT NULL,
                                                         "restore_full_file_path" TEXT NOT NULL,
                                                         "coverage_map_hash_id" TEXT NOT NULL,
                                                         "version_id" TEXT NOT NULL,
                                                         "source_map_hash_id" TEXT NOT NULL,

                                                         CONSTRAINT "canyonjs_coverage_map_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" BYTEA NOT NULL,

    CONSTRAINT "canyonjs_coverage_source_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_diff" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "subject" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_diff_pkey" PRIMARY KEY ("id")
);

-- CreateTable: request tracing logs (类似 OpenTelemetry 的请求日志追踪)
CREATE TABLE "public"."canyonjs_request_log" (
    "id" TEXT NOT NULL,
    -- 业务维度
    "provider" TEXT NOT NULL,                 -- git 提供方/系统来源，可选
    "service_name" TEXT NOT NULL,             -- 服务名/应用名
    "route" TEXT NOT NULL,                    -- 路由/接口名，例如 GET /api/coverage
    "method" TEXT NOT NULL,                   -- HTTP 方法
    "status_code" INTEGER NOT NULL,           -- HTTP 状态码
    -- 关联与追踪
    "request_id" TEXT NOT NULL,               -- 请求唯一ID（用于回查）
    "trace_id" TEXT NOT NULL,                 -- TraceId
    "span_id" TEXT NOT NULL,                  -- SpanId
    "parent_span_id" TEXT NOT NULL,           -- ParentSpanId（无则为空字符串）
    -- 时间
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_ms" BIGINT NOT NULL DEFAULT 0,
    -- 级别与消息
    "level" TEXT NOT NULL,                    -- 日志级别：DEBUG/INFO/WARN/ERROR
    "message" TEXT NOT NULL,                  -- 简要日志/摘要
    -- 结构化上下文
    "attributes" JSONB NOT NULL,              -- 结构化键值，如 headers、query、body、pathParams
    "errors" JSONB NOT NULL,                  -- 错误详情（若有）
    -- 资源定位
    "repo_id" TEXT NOT NULL,                  -- 关联仓库（可选，不知道则为空字符串）
    "sha" TEXT NOT NULL,                      -- 关联提交（可选，不知道则为空字符串）
    -- 索引时间
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_request_log_pkey" PRIMARY KEY ("id")
);

-- 索引：按 request_id 快速查询一次请求的所有日志
CREATE INDEX IF NOT EXISTS "canyonjs_request_log_request_id_idx"
    ON "public"."canyonjs_request_log" ("request_id");

-- 索引：按 trace_id 关联整个链路
CREATE INDEX IF NOT EXISTS "canyonjs_request_log_trace_id_idx"
    ON "public"."canyonjs_request_log" ("trace_id");

-- 索引：按时间与服务快速筛选
CREATE INDEX IF NOT EXISTS "canyonjs_request_log_service_time_idx"
    ON "public"."canyonjs_request_log" ("service_name", "start_time");
