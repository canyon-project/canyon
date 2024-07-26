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
    "favor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Git" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "providerRefreshToken" TEXT NOT NULL,
    "providerAccessToken" TEXT NOT NULL,
    "providerScope" TEXT NOT NULL,
    "loggedIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Git_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitProvider" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL,

    CONSTRAINT "GitProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coverage" (
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
    "relation_id" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "tag" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coverage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coveragedata" (
    "id" TEXT NOT NULL,
    "compresseddata" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coveragedata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
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

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "filepath" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "filepath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributedlock" (
    "lockName" TEXT NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockTimestamp" TIMESTAMP(3),
    "lockExpiration" TIMESTAMP(3),

    CONSTRAINT "distributedlock_pkey" PRIMARY KEY ("lockName")
);
