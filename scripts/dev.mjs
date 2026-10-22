import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backendDir = path.join(root, "3.realtimeChatApp", "backend");
const frontendDir = path.join(root, "3.realtimeChatApp", "frontend");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const missing = [backendDir, frontendDir].filter(
  (dir) => !fs.existsSync(path.join(dir, "node_modules"))
);

if (missing.length > 0) {
  console.error(
    "\x1b[31m[dev]\x1b[0m Dependencies are missing. Run `npm run setup` first."
  );
  process.exit(1);
}

const colors = { backend: "\x1b[35m", frontend: "\x1b[36m", reset: "\x1b[0m" };
const children = [];
let shuttingDown = false;

function start(name, cwd, args) {
  const child = spawn(npm, args, {
    cwd,
    shell: process.platform === "win32",
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  const prefix = `${colors[name]}[${name}]${colors.reset} `;
  const pipe = (stream, target) => {
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      for (const line of text.split(/\r?\n/)) {
        if (line.trim()) target.write(prefix + line + "\n");
      }
    });
  };

  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);

  child.on("exit", (code) => {
    if (shuttingDown) return;
    console.log(`${prefix}exited with code ${code ?? 0}`);
    shutdown(code ?? 0);
  });

  children.push(child);
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.pid) continue;
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(code), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("\x1b[32m[dev]\x1b[0m starting backend and frontend...\n");
start("backend", backendDir, ["run", "dev"]);
start("frontend", frontendDir, ["run", "dev"]);

console.log(`
  Frontend: \x1b[36mhttp://localhost:5173\x1b[0m
  Backend:  \x1b[36mhttp://localhost:5000\x1b[0m
  Press Ctrl+C to stop both.
`);
