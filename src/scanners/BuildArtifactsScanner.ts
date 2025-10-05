import { Scanner, ScanResult, SpaceHog } from './Scanner';
import { findDirectories, getDirectorySize } from '../utils/fileUtils';

export class BuildArtifactsScanner extends Scanner {
  private readonly BUILD_DIRS = [
    'dist',
    'build',
    '.next',
    'out',
    'target',
    '.gradle',
    'bin',
    'obj',
    '.nuxt',
    '.output',
    '.vercel',
    '.turbo'
  ];

  async scan(basePath: string): Promise<ScanResult> {
    const buildDirs = await findDirectories(basePath, this.BUILD_DIRS, 4);
    
    const items: SpaceHog[] = [];
    let totalSize = 0;

    for (const dir of buildDirs) {
      const size = await getDirectorySize(dir);
      items.push({ path: dir, size });
      totalSize += size;
    }

    // Sort by size descending
    items.sort((a, b) => b.size - a.size);

    const suggestions = this.generateSuggestions(items);

    return {
      type: 'build_artifacts',
      items,
      totalSize,
      suggestions
    };
  }

  private generateSuggestions(items: SpaceHog[]): string[] {
    const suggestions: string[] = [];

    if (items.length === 0) {
      return suggestions;
    }

    suggestions.push(`Found ${items.length} build artifact directories`);
    suggestions.push('Build artifacts can be safely deleted and regenerated when needed');
    suggestions.push('Add build directories to .gitignore to prevent committing them');
    
    if (items.length > 5) {
      suggestions.push('Consider using a build cache or CI/CD system for production builds');
    }

    return suggestions;
  }
}
