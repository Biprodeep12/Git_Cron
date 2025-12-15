# Workflow

A TypeScript-based intelligent agent project with tool management and OpenAI integration.

## Project Structure

```
src/
├── core/
│   └── agent.ts              # Core agent implementation
├── tools/
│   ├── webSearch.ts          # Web search tool
│   └── weatherupdate.ts      # Weather update tool
├── plan/
│   └── manifest.json         # Manifest configuration
├── types/
│   └── maniffest.ts          # Type definitions
├── utils/
│   └── saveManifest.ts       # Utility for saving manifest
└── backup/
    └── webSearch.ts.bak      # Backup of previous web search implementation

scripts/
└── addExtensions.cjs         # Build script for extending functionality
```

## Features

- OpenAI integration for intelligent agent capabilities
- Multiple tools: web search and weather updates
- Manifest-based configuration management
- TypeScript support with ESM modules
- Development and production build modes

## Setup

Install dependencies:

```bash
npm install
```

## Running

### Development Mode

Start the agent with live TypeScript execution:

```bash
npm run dev
```

### Production Mode

Build and run the compiled application:

```bash
npm run build
npm start
```

### Scheduled Execution

Run as a cron job:

```bash
npm run cron
```

## Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

This will compile TypeScript files and run the extension build script.

## Configuration

- **tsconfig.json**: TypeScript compiler configuration (ES2020 target, ESM module format)
- **package.json**: Project dependencies and npm scripts
- **src/plan/manifest.json**: Tool and configuration manifest
- **.env**: Environment variables for API keys (create this file locally)
