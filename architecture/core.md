# Canyon Coverage Data Asynchronous SourceMap Restoration Design

## Background

When using Canyon to collect frontend coverage data, restoring the original `coverageMap` with the corresponding `sourceMap` is computationally expensive. When a single commit contains a large number of files (e.g., 1000+), performing this restoration during query time on low-spec machines causes severe performance bottlenecks.

## Goals

- **Improve coverage query performance**  
- **Reduce the load during data insertion**  
- **Maintain integrity of the original coverage data**  
- **Enable asynchronous decoupled processing, compatible with low-resource environments**

## Core Idea

Move the restoration process of `coverageMap` + `sourceMap` from the **query phase** to an **asynchronous post-insert phase**. A background worker handles the restoration and persists the result. Queries then directly use the preprocessed structured data.

---

## Insert Phase Logic (Client or Server Side)

1. Receive incoming `coverageMap` and optional `sourceMap` data from the frontend;
2. Insert the raw data into a database (e.g., Postgres or ClickHouse);
3. If async restoration is enabled in configuration, enqueue a message to a **message queue** (e.g., local file queue, Redis, Kafka, etc.);