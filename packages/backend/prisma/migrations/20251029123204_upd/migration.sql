-- CreateTable
CREATE TABLE "repo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path_with_namespace" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "org" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "members" JSONB NOT NULL,
    "config" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repo_pkey" PRIMARY KEY ("id")
);
