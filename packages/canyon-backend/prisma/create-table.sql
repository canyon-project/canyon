-- CreateTable
CREATE TABLE "user" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage" (
    "id" TEXT NOT NULL,
    "key" TEXT,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "instrument_cwd" TEXT,
    "reporter" INTEGER NOT NULL,
    "report_id" TEXT NOT NULL,
    "cov_type" TEXT NOT NULL,
    "relation_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumer" INTEGER NOT NULL,
    "children" TEXT[],
    "tags" JSONB[],

    CONSTRAINT "coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summary" (
    "id" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "covered" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "metric_type" TEXT NOT NULL,
    "cov_type" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codechange" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codechange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributedlock" (
    "lockName" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockTimestamp" TIMESTAMP(3),
    "lockExpiration" TIMESTAMP(3),

    CONSTRAINT "distributedlock_pkey" PRIMARY KEY ("lockName")
);
