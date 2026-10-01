import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { glob } from "glob";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "schemas", "server-definition.schema.json");
const SERVERS_DIR = path.join(ROOT, "servers");
const EXAMPLES_DIR = path.join(ROOT, "examples");

const PLATFORM_FIELDS = ["badges", "stats", "sponsored", "featured"];
const PLACEHOLDER = /\$\{input:([^}]+)\}/g;

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function jsonFiles(dir) {
  return glob(path.join(dir, "*.json").replace(/\\/g, "/"));
}

/** Every `${input:ID}` referenced anywhere a value can be substituted. */
function placeholderIds(transport) {
  const substitutable = [
    transport.command,
    transport.cwd,
    transport.url,
    ...(transport.args || []),
    ...Object.values(transport.env || {}),
    ...Object.values(transport.headers || {}),
  ].filter((v) => typeof v === "string");
  return substitutable.flatMap((v) => [...v.matchAll(PLACEHOLDER)].map((m) => m[1]));
}

// ---------------------------------------------------------------------------
// Examples — contributors copy these, so they must always pass validation
// ---------------------------------------------------------------------------

describe("Examples", () => {
  let validate;
  let exampleFiles;

  beforeAll(async () => {
    const schema = loadJson(SCHEMA_PATH);
    delete schema.$schema; // ajv v8 compat
    const ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    validate = ajv.compile(schema);
    exampleFiles = await jsonFiles(EXAMPLES_DIR);
  });

  it("has example files", () => {
    expect(exampleFiles.length).toBeGreaterThan(0);
  });

  it("every example validates against the schema", () => {
    const errors = [];
    for (const filePath of exampleFiles) {
      if (!validate(loadJson(filePath))) {
        const details = validate.errors.map((e) => `${e.instancePath} ${e.message}`).join(", ");
        errors.push(`${path.basename(filePath)}: ${details}`);
      }
    }
    expect(errors, "Examples must pass schema validation").toEqual([]);
  });

  it("no example sets platform-managed fields", () => {
    const offenders = [];
    for (const filePath of exampleFiles) {
      const data = loadJson(filePath);
      for (const key of Object.keys(data)) {
        if (PLATFORM_FIELDS.includes(key) || key.startsWith("_platform")) {
          offenders.push(`${path.basename(filePath)}: ${key}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every example is listed in examples/README.md", () => {
    const readme = fs.readFileSync(path.join(EXAMPLES_DIR, "README.md"), "utf-8");
    const missing = exampleFiles
      .map((f) => path.basename(f))
      .filter((name) => !readme.includes(`(./${name})`));
    expect(missing, "Add a row for each example to examples/README.md").toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Placeholders — a `${input:ID}` without a matching input is never filled in
// ---------------------------------------------------------------------------

describe("Input placeholders", () => {
  it("every ${input:ID} has a matching metadata.inputs[].id (servers and examples)", async () => {
    const files = [...(await jsonFiles(SERVERS_DIR)), ...(await jsonFiles(EXAMPLES_DIR))];
    const offenders = [];
    for (const filePath of files) {
      const { transport } = loadJson(filePath);
      const declared = new Set((transport.metadata?.inputs || []).map((i) => i.id));
      for (const id of placeholderIds(transport)) {
        if (!declared.has(id)) {
          offenders.push(`${path.relative(ROOT, filePath)}: \${input:${id}}`);
        }
      }
    }
    expect(offenders, "Declare an input for every placeholder").toEqual([]);
  });
});
