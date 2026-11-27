#!/usr/bin/env node
// The car tools for headless Claude (service.js runs `claude -p --mcp-config data/tools-mcp.json`, which starts this
// file). Each tool call is passed to the always-on service at V60_API with the secret in V60_API_TOKEN (data/api-token):
// the service owns the phone link, so this process holds no state. stdout belongs to MCP.
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { TOOLS } from './lib.js'

const API = process.env.V60_API || 'http://127.0.0.1:8788'
const TOKEN = process.env.V60_API_TOKEN || ''

const mcp = new Server({ name: 'v60', version: '1.0.0' }, { capabilities: { tools: {} } })
mcp.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    const r = await fetch(API + '/api/tool', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-v60-token': TOKEN },
      body: JSON.stringify({ name: req.params.name, args: req.params.arguments || {} }),
      signal: AbortSignal.timeout(240000), // car_send writes wait up to 3 min for Kyle's tap
    })
    const j = await r.json().catch(() => ({ text: `The service answered ${r.status}.`, isError: true }))
    return { content: [{ type: 'text', text: String(j.text) }], ...(j.isError ? { isError: true } : {}) }
  } catch (e) {
    return { content: [{ type: 'text', text: 'Claude live service not reachable: ' + e.message }], isError: true }
  }
})
await mcp.connect(new StdioServerTransport())
