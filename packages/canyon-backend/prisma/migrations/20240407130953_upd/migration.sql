-- CreateTable
CREATE TABLE "user_0407" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_0407_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage_0407" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "cov_type" TEXT NOT NULL,
    "cov_origin" TEXT NOT NULL,
    "relation_id" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "tag" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coverage_0407_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coveragedata_0407" (
    "id" TEXT NOT NULL,
    "compresseddata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coveragedata_0407_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_0407" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_0407_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codechange_0407" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha_0407" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codechange_0407_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributedlock_0407" (
    "lockName" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockTimestamp" TIMESTAMP(3),
    "lockExpiration" TIMESTAMP(3),

    CONSTRAINT "distributedlock_0407_pkey" PRIMARY KEY ("lockName")
);
