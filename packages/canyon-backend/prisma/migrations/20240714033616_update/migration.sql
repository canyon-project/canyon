-- CreateTable
CREATE TABLE "CovMapTest" (
    "id" TEXT NOT NULL,
    "map_json_str" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "CovMapTest_pkey" PRIMARY KEY ("id")
);
