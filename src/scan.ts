import { loadRepo } from "./fs-repo.ts";
import { scanRepo, type ScanOptions, type ScanResult } from "./engine.ts";

export { counts, failsAt, scanRepo, type ScanOptions, type ScanResult } from "./engine.ts";
export { isDirectory } from "./fs-repo.ts";

/** Scans a folder on disk. */
export function scan(root: string, options: ScanOptions = {}): ScanResult {
  return scanRepo(loadRepo(root), options);
}
