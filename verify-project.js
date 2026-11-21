"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

global.window = {};
require("./locales/es/project-path.js");
const project = window.PROJECT_PATH;
const workspace = fs.mkdtempSync(path.join(os.tmpdir(), "course-project-"));
const folder = path.join(workspace, project.folder);
try {
  fs.mkdirSync(folder);
  assert.equal(project.steps.length, 32);
  for (const [index, stage] of project.steps.entries()) {
    for (const [name, source] of Object.entries(stage.files)) {
      fs.writeFileSync(path.join(folder, name), source + "\n");
    }
    const [command, ...args] = stage.command.split(" ");
    const result = spawnSync(command, ["-X", "utf8", ...args], {
      cwd: folder, input: stage.input + "\n", encoding: "utf8", timeout: 10000
    });
    assert.equal(result.status, 0, "Stage " + (index + 1) + ": " + (result.error || result.stderr));
    assert.equal(result.stdout.replace(/\r\n/g, "\n").trimEnd(), stage.output, "Stage " + (index + 1));
  }
  console.log("Verified all 32 cumulative project stages.");
} finally {
  fs.rmSync(workspace, { recursive: true, force: true });
}
