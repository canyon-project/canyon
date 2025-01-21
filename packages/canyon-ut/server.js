import cors from "cors";
import express from "express";
import pg from "pg";
import { decompressedData } from "canyon-map";
import axios from "axios";
import dotenv from "dotenv";
import path from "node:path";

import { fileURLToPath } from 'url';

// 获取当前模块的文件名和路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

const app = express();

app.use(cors());

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

// coverage/client

app.get("/api/coverage/summary/map", async (req, res) => {
  const projectID = req.query.projectID;
  const sha = req.query.sha;
  const r = await client.query(
    "SELECT * FROM public.ut_coverage WHERE project_id = $1 AND sha = $2",
    [projectID, sha],
  );
  res.send(await decompressedData(r.rows[0].summary));
});

app.get("/api/coverage/map", async (req, res) => {
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
});

app.get(`/api/sourcecode`, async (req, res) => {
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

});

// /api/codechange

app.get(`/api/codechange`, async (req, res) => {
  res.send({
    additions: [],
  });
});

app.listen(8080, () => {
  console.log("Server started on http://localhost:8080");
});
