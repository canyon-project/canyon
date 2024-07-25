-- CreateTable
CREATE TABLE "reactor_user" (
    "id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "favor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactor_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_git" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "providerRefreshToken" TEXT NOT NULL,
    "providerAccessToken" TEXT NOT NULL,
    "providerScope" TEXT NOT NULL,
    "loggedIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactor_git_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_git_provider" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "reactor_git_provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_coverage" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "build_provider" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "reporter" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "cov_type" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "branches_total" INTEGER NOT NULL,
    "branches_covered" INTEGER NOT NULL,
    "functions_total" INTEGER NOT NULL,
    "functions_covered" INTEGER NOT NULL,
    "lines_total" INTEGER NOT NULL,
    "lines_covered" INTEGER NOT NULL,
    "statements_total" INTEGER NOT NULL,
    "statements_covered" INTEGER NOT NULL,
    "newlines_total" INTEGER NOT NULL,
    "newlines_covered" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactor_coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_cov_map_test" (
    "id" TEXT NOT NULL,
    "map_json_str" TEXT NOT NULL,
    "map_json_statement_map_start_line" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "reactor_cov_map_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_cov_hit" (
    "id" TEXT NOT NULL,
    "map_json_str" TEXT NOT NULL,

    CONSTRAINT "reactor_cov_hit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bu" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "coverage" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "default_branch" TEXT NOT NULL,
    "instrument_cwd" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactor_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_codechange" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "compare_target" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "additions" INTEGER[],
    "deletions" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reactor_codechange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_filepath" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "reactor_filepath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reactor_distributedlock" (
    "lockName" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockTimestamp" TIMESTAMP(3),
    "lockExpiration" TIMESTAMP(3),

    CONSTRAINT "reactor_distributedlock_pkey" PRIMARY KEY ("lockName")
);
