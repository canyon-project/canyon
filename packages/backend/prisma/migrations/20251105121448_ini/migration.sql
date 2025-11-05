-- CreateTable
CREATE TABLE "canyon_infra_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "createdOn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedOn" TIMESTAMPTZ(3) NOT NULL,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedEnvFileValue" TEXT,

    CONSTRAINT "canyon_infra_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canyon_infra_config_name_key" ON "canyon_infra_config"("name");
