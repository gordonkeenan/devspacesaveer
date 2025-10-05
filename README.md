# devspacesaveer

A CLI utility that scans your developer machine for common space hogs (node_modules, build artifacts, Docker images, caches, etc.), estimates reclaimable space, and provides actionable cleanup suggestions.

## Features

- 🔍 Scans for common space-consuming directories:
  - `node_modules` directories
  - Build artifacts (dist, build, .next, target, etc.)
  - Docker images
  - Package manager caches (npm, yarn, pnpm, pip, etc.)
- 📊 Estimates total reclaimable space
- 💡 Provides actionable cleanup and optimization suggestions
- ⚡ Fast and lightweight

## Installation

```bash
# Install globally
npm install -g devspacesaveer

# Or use directly with npx
npx devspacesaveer
```

## Usage

```bash
# Scan your home directory (default)
devspacesaveer

# Scan a specific directory
devspacesaveer --path /path/to/scan

# Skip Docker scan
devspacesaveer --no-docker

# Skip cache scan
devspacesaveer --no-cache

# Show help
devspacesaveer --help
```

## Example Output

```
🔍 DevSpaceSaveer - Scanning for space hogs...

Scanning path: /home/user

Scanning Node Modules... ✓
Scanning Build Artifacts... ✓
Scanning Docker Images... ✓
Scanning Caches... ✓

📊 Results:

NODE MODULES:
──────────────────────────────────────────────────
Total Size: 2.5 GB
Items Found: 15

Top Space Hogs:
  • 450.2 MB    /home/user/projects/project1/node_modules
  • 380.5 MB    /home/user/projects/project2/node_modules
  ...

💡 Suggestions:
  → Found 15 node_modules directories
  → Consider using pnpm for centralized package storage (can save up to 50% disk space)
  → Run "npx pnpm install -g pnpm" to install pnpm globally
  → Delete node_modules in unused projects and reinstall when needed

══════════════════════════════════════════════════
Total Reclaimable Space: 4.2 GB
══════════════════════════════════════════════════
```

## Development

```bash
# Clone the repository
git clone https://github.com/gordonkeenan/devspacesaveer.git
cd devspacesaveer

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

## License

ISC
