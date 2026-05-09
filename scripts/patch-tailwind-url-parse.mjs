import fs from "node:fs";
import path from "node:path";

const patches = [
  {
    filePath: path.join(
      process.cwd(),
      "node_modules/tailwindcss/src/lib/setupContextUtils.js",
    ),
    search: "let parsed = url.parse(file)",
    replace:
      "let parsed = file.startsWith('file:') || file.includes('://') ? new URL(file) : url.pathToFileURL(file)",
  },
  {
    filePath: path.join(
      process.cwd(),
      "node_modules/tailwindcss/lib/lib/setupContextUtils.js",
    ),
    search: "let parsed = _url.default.parse(file);",
    replace:
      'let parsed = file.startsWith("file:") || file.includes("://") ? new URL(file) : _url.default.pathToFileURL(file);',
  },
];

for (const patch of patches) {
  if (!fs.existsSync(patch.filePath)) continue;

  const current = fs.readFileSync(patch.filePath, "utf8");
  if (!current.includes(patch.search) || current.includes(patch.replace)) {
    continue;
  }

  fs.writeFileSync(
    patch.filePath,
    current.replace(patch.search, patch.replace),
    "utf8",
  );
}
