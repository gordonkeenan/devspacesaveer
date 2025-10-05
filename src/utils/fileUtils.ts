import * as fs from 'fs';
import * as path from 'path';

export interface DirectorySize {
  path: string;
  size: number;
}

export async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0;

  try {
    const stats = await fs.promises.stat(dirPath);
    
    if (!stats.isDirectory()) {
      return stats.size;
    }

    const files = await fs.promises.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const fileStats = await fs.promises.stat(filePath);
        if (fileStats.isDirectory()) {
          totalSize += await getDirectorySize(filePath);
        } else {
          totalSize += fileStats.size;
        }
      } catch (err) {
        // Skip inaccessible files/directories
        continue;
      }
    }
  } catch (err) {
    // Skip inaccessible directories
    return 0;
  }

  return totalSize;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function findDirectories(
  startPath: string,
  targetNames: string[],
  maxDepth: number = 5,
  currentDepth: number = 0
): Promise<string[]> {
  const results: string[] = [];

  if (currentDepth > maxDepth) {
    return results;
  }

  try {
    const entries = await fs.promises.readdir(startPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(startPath, entry.name);

      if (targetNames.includes(entry.name)) {
        results.push(fullPath);
        continue;
      }

      // Don't recurse into hidden directories except for home directory scan
      if (entry.name.startsWith('.') && currentDepth > 0) {
        continue;
      }

      const subResults = await findDirectories(fullPath, targetNames, maxDepth, currentDepth + 1);
      results.push(...subResults);
    }
  } catch (err) {
    // Skip inaccessible directories
  }

  return results;
}
