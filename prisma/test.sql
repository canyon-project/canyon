CREATE TABLE "canyon_v3_coverage" (
                                    "id" TEXT PRIMARY KEY,
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
                                    "statements_total" INTEGER NOT NULL,
                                    "statements_covered" INTEGER NOT NULL,
                                    "summary" BYTEA NOT NULL,
                                    "hit" BYTEA NOT NULL,
                                    "map" BYTEA NOT NULL,
                                    "instrument_cwd" TEXT NOT NULL,
                                    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
                                    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "sys_setting" (
                             "id" TEXT PRIMARY KEY,
                             "key" TEXT NOT NULL,
                             "value" TEXT NOT NULL
);

CREATE TABLE "git_provider" (
                              "id" TEXT PRIMARY KEY,
                              "url" TEXT NOT NULL,
                              "type" TEXT NOT NULL,
                              "name" TEXT NOT NULL,
                              "disabled" BOOLEAN NOT NULL,
                              "private_token" TEXT NOT NULL
);

CREATE TABLE "canyon_v3_distributedlock" (
                                           "lock_name" TEXT PRIMARY KEY,
                                           "is_locked" BOOLEAN NOT NULL DEFAULT FALSE,
                                           "lock_timestamp" TIMESTAMP,
                                           "lock_expiration" TIMESTAMP
);

CREATE TABLE "project" (
                         "id" TEXT PRIMARY KEY,
                         "name" TEXT NOT NULL,
                         "path_with_namespace" TEXT NOT NULL,
                         "description" TEXT NOT NULL,
                         "bu" TEXT NOT NULL,
                         "tags" JSON NOT NULL,
                         "members" JSON NOT NULL,
                         "coverage" TEXT NOT NULL,
                         "language" TEXT NOT NULL,
                         "default_branch" TEXT NOT NULL,
                         "instrument_cwd" TEXT NOT NULL,
                         "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);
