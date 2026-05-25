const { execSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

function run(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const commitHash = process.env.COMMIT_REF || run("git rev-parse HEAD") || "unknown";
const shortCommitHash = commitHash === "unknown" ? "unknown" : commitHash.slice(0, 7);
const commitTimestamp = process.env.COMMIT_TIMESTAMP || run("git log -1 --format=%cI") || new Date().toISOString();
const branch = process.env.BRANCH || run("git rev-parse --abbrev-ref HEAD") || "unknown";
const deployId = process.env.DEPLOY_ID || "local";
const buildTimestamp = new Date().toISOString();

const content = `export const buildInfo = ${JSON.stringify(
  {
    commitHash,
    shortCommitHash,
    commitTimestamp,
    branch,
    deployId,
    buildTimestamp,
    githubRepo: "ae95caba/dulce-tentacion-admin",
  },
  null,
  2
)} as const;\n`;

writeFileSync(resolve(__dirname, "../src/buildInfo.ts"), content);
