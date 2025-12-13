# Workflow

A TypeScript-based project with agent and tool management capabilities.

## Project Structure

```
src/
├── core/
│   └── agent.ts          # Core agent implementation
├── tools/
│   └── webSearch.ts      # Web search tool
├── plan/
│   └── manifest.json     # Manifest configuration
├── types/
│   └── maniffest.ts      # Type definitions
├── utils/
│   └── saveManifest.ts   # Utility for saving manifest
└── backup/
    └── webSearch.ts.bak  # Backup files
```

## Setup

Install dependencies:

```bash
npm install
```

## Building

Compile TypeScript:

```bash
npm run build
```

## Running

Start the agent:

```bash
node --loader ts-node/esm src/core/agent.ts
```

## Configuration

- **tsconfig.json**: TypeScript compiler configuration
- **package.json**: Project dependencies and scripts
- **src/plan/manifest.json**: Manifest configuration file
