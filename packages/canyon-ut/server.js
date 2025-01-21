import cors from "cors";
import express from "express";
import pg from "pg";
import { decompressedData } from "canyon-map";
import axios from "axios";
import dotenv from "dotenv";
import path from "node:path";
import history from "connect-history-api-fallback";
// const history = require('connect-history-api-fallback');

import { fileURLToPath } from 'url';
import {handleCoverage} from "./handleCoverage.js";

// 获取当前模块的文件名和路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

const app = express();

app.use(cors());
app.use(express.json());

function parseDatabaseUrl(url) {
  const match = url.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)\?schema=(.*)/);
  if (match) {
    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4]),
      database: match[5],
    };
  } else {
    throw new Error('Invalid DATABASE_URL format');
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
const config = parseDatabaseUrl(DATABASE_URL);


const { Client } = pg;
const client = new Client(config);
await client.connect();

app.use(history()); // 这里千万要注意，要在static静态资源上面
app.use(express.static("dist"));

app.get("/vi/health", (req, res) => {
  res.send("Hello World!");
});

app.post("/coverage/client", async (req, res,next) => {
  const {sha,branch,projectID,instrumentCwd} = req.body;
  const {summaryCompressed,hitCompressed} =await handleCoverage(req.body);
  try {
    const utCoverageData = {
      sha,
      branch,
      projectID,
      branchesTotal: 0,
      branchesCovered: 0,
      functionsTotal: 0,
      functionsCovered: 0,
      linesTotal: 0,
      linesCovered: 0,
      statementsTotal: 0,
      statementsCovered: 0,
      newlinesTotal: 0,
      newlinesCovered: 0,
      summary: summaryCompressed,
      hit: hitCompressed,
      sourceType: 'json',
      instrumentCwd,
    };

    const query = `
      INSERT INTO ut_coverage (
        sha,
        branch,
        project_id,
        branches_total,
        branches_covered,
        functions_total,
        functions_covered,
        lines_total,
        lines_covered,
        statements_total,
        statements_covered,
        newlines_total,
        newlines_covered,
        summary,
        hit,
        source_type,
        instrument_cwd
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING id;
    `;
    // 确保 values 数组的元素数量与列名数量匹配
    const values = [
      utCoverageData.sha,
      utCoverageData.branch,
      utCoverageData.projectID,
      utCoverageData.branchesTotal,
      utCoverageData.branchesCovered,
      utCoverageData.functionsTotal,
      utCoverageData.functionsCovered,
      utCoverageData.linesTotal,
      utCoverageData.linesCovered,
      utCoverageData.statementsTotal,
      utCoverageData.statementsCovered,
      utCoverageData.newlinesTotal,
      utCoverageData.newlinesCovered,
      utCoverageData.summary,
      utCoverageData.hit,
      utCoverageData.sourceType,
      utCoverageData.instrumentCwd
    ];

    const result = await client.query(query, values);
    console.log('Inserted UtCoverage with id:', result.rows[0].id);
  } catch (error) {
    next(error);
  }
  res.send("ok");
});


app.get("/api/coverage/summary/map", async (req, res,next) => {
  try {
    const projectID = req.query.projectID;
    const sha = req.query.sha;
    const r = await client.query(
      "SELECT * FROM public.ut_coverage WHERE project_id = $1 AND sha = $2",
      [projectID, sha],
    );
    res.send(await decompressedData(r.rows[0].summary));
  } catch (e) {
    next(e)
  }
});

app.get("/api/coverage/map", async (req, res,next) => {
  try {
    const projectID = req.query.projectID;
    const sha = req.query.sha;
    const filepath = req.query.filepath;
    const r = await client.query(
      "SELECT * FROM public.ut_coverage WHERE project_id = $1 AND sha = $2",
      [projectID, sha],
    );
    const jieya = await decompressedData(r.rows[0].hit);
    res.send({
      [filepath]: jieya[filepath],
    });
  } catch (e) {
    next(e)
  }
});

app.get(`/api/sourcecode`, async (req, res,next) => {
  try {
    const projectID = req.query.projectID;
    const sha = req.query.sha;
    const filepath = encodeURIComponent(req.query.filepath);

    const gitProviderUrl = process.env.GIT_PROVIDER_URL

    const token = process.env.GIT_PROVIDER_TOKEN



    const r =     await axios
      .get(
        `${gitProviderUrl}/api/v4/projects/${projectID}/repository/files/${filepath}`,
        {
          params: {
            ref: sha,
          },
          headers: {
            // Authorization: `Bearer ${token}`,
            "private-token": token,
          },
        },
      )
      .then(({ data }) => data)
    res.send(r);
  } catch (e) {
    next(e)
  }
});

// /api/codechange

app.get(`/api/codechange`, async (req, res) => {
  res.send({
    additions: [],
  });
});

app.get(`/api/project/:id`, async (req, res,next) => {
  try {
    const projectID = req.params.id;
    const gitProviderUrl = process.env.GIT_PROVIDER_URL

    const token = process.env.GIT_PROVIDER_TOKEN

    const r =     await axios
      .get(
        `${gitProviderUrl}/api/v4/projects/${projectID}`,
        {
          params: {},
          headers: {
            "private-token": token,
          },
        },
      )
      .then(({ data }) => data)
    res.send(r);
  } catch (e) {
    next(e)
  }
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 捕获未处理异常和未处理 Promise
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
