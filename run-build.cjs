#!/usr/bin/env node
/**
 * Run build steps in sequence (cross-platform). Exits on first failure.
 * Used so package.json build script works in cmd and PowerShell.
 */
const { execSync } = require("child_process");
const commands = [
  "pnpm clean",
  "pnpm exec tsc",
  "pnpm exec rollup -c",
];
for (const cmd of commands) {
  execSync(cmd, { stdio: "inherit", shell: true });
}
