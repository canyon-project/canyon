-- CreateTable
CREATE TABLE "public"."canyonjs3_user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs3_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs3_repo" (
    "id" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "config" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs3_repo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs3_coverage" (
    "id" TEXT NOT NULL,
    "version_id" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branches" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "builds" JSONB NOT NULL,
    "build_target" TEXT NOT NULL,
    "repo_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_provider" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canyonjs3_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs3_coverage_map_relation" (
     "id" TEXT NOT NULL,
     "version_id" TEXT NOT NULL,
     "full_file_path" TEXT NOT NULL,
     "file_path" TEXT NOT NULL,
     "restore_full_file_path" TEXT NOT NULL,
     "coverage_map_hash_id" TEXT NOT NULL,
     "source_map_hash_id" TEXT NOT NULL,

     CONSTRAINT "canyonjs3_coverage_map_relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."canyonjs3_coverage_source_map" (
    "hash" TEXT NOT NULL,
    "source_map" BYTEA NOT NULL,

    CONSTRAINT "canyonjs3_coverage_source_map_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "public"."canyonjs3_diff" (
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

    CONSTRAINT "canyonjs3_diff_pkey" PRIMARY KEY ("id")
);
