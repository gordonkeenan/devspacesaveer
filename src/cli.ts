#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as os from 'os';
import { NodeModulesScanner } from './scanners/NodeModulesScanner';
import { BuildArtifactsScanner } from './scanners/BuildArtifactsScanner';
import { DockerScanner } from './scanners/DockerScanner';
import { CacheScanner } from './scanners/CacheScanner';
import { formatBytes } from './utils/fileUtils';
import { ScanResult, Scanner } from './scanners/Scanner';

const program = new Command();

program
  .name('devspacesaveer')
  .description('Scan your machine for space hogs and get cleanup suggestions')
  .version('1.0.0')
  .option('-p, --path <path>', 'Path to scan (default: home directory)', os.homedir())
  .option('--no-docker', 'Skip Docker images scan')
  .option('--no-cache', 'Skip cache directories scan')
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(chalk.bold.cyan('\n🔍 DevSpaceSaveer - Scanning for space hogs...\n'));

  const scanPath = options.path;
  console.log(chalk.gray(`Scanning path: ${scanPath}\n`));

  const results: ScanResult[] = [];
  
  // Run all scanners
  const scanners: Array<{ name: string; scanner: Scanner }> = [
    { name: 'Node Modules', scanner: new NodeModulesScanner() },
    { name: 'Build Artifacts', scanner: new BuildArtifactsScanner() },
  ];

  if (options.docker !== false) {
    scanners.push({ name: 'Docker Images', scanner: new DockerScanner() });
  }

  if (options.cache !== false) {
    scanners.push({ name: 'Caches', scanner: new CacheScanner() });
  }

  for (const { name, scanner } of scanners) {
    process.stdout.write(chalk.yellow(`Scanning ${name}... `));
    try {
      const result = await scanner.scan(scanPath);
      results.push(result);
      console.log(chalk.green('✓'));
    } catch (err) {
      console.log(chalk.red('✗'));
      console.error(chalk.red(`Error: ${err}`));
    }
  }

  // Display results
  console.log(chalk.bold.cyan('\n📊 Results:\n'));
  
  let grandTotal = 0;
  
  for (const result of results) {
    if (result.items.length === 0 && result.totalSize === 0) {
      continue;
    }

    console.log(chalk.bold.yellow(`\n${result.type.toUpperCase().replace(/_/g, ' ')}:`));
    console.log(chalk.gray('─'.repeat(50)));
    
    grandTotal += result.totalSize;
    
    console.log(chalk.white(`Total Size: ${chalk.bold.green(formatBytes(result.totalSize))}`));
    console.log(chalk.white(`Items Found: ${result.items.length}`));
    
    if (result.items.length > 0) {
      console.log(chalk.white('\nTop Space Hogs:'));
      const topItems = result.items.slice(0, 5);
      for (const item of topItems) {
        console.log(chalk.gray(`  • ${formatBytes(item.size).padEnd(12)} ${item.path}`));
      }
      
      if (result.items.length > 5) {
        console.log(chalk.gray(`  ... and ${result.items.length - 5} more`));
      }
    }
    
    if (result.suggestions.length > 0) {
      console.log(chalk.white('\n💡 Suggestions:'));
      for (const suggestion of result.suggestions) {
        console.log(chalk.cyan(`  → ${suggestion}`));
      }
    }
  }

  console.log(chalk.bold.cyan('\n' + '═'.repeat(50)));
  console.log(chalk.bold.white(`Total Reclaimable Space: ${chalk.bold.green(formatBytes(grandTotal))}`));
  console.log(chalk.bold.cyan('═'.repeat(50) + '\n'));

  console.log(chalk.yellow('⚠️  Warning: Always review before deleting. Some caches improve performance.\n'));
}

main().catch((err) => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
