import { spawn } from "node:child_process";
import { createConnection } from "node:net";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import EmbeddedPostgres from "embedded-postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pgDir = join(root, ".pgdata");

const DATABASE_URL =
  "postgres://postgres:password@localhost:5432/nexaops_db";

const baseEnv = {
  DATABASE_URL,
  REDIS_HOST: "localhost",
  REDIS_PORT: "6379",
  JWT_SECRET: "super-secret-key-for-dev",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "super_secret_next_auth_key",
  NEXT_PUBLIC_API_URL: "http://localhost:4000",
};

async function isPortOpen(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host });
    socket.setTimeout(2000);
    socket.on("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function getRedisMajorVersion(host, port) {
  const candidates = [
    ["redis-cli", "-h", host, "-p", String(port)],
    [
      "C:\\Program Files\\Redis\\redis-cli.exe",
      "-h",
      host,
      "-p",
      String(port),
    ],
  ];

  for (const args of candidates) {
    const version = await new Promise((resolve) => {
      const proc = spawn(args[0], [...args.slice(1), "INFO", "server"], {
        shell: true,
        stdio: ["ignore", "pipe", "ignore"],
      });
      let out = "";
      proc.stdout.on("data", (chunk) => {
        out += chunk;
      });
      proc.on("close", () => {
        const match = out.match(/redis_version:(\d+)/);
        resolve(match ? Number.parseInt(match[1], 10) : 0);
      });
      proc.on("error", () => resolve(0));
    });
    if (version > 0) return version;
  }
  return 0;
}

async function isDockerAvailable() {
  return new Promise((resolve) => {
    const proc = spawn("docker", ["info"], {
      shell: true,
      stdio: "ignore",
    });
    proc.on("close", (code) => resolve(code === 0));
    proc.on("error", () => resolve(false));
  });
}

async function startDockerRedis(containerName, hostPort) {
  const running = await new Promise((resolve) => {
    const proc = spawn("docker", ["inspect", "-f", "{{.State.Running}}", containerName], {
      shell: true,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let out = "";
    proc.stdout.on("data", (chunk) => {
      out += chunk;
    });
    proc.on("close", () => resolve(out.trim() === "true"));
    proc.on("error", () => resolve(false));
  });

  if (!running) {
    const exists = await new Promise((resolve) => {
      const proc = spawn("docker", ["inspect", containerName], {
        shell: true,
        stdio: "ignore",
      });
      proc.on("close", (code) => resolve(code === 0));
      proc.on("error", () => resolve(false));
    });

    await new Promise((resolve, reject) => {
      const cmd = exists
        ? ["start", containerName]
        : [
            "run",
            "-d",
            "--name",
            containerName,
            "-p",
            `${hostPort}:6379`,
            "redis:7-alpine",
          ];
      const proc = spawn("docker", cmd, { shell: true, stdio: "inherit" });
      proc.on("close", (code) =>
        code === 0 ? resolve() : reject(new Error("docker redis failed")),
      );
      proc.on("error", reject);
    });
  }

  for (let attempt = 0; attempt < 20; attempt++) {
    if (await isPortOpen(hostPort)) {
      const major = await getRedisMajorVersion("127.0.0.1", hostPort);
      if (major >= 5) return major;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return 0;
}

async function ensureRedis() {
  const localPort = 6379;
  const dockerPort = 6380;
  const containerName = "nexaops-redis-dev";

  if (await isPortOpen(localPort)) {
    const major = await getRedisMajorVersion("127.0.0.1", localPort);
    if (major >= 5) {
      console.log(`Redis ${major}.x on :6379 — BullMQ email queue enabled.`);
      return {
        ...baseEnv,
        REDIS_HOST: "localhost",
        REDIS_PORT: "6379",
        NOTIFICATIONS_QUEUE_ENABLED: "true",
      };
    }

    console.log(
      `Redis ${major || "unknown"} on :6379 is too old for BullMQ (needs 5+).`,
    );
  } else {
    console.log("No Redis on :6379.");
  }

  if (await isDockerAvailable()) {
    try {
      console.log(
        `Starting Redis 7 in Docker on localhost:${dockerPort} for BullMQ...`,
      );
      const major = await startDockerRedis(containerName, dockerPort);
      if (major >= 5) {
        console.log(
          `Docker Redis ${major}.x ready on :${dockerPort} — BullMQ email queue enabled.`,
        );
        return {
          ...baseEnv,
          REDIS_HOST: "localhost",
          REDIS_PORT: String(dockerPort),
          NOTIFICATIONS_QUEUE_ENABLED: "true",
        };
      }
    } catch (err) {
      console.log(`Could not start Docker Redis: ${err.message}`);
    }
  } else {
    console.log("Docker not available — cannot auto-start Redis 7.");
  }

  console.log(
    "Email notifications will run inline (no BullMQ queue).\n" +
      "  Manual fix: run `docker compose up redis -d` or upgrade local Redis to 5+.",
  );
  return { ...baseEnv, NOTIFICATIONS_QUEUE_ENABLED: "false" };
}

async function pushSchema(env) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", ["db:push"], {
      cwd: join(root, "packages", "database"),
      env,
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error("db:push failed")),
    );
  });
}

async function main() {
  const env = { ...process.env, ...(await ensureRedis()) };

  console.log("Starting embedded PostgreSQL (no Docker)...");
  const pg = new EmbeddedPostgres({
    databaseDir: pgDir,
    user: "postgres",
    password: "password",
    port: 5432,
    persistent: true,
  });

  if (!existsSync(pgDir)) {
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("nexaops_db");
    await pg.stop();
  }

  await pg.start();
  console.log("PostgreSQL ready on localhost:5432");

  console.log("Pushing database schema...");
  await pushSchema(env);

  console.log("Starting API + Web (pnpm dev)...");
  console.log("  Web:  http://localhost:3000");
  console.log("  API:  http://localhost:4000");
  console.log("  Docs: http://localhost:4000/api/docs");
  console.log("\nPress Ctrl+C to stop.\n");

  const dev = spawn("pnpm", ["dev"], {
    cwd: root,
    env,
    stdio: "inherit",
    shell: true,
  });

  const shutdown = async () => {
    dev.kill("SIGINT");
    await pg.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  dev.on("exit", async (code) => {
    await pg.stop();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
