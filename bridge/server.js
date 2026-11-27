#!/usr/bin/env node
// Claude live as an MCP channel (Claude Code research preview): joins an interactive Claude session on Kyle's PC to
// V60-Link on his phone. Claude Code starts this file (bridge/.mcp.json, server "v60"); start.cmd opens that window.
// Since 2026-11-27 the normal way is service.js (always on, Claude headless, no window, no /mcp); this file stays for
// an interactive session at the PC and for tests/claude.js. The phone side lives in hub.js.
// stdout belongs to MCP. Anything for a human goes to stderr.
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { record } from './lib.js'
import { startHub, INSTRUCTIONS, TOOLS } from './hub.js'

const mcp = new Server(
  { name: 'v60', version: '1.0.0' },
  { capabilities: { experimental: { 'claude/channel': {}, 'claude/channel/permission': {} }, tools: {} }, instructions: INSTRUCTIONS },
)

const hub = startHub({
  wake: (event, content, meta) => mcp.notification({ method: 'notifications/claude/channel', params: { content, meta: { event, ...meta } } }).catch(() => {}),
  onPerm: (id, allow) => mcp.notification({ method: 'notifications/claude/channel/permission', params: { request_id: id, behavior: allow ? 'allow' : 'deny' } }).catch(() => {}),
})

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (!TOOLS.some((t) => t.name === req.params.name)) throw new Error('unknown tool: ' + req.params.name)
  const r = await hub.callTool(req.params.name, req.params.arguments || {})
  return { content: [{ type: 'text', text: r.text }], ...(r.isError ? { isError: true } : {}) }
})

// Claude Code asks this channel to relay tool approvals; they show on the phone as Allow / No.
mcp.setNotificationHandler(z.object({ method: z.literal('notifications/claude/channel/permission_request'), params: z.object({ request_id: z.string(), tool_name: z.string(), description: z.string(), input_preview: z.string() }) }), async ({ params }) => {
  record({ k: 'perm_request', ...params })
  hub.toPhone({ t: 'perm', id: params.request_id, tool: params.tool_name, desc: params.description, preview: params.input_preview })
})

await mcp.connect(new StdioServerTransport())
