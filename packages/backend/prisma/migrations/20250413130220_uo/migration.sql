-- CreateTable
CREATE TABLE "canyonjs_coverage_map_relation" (
    "id" TEXT NOT NULL,
    "absolute_path" TEXT NOT NULL,
    "relative_path" TEXT NOT NULL,
    "hash_id" TEXT NOT NULL,

    CONSTRAINT "canyonjs_coverage_map_relation_pkey" PRIMARY KEY ("id")
);
