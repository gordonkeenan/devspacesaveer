export interface ScanResult {
  type: string;
  items: SpaceHog[];
  totalSize: number;
  suggestions: string[];
}

export interface SpaceHog {
  path: string;
  size: number;
}

export abstract class Scanner {
  abstract scan(basePath: string): Promise<ScanResult>;
}
