import test from "node:test";
import assert from "node:assert/strict";
import { isOriginAllowed, parseOrigins } from "../utils/origins.js";

test("parseOrigins trims, removes trailing slashes and de-duplicates", () => {
  const result = parseOrigins(
    "http://localhost:5173/, https://chatly.app,http://localhost:5173"
  );

  assert.deepEqual(result, ["http://localhost:5173", "https://chatly.app"]);
});

test("parseOrigins uses the fallback when the value is empty", () => {
  assert.deepEqual(parseOrigins("", ["http://localhost:5000"]), [
    "http://localhost:5000",
  ]);
  assert.deepEqual(parseOrigins(undefined, ["http://localhost:5000"]), [
    "http://localhost:5000",
  ]);
});

test("isOriginAllowed allows server-to-server requests without an origin", () => {
  assert.equal(isOriginAllowed(undefined, ["https://chatly.app"]), true);
  assert.equal(isOriginAllowed("https://chatly.app", ["https://chatly.app"]), true);
  assert.equal(isOriginAllowed("https://evil.app", ["https://chatly.app"]), false);
});
