import test from "node:test";
import assert from "node:assert/strict";
import { safeFileName } from "../utils/files.js";

test("safeFileName keeps a readable name and lowercases the extension", () => {
  assert.equal(safeFileName("My Photo (1).PNG"), "My-Photo-1.png");
});

test("safeFileName strips path traversal attempts", () => {
  assert.equal(safeFileName("../../etc/passwd"), "passwd");
  assert.equal(safeFileName("..\\..\\windows\\system32\\cmd.exe"), "cmd.exe");
});

test("safeFileName falls back to image when the name is empty", () => {
  assert.equal(safeFileName(""), "image");
  assert.equal(safeFileName(), "image");
});

test("safeFileName limits the base name length", () => {
  const result = safeFileName(`${"a".repeat(120)}.jpg`);
  assert.equal(result.length, 44);
  assert.ok(result.endsWith(".jpg"));
});
