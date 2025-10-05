import * as path from 'path';
import * as fs from 'fs';
import { Scanner, ScanResult, SpaceHog } from './Scanner';
import { findDirectories, getDirectorySize } from '../utils/fileUtils';

export class NodeModulesScanner extends Scanner {
  async scan(basePath: string): Promise<ScanResult> {
    const nodeModulesDirs = await findDirectories(basePath, ['node_modules'], 4);
    
    const items: SpaceHog[] = [];
    let totalSize = 0;

    for (const dir of nodeModulesDirs) {
      const size = await getDirectorySize(dir);
      items.push({ path: dir, size });
      totalSize += size;
    }

    // Sort by size descending
    items.sort((a, b) => b.size - a.size);

    const suggestions = this.generateSuggestions(items, basePath);

    return {
      type: 'node_modules',
      items,
      totalSize,
      suggestions
    };
  }

  private generateSuggestions(items: SpaceHog[], basePath: string): string[] {
    const suggestions: string[] = [];

    if (items.length === 0) {
      return suggestions;
    }

    suggestions.push(`Found ${items.length} node_modules directories`);
    
    if (items.length > 3) {
      suggestions.push('Consider using pnpm for centralized package storage (can save up to 50% disk space)');
      suggestions.push('Run "npx pnpm install -g pnpm" to install pnpm globally');
    }

    if (items.length > 1) {
      suggestions.push('Delete node_modules in unused projects and reinstall when needed');
    }

    // Check for package-lock.json or yarn.lock to suggest specific cleanup
    const hasOldProjects = items.some(item => {
      const projectDir = path.dirname(item.path);
      try {
        const packageJson = path.join(projectDir, 'package.json');
        return fs.existsSync(packageJson);
      } catch {
        return false;
      }
    });

    if (hasOldProjects) {
      suggestions.push('Run "npm prune" in project directories to remove unused dependencies');
    }

    return suggestions;
  }
}
