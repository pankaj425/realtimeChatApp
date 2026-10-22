import path from "node:path";

export const safeFileName = (originalName = "image") => {
  const normalized = String(originalName || "image").replace(/\\/g, "/");
  const rawExt = path.posix.extname(normalized);
  const ext = rawExt.toLowerCase().slice(0, 10);
  const base = path.posix
    .basename(normalized, rawExt)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  return `${base || "image"}${ext}`;
};
