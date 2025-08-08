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
    "scopes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs_coverage" (
    "id" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_provider" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "scope_id" TEXT NOT NULL,
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
    "coverage_id" TEXT NOT NULL,
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
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs_diff_pkey" PRIMARY KEY ("id")
);