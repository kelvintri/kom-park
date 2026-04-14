import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const storageRoot = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.STORAGE_PATH ?? "./storage/foto-parkir"
);

export const DUMMY_PHOTO_PATH = "dummy.svg";

export async function ensureStorageDir() {
  await mkdir(storageRoot, { recursive: true });
}

export async function saveFormFile(file: File | null) {
  await ensureStorageDir();

  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) {
    return DUMMY_PHOTO_PATH;
  }

  const extension = file.type?.includes("png") ? "png" : "jpg";
  const fileName = `${uuidv4()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(storageRoot, fileName), buffer);
  return fileName;
}

export async function readStoredFile(parts: string[]) {
  await ensureStorageDir();

  const safePath = parts.join(path.sep);
  const resolvedPath = path.resolve(storageRoot, safePath);

  if (!resolvedPath.startsWith(storageRoot)) {
    throw new Error("Akses file tidak valid");
  }

  return {
    absolutePath: resolvedPath,
    buffer: await readFile(resolvedPath)
  };
}
