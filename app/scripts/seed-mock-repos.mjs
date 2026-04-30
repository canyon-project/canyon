import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const KNOWN_PROJECTS = [
  { owner: "torvalds", repo: "linux", description: "Linux kernel source tree." },
  { owner: "kubernetes", repo: "kubernetes", description: "Production-grade container orchestration system." },
  { owner: "moby", repo: "moby", description: "Moby project - open-source container framework." },
  { owner: "facebook", repo: "react", description: "A JavaScript library for building user interfaces." },
  { owner: "vuejs", repo: "vue", description: "Progressive JavaScript framework for building web UI." },
  { owner: "vercel", repo: "next.js", description: "The React framework for production web apps." },
  { owner: "nuxt", repo: "nuxt", description: "Intuitive and extensible full-stack Vue framework." },
  { owner: "angular", repo: "angular", description: "The modern web developer platform by Google." },
  { owner: "sveltejs", repo: "svelte", description: "Cybernetically enhanced web apps." },
  { owner: "solidjs", repo: "solid", description: "Simple and performant reactivity for UI." },
  { owner: "nodejs", repo: "node", description: "Node.js JavaScript runtime." },
  { owner: "denoland", repo: "deno", description: "Modern runtime for JavaScript and TypeScript." },
  { owner: "oven-sh", repo: "bun", description: "Incredibly fast JavaScript runtime and toolkit." },
  { owner: "microsoft", repo: "TypeScript", description: "TypeScript language source." },
  { owner: "microsoft", repo: "vscode", description: "Visual Studio Code editor." },
  { owner: "vitejs", repo: "vite", description: "Next generation frontend tooling." },
  { owner: "webpack", repo: "webpack", description: "A bundler for JavaScript and friends." },
  { owner: "rollup", repo: "rollup", description: "Module bundler for JavaScript." },
  { owner: "babel", repo: "babel", description: "JavaScript compiler." },
  { owner: "eslint", repo: "eslint", description: "Find and fix problems in JavaScript code." },
  { owner: "prettier", repo: "prettier", description: "Opinionated code formatter." },
  { owner: "jestjs", repo: "jest", description: "Delightful JavaScript testing framework." },
  { owner: "vitest-dev", repo: "vitest", description: "Blazing fast unit test framework powered by Vite." },
  { owner: "microsoft", repo: "playwright", description: "Reliable end-to-end testing for modern web apps." },
  { owner: "cypress-io", repo: "cypress", description: "Fast, easy and reliable browser testing." },
  { owner: "puppeteer", repo: "puppeteer", description: "Headless Chrome Node.js API." },
  { owner: "expressjs", repo: "express", description: "Fast, unopinionated, minimalist web framework." },
  { owner: "fastify", repo: "fastify", description: "Fast and low overhead web framework for Node.js." },
  { owner: "koajs", repo: "koa", description: "Expressive middleware for Node.js." },
  { owner: "nestjs", repo: "nest", description: "Progressive Node.js framework for server-side apps." },
  { owner: "honojs", repo: "hono", description: "Ultrafast web framework for edge and server." },
  { owner: "prisma", repo: "prisma", description: "Next-generation ORM for Node.js and TypeScript." },
  { owner: "drizzle-team", repo: "drizzle-orm", description: "TypeScript ORM designed for SQL databases." },
  { owner: "postgres", repo: "postgres", description: "PostgreSQL source code." },
  { owner: "mysql", repo: "mysql-server", description: "MySQL server source tree." },
  { owner: "redis", repo: "redis", description: "In-memory data structure store and cache." },
  { owner: "mongodb", repo: "mongo", description: "MongoDB server source." },
  { owner: "apache", repo: "kafka", description: "Distributed event streaming platform." },
  { owner: "rabbitmq", repo: "rabbitmq-server", description: "RabbitMQ message broker." },
  { owner: "nginx", repo: "nginx", description: "High performance HTTP and reverse proxy server." },
  { owner: "apache", repo: "httpd", description: "Apache HTTP Server Project." },
  { owner: "traefik", repo: "traefik", description: "Cloud native reverse proxy and load balancer." },
  { owner: "prometheus", repo: "prometheus", description: "Monitoring system and time series database." },
  { owner: "grafana", repo: "grafana", description: "Visualization and observability platform." },
  { owner: "grafana", repo: "loki", description: "Horizontally scalable log aggregation system." },
  { owner: "jaegertracing", repo: "jaeger", description: "Distributed tracing system." },
  { owner: "open-telemetry", repo: "opentelemetry-collector", description: "OpenTelemetry Collector for telemetry pipelines." },
  { owner: "hashicorp", repo: "terraform", description: "Infrastructure as code provisioning tool." },
  { owner: "ansible", repo: "ansible", description: "Automation platform for configuration management." },
  { owner: "helm", repo: "helm", description: "Kubernetes package manager." },
  { owner: "argoproj", repo: "argo-cd", description: "Declarative GitOps continuous delivery for Kubernetes." },
  { owner: "fluxcd", repo: "flux2", description: "GitOps toolkit for Kubernetes." },
  { owner: "istio", repo: "istio", description: "Service mesh for microservices." },
  { owner: "envoyproxy", repo: "envoy", description: "Cloud-native high-performance proxy." },
  { owner: "linkerd", repo: "linkerd2", description: "Ultralight service mesh for Kubernetes." },
  { owner: "openfaas", repo: "faas", description: "Serverless functions platform for containers." },
  { owner: "supabase", repo: "supabase", description: "Open source Firebase alternative." },
  { owner: "appwrite", repo: "appwrite", description: "Backend server for web, mobile and flutter developers." },
  { owner: "strapi", repo: "strapi", description: "Open-source headless CMS." },
  { owner: "TryGhost", repo: "Ghost", description: "Professional publishing platform." },
  { owner: "WordPress", repo: "wordpress-develop", description: "WordPress core development repository." },
  { owner: "drupal", repo: "drupal", description: "Drupal content management framework." },
  { owner: "magento", repo: "magento2", description: "Magento Open Source eCommerce platform." },
  { owner: "discourse", repo: "discourse", description: "Civilized discussion platform." },
  { owner: "home-assistant", repo: "core", description: "Open source home automation platform." },
  { owner: "metabase", repo: "metabase", description: "Open source business intelligence and analytics." },
  { owner: "airbytehq", repo: "airbyte", description: "Data integration platform for ELT pipelines." },
  { owner: "apache", repo: "airflow", description: "Programmatically author, schedule and monitor workflows." },
  { owner: "dbt-labs", repo: "dbt-core", description: "Data build tool core framework." },
  { owner: "duckdb", repo: "duckdb", description: "In-process SQL OLAP database management system." },
  { owner: "apache", repo: "spark", description: "Unified engine for large-scale data analytics." },
  { owner: "apache", repo: "flink", description: "Stream and batch data processing framework." },
  { owner: "apache", repo: "beam", description: "Unified model for defining data processing pipelines." },
  { owner: "jupyter", repo: "notebook", description: "Jupyter interactive computing notebook." },
  { owner: "tensorflow", repo: "tensorflow", description: "End-to-end machine learning platform." },
  { owner: "pytorch", repo: "pytorch", description: "Tensors and dynamic neural networks in Python." },
  { owner: "huggingface", repo: "transformers", description: "State-of-the-art machine learning for JAX, PyTorch and TensorFlow." },
  { owner: "langchain-ai", repo: "langchain", description: "Building applications with LLMs through composability." },
  { owner: "milvus-io", repo: "milvus", description: "High-performance vector database for AI applications." },
  { owner: "weaviate", repo: "weaviate", description: "Open-source vector search engine." },
  { owner: "qdrant", repo: "qdrant", description: "Vector database and search engine for next-gen AI." },
  { owner: "elastic", repo: "elasticsearch", description: "Distributed search and analytics engine." },
  { owner: "opensearch-project", repo: "OpenSearch", description: "Open source distributed search and analytics suite." },
  { owner: "ClickHouse", repo: "ClickHouse", description: "Open-source column-oriented DBMS for OLAP." },
  { owner: "timescale", repo: "timescaledb", description: "Time-series SQL database built on PostgreSQL." },
  { owner: "apache", repo: "cassandra", description: "Highly scalable distributed database." },
  { owner: "neo4j", repo: "neo4j", description: "Graph database management system." },
  { owner: "keycloak", repo: "keycloak", description: "Open source identity and access management." },
  { owner: "ory", repo: "kratos", description: "Identity and user management system." },
  { owner: "ory", repo: "hydra", description: "OAuth2 and OpenID Connect server." },
  { owner: "n8n-io", repo: "n8n", description: "Workflow automation platform." },
  { owner: "temporalio", repo: "temporal", description: "Durable execution platform for applications." },
  { owner: "hasura", repo: "graphql-engine", description: "Instant GraphQL APIs on your data." },
  { owner: "remix-run", repo: "remix", description: "Full stack web framework focused on web fundamentals." },
  { owner: "withastro", repo: "astro", description: "The web framework for content-driven websites." },
  { owner: "storybookjs", repo: "storybook", description: "Build UI components and pages in isolation." },
  { owner: "tailwindlabs", repo: "tailwindcss", description: "A utility-first CSS framework for rapid UI development." },
  { owner: "shadcn-ui", repo: "ui", description: "Beautifully designed components built with Radix and Tailwind." },
  { owner: "ant-design", repo: "ant-design", description: "Enterprise-class UI design language and React components." },
  { owner: "chakra-ui", repo: "chakra-ui", description: "Simple, modular and accessible component library." },
];

const REPO_COUNT = KNOWN_PROJECTS.length;
const CHUNK_SIZE = 50;

function pickProvider(index) {
  return index % 2 === 0 ? "gitlab" : "github";
}

function pickCreator(index, userIds) {
  if (userIds.length === 0) {
    return "mock-user-001";
  }
  return userIds[index % userIds.length];
}

function buildRepo(index, creator) {
  const project = KNOWN_PROJECTS[index];
  const provider = pickProvider(index);
  const numericRepoId = 500000 + index + 1;
  const repoID = String(numericRepoId);
  return {
    id: `${provider}-${repoID}`,
    repoID,
    provider,
    pathWithNamespace: `${project.owner}/${project.repo}`,
    description: project.description,
    config: "",
    creator,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true },
    where: { id: { startsWith: "mock-user-" } },
    orderBy: { id: "asc" },
  });
  const userIds = users.map((u) => u.id);

  let inserted = 0;
  for (let start = 0; start < REPO_COUNT; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE, REPO_COUNT);
    const batch = [];
    for (let i = start; i < end; i += 1) {
      batch.push(buildRepo(i, pickCreator(i, userIds)));
    }
    const result = await prisma.repo.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
  }

  console.log(`Repos done. requested=${REPO_COUNT}, inserted=${inserted}`);
}

main()
  .catch((error) => {
    console.error("seed repos failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
