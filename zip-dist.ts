// zip-dist.ts
// Zips the contents of the dist directory into dist.zip in the project root
import { join } from "node:path";
import { spawn } from "node:child_process";

const zipFile = join(process.cwd(), "metric-mcmaster.zip");
const distDir = join(process.cwd(), "dist");

async function zipDist() {
  // Only zip the contents of dist/, not the whole project
  // This will create dist.zip in the project root with the contents of dist/ at the root of the zip
  return new Promise<void>((resolve, reject) => {
    const zip = spawn("zip", ["-r", zipFile, "."], { cwd: distDir });
    zip.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`zip process exited with code ${code}`));
    });
    zip.on("error", reject);
  });
}

zipDist().catch((err) => {
  console.error("Failed to zip dist:", err);
  process.exit(1);
});
