-- CreateTable
CREATE TABLE "build_provider" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL,

    CONSTRAINT "build_provider_pkey" PRIMARY KEY ("id")
);
