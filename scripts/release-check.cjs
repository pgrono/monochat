const fs = require("node:fs");
const pkg = require("../package.json");
const failures = [];
if (!fs.existsSync("package-lock.json")) failures.push("Generate and review package-lock.json using npm install on a connected machine.");
if (pkg.build.appId.startsWith("local.")) failures.push("Confirm the owner and replace the local application identity.");
if (!pkg.repository || !pkg.homepage || pkg.homepage.includes(".invalid") || pkg.build.deb?.maintainer?.includes(".invalid")) failures.push("Set the real public repository URL and homepage.");
if (!fs.existsSync("docs/release-approval.json")) failures.push("Record completed acceptance in docs/release-approval.json.");
else {
  const approval = JSON.parse(fs.readFileSync("docs/release-approval.json", "utf8"));
  if (approval.version !== pkg.version || !approval.commit || !approval.approvedBy || !approval.evidence) failures.push("Release approval needs version, commit, approvedBy and evidence.");
}
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log("Release metadata preflight passed. Owner review and runtime tests are still required.");
