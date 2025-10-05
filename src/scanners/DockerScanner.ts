import { exec } from 'child_process';
import { promisify } from 'util';
import { Scanner, ScanResult, SpaceHog } from './Scanner';

const execAsync = promisify(exec);

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
}

export class DockerScanner extends Scanner {
  async scan(basePath: string): Promise<ScanResult> {
    const items: SpaceHog[] = [];
    let totalSize = 0;

    try {
      // Check if Docker is available
      await execAsync('docker --version');

      // Get Docker images with size
      const { stdout } = await execAsync(
        'docker images --format "{{.ID}}|{{.Repository}}|{{.Tag}}|{{.Size}}"'
      );

      const lines = stdout.trim().split('\n').filter(line => line);

      for (const line of lines) {
        const [id, repository, tag, sizeStr] = line.split('|');
        const size = this.parseSizeString(sizeStr);
        
        items.push({
          path: `${repository}:${tag} (${id.substring(0, 12)})`,
          size
        });
        totalSize += size;
      }

      // Sort by size descending
      items.sort((a, b) => b.size - a.size);
    } catch (err) {
      // Docker not available or no images
    }

    const suggestions = this.generateSuggestions(items);

    return {
      type: 'docker_images',
      items,
      totalSize,
      suggestions
    };
  }

  private parseSizeString(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*([A-Z]+)$/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2];

    const multipliers: { [key: string]: number } = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
      'TB': 1024 * 1024 * 1024 * 1024
    };

    return value * (multipliers[unit] || 1);
  }

  private generateSuggestions(items: SpaceHog[]): string[] {
    const suggestions: string[] = [];

    if (items.length === 0) {
      return ['No Docker images found'];
    }

    suggestions.push(`Found ${items.length} Docker images`);
    suggestions.push('Remove unused images: docker image prune -a');
    suggestions.push('Remove dangling images: docker image prune');
    suggestions.push('Remove stopped containers: docker container prune');
    suggestions.push('Clean build cache: docker builder prune');

    if (items.length > 10) {
      suggestions.push('Consider using multi-stage builds to reduce image sizes');
    }

    return suggestions;
  }
}
