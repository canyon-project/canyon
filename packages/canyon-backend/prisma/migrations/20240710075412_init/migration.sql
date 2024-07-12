-- CreateTable
CREATE TABLE "reckoning" (
    "id" TEXT NOT NULL,
    "dimType" TEXT NOT NULL,
    "mapIndex" TEXT NOT NULL,
    "branchIndex" TEXT NOT NULL,
    "hits" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "projectID" TEXT NOT NULL,

    CONSTRAINT "reckoning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_map" (
    "id" TEXT NOT NULL,
    "mapJson" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sha" TEXT NOT NULL,
    "projectID" TEXT NOT NULL,

    CONSTRAINT "file_map_pkey" PRIMARY KEY ("id")
);
