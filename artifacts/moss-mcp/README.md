# Moss MCP Transaction Preview

A developer-friendly, educational transaction preview tool for Monad/Web3 newcomers.
This standalone React + Vite frontend simulates a transaction confirmation screen, demonstrating how pre-transaction safety checks and simulation results can be displayed clearly to users before they sign.

## Getting Started

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Run Locally
\`\`\`bash
npm run dev
\`\`\`

The app will start on the configured port (usually 5173 or available via Replit).

## Connecting Real Moss MCP & Monad RPC

Currently, this application relies on a mock simulation engine located in `src/lib/mockMcp.ts`. All data is generated client-side.

To connect this frontend to a real backend:
1. Review the `MCPSimulationResult` type in `src/types/mcp.ts` and ensure your backend returns a compatible JSON structure.
2. Replace the `simulateMCP` function in `src/lib/mockMcp.ts` with a real `fetch` call to your Moss MCP integration API.
3. Update `.env` with your actual endpoint URLs.

## Environment Variables
Copy `.env.example` to `.env` and configure your endpoints if modifying the app to use a real backend.
