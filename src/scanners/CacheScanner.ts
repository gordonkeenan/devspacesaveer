import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { Scanner, ScanResult, SpaceHog } from './Scanner';
import { getDirectorySize } from '../utils/fileUtils';

export class CacheScanner extends Scanner {
  async scan(basePath: string): Promise<ScanResult> {
    const items: SpaceHog[] = [];
    let totalSize = 0;

    const homeDir = os.homedir();
    
    const cacheDirs = [
      { name: 'npm cache', path: path.join(homeDir, '.npm') },
      { name: 'yarn cache', path: path.join(homeDir, '.yarn', 'cache') },
      { name: 'yarn global', path: path.join(homeDir, '.yarn', 'global') },
      { name: 'pnpm cache', path: path.join(homeDir, '.pnpm-store') },
      { name: 'pip cache', path: path.join(homeDir, '.cache', 'pip') },
      { name: 'Homebrew cache', path: path.join(homeDir, 'Library', 'Caches', 'Homebrew') },
      { name: 'Go module cache', path: path.join(homeDir, 'go', 'pkg', 'mod') },
      { name: 'Gradle cache', path: path.join(homeDir, '.gradle', 'caches') },
      { name: 'Maven cache', path: path.join(homeDir, '.m2', 'repository') },
      { name: 'Composer cache', path: path.join(homeDir, '.composer', 'cache') },
      { name: 'RubyGems cache', path: path.join(homeDir, '.gem') }
    ];

    for (const cache of cacheDirs) {
      try {
        if (fs.existsSync(cache.path)) {
          const size = await getDirectorySize(cache.path);
          if (size > 0) {
            items.push({ path: `${cache.name}: ${cache.path}`, size });
            totalSize += size;
          }
        }
      } catch (err) {
        // Skip inaccessible caches
      }
    }

    // Sort by size descending
    items.sort((a, b) => b.size - a.size);

    const suggestions = this.generateSuggestions(items);

    return {
      type: 'caches',
      items,
      totalSize,
      suggestions
    };
  }

  private generateSuggestions(items: SpaceHog[]): string[] {
    const suggestions: string[] = [];

    if (items.length === 0) {
      return ['No package manager caches found'];
    }

    suggestions.push(`Found ${items.length} cache directories`);

    const hasNpmCache = items.some(item => item.path.includes('npm cache'));
    const hasYarnCache = items.some(item => item.path.includes('yarn cache'));
    const hasPnpmCache = items.some(item => item.path.includes('pnpm cache'));
    const hasPipCache = items.some(item => item.path.includes('pip cache'));
    const hasBrewCache = items.some(item => item.path.includes('Homebrew cache'));

    if (hasNpmCache) {
      suggestions.push('Clean npm cache: npm cache clean --force');
    }
    if (hasYarnCache) {
      suggestions.push('Clean yarn cache: yarn cache clean');
    }
    if (hasPnpmCache) {
      suggestions.push('Clean pnpm store: pnpm store prune');
    }
    if (hasPipCache) {
      suggestions.push('Clean pip cache: pip cache purge');
    }
    if (hasBrewCache) {
      suggestions.push('Clean Homebrew cache: brew cleanup');
    }

    suggestions.push('Note: Cleaning caches will require re-downloading packages on next install');

    return suggestions;
  }
}
