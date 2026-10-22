import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(root, "3.realtimeChatApp", "backend");
const frontendDir = path.join(root, "3.realtimeChatApp", "frontend");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const skipInstall = process.argv.includes("--no-install");

const log = (message) => console.log(`\x1b[36m[setup]\x1b[0m ${message}`);

function ensureEnv() {
  const envPath = path.join(backendDir, ".env");
  const examplePath = path.join(backendDir, ".env.example");

  if (fs.existsSync(envPath)) {
    log("backend/.env already exists - leaving it untouched");
    return;
  }

  let contents = fs.readFileSync(examplePath, "utf8");
  const secret = randomBytes(32).toString("hex");
  contents = contents.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`);
  fs.writeFileSync(envPath, contents);
  log("created backend/.env with a generated JWT secret");
}

function install(dir, label) {
  if (skipInstall) {
    log(`skipping install for ${label}`);
    return;
  }

  log(`installing ${label} dependencies...`);
  const result = spawnSync(npm, ["install"], {
    cwd: dir,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.error(`\x1b[31m[setup]\x1b[0m npm install failed in ${label}`);
    process.exit(result.status ?? 1);
  }
}

ensureEnv();
install(backendDir, "backend");
install(frontendDir, "frontend");

console.log(`
\x1b[32mSetup complete!\x1b[0m

Next steps:
  1. Start MongoDB (pick one):
       - Local install: mongodb://127.0.0.1:27017
       - Docker:        docker compose up -d mongo
       - Atlas:         put your connection string in 3.realtimeChatApp/backend/.env
  2. Optional: docker compose exec mongo mongosh --eval "db"   (check it is running)
  3. Seed demo users:  npm run seed
  4. Start everything: npm run dev

Frontend: http://localhost:5173
Backend:  http://localhost:5000

Demo accounts (after npm run seed):
  alice@example.com / password123
  bob@example.com   / password123
`);
